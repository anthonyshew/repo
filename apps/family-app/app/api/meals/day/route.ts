import { generateObject } from "ai";
import { Effect } from "effect";
import { db, meals } from "#/lib/db";
import { mealSchema } from "#/lib/schemas";

export const maxDuration = 30;

export async function POST(request: Request) {
	const { prompt } = await request.json();

	const generateSingleMeal = Effect.gen(function* () {
		const result = yield* Effect.promise(() =>
			generateObject({
				model: "xai/grok-3",
				prompt:
					prompt ||
					"Generate a single meal recommendation for dinner. Focus on variety, nutrition, and family-friendly meals for 3 people.",
				schema: mealSchema,
			}),
		);

		// Save to database
		if (result.object) {
			yield* Effect.promise(async () => {
				const insertResult = await db.insert(meals).values({
					name: result.object.name,
					day: result.object.day,
					recipe: "", // Will be filled when recipe is generated
				});
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
