import { generateObject } from "ai";
import { Effect } from "effect";
import { db, meals } from "#/lib/db";
import { mealPlanSchema, convertMealForInsert } from "#/lib/schemas";

export const maxDuration = 30;

export async function POST(request: Request) {
	const { prompt } = await request.json();

	const generateMealPlan = Effect.gen(function* () {
		const result = yield* Effect.promise(() =>
			generateObject({
				model: "xai/grok-3",
				prompt:
					prompt ||
					"You are a personal chef for our family. Create a weekly dinner plan with simple, delicious, and healthy meals for 3 people. Provide the day of the week and meal name only.",
				schema: mealPlanSchema,
			}),
		);

		// Save each meal to database
		if (result.object?.meals) {
			const mealInserts = result.object.meals.map(convertMealForInsert);

			yield* Effect.promise(async () => {
				const insertResult = await db.insert(meals).values(mealInserts);
				return insertResult;
			});
		}

		return result.toJsonResponse();
	});

	const result = await Effect.runPromise(
		Effect.catchAll(generateMealPlan, (error) =>
			Effect.sync(() => {
				console.error("Error in POST handler:", error);
				return new Response("Internal server error", { status: 500 });
			}),
		),
	);

	return result;
}
