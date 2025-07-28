import { generateObject } from "ai";
import { Effect } from "effect";
import { db, meals } from "#/lib/db";
import { convertMealForInsert, mealPlanSchema } from "#/lib/schemas";

export const maxDuration = 30;

export async function POST(request: Request) {
	const { prompt } = await request.json();

	const generateMealPlan = Effect.gen(function* () {
		const result = yield* Effect.promise(() =>
			generateObject({
				model: "xai/grok-3",
				prompt:
					prompt ||
					"You are a personal chef for our family. Create a weekly dinner plan with simple, delicious, and healthy meals for 3 people. Generate 7 different meals with variety and nutrition in mind.",
				schema: mealPlanSchema,
			}),
		);

		// Save each meal to database with sequential dates starting from today
		if (result.object?.meals) {
			const todayTimestamp = Math.floor(Date.now() / 1000);
			const oneDayInSeconds = 24 * 60 * 60;
			
			const mealInserts = result.object.meals.map((meal, index) => 
				convertMealForInsert(meal, todayTimestamp + (index * oneDayInSeconds))
			);

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
