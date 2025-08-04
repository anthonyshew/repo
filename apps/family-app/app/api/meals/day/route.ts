import { generateObject } from "ai";
import { Effect } from "effect";
import { db, meals } from "#/lib/db";
import { convertMealForInsert, mealSchema } from "#/lib/schemas";

export const maxDuration = 30;

export async function POST(request: Request) {
	const { prompt, date } = await request.json();

	const generateSingleMeal = Effect.gen(function* () {
		const mealDate = date || Math.floor(Date.now() / 1000); // Use provided timestamp or default to today
		const result = yield* Effect.promise(() =>
			generateObject({
				model: "xai/grok-3",
				prompt:
					prompt ||
					"Generate a single meal recommendation for dinner. Focus on variety, nutrition, and family-friendly meals for 3 people.",
				schema: mealSchema,
			}),
		);

		// Save to database with the specified date
		if (result.object) {
			yield* Effect.promise(async () => {
				const insertResult = await db
					.insert(meals)
					.values(convertMealForInsert(result.object, mealDate));
				return insertResult;
			});
		}

		return result.toJsonResponse();
	});

	const result = await Effect.runPromise(
		Effect.catchAll(generateSingleMeal, (error) =>
			Effect.sync(() => {
				console.error("Error in POST handler:", error);
				return new Response("Internal server error", { status: 500 });
			}),
		),
	);

	return result;
}
