import { generateObject } from "ai";
import { Effect } from "effect";
import { recipeSchema } from "../../../lib/schemas";

export const maxDuration = 30;

export async function POST(request: Request) {
	const { mealName } = await request.json();

	const generateRecipe = Effect.gen(function* () {
		const result = yield* Effect.promise(() =>
			generateObject({
				model: "xai/grok-3",
				prompt: `Generate a detailed recipe for "${mealName}". Include a complete ingredient list with measurements, step-by-step cooking instructions, preparation time, cooking time, and number of servings. Make it family-friendly for 3 people.`,
				schema: recipeSchema,
			}),
		);

		return result.toJsonResponse();
	});

	const result = await Effect.runPromise(
		Effect.catchAll(generateRecipe, (error) =>
			Effect.sync(() => {
				console.error("Error in POST handler:", error);
				return new Response("Internal server error", { status: 500 });
			}),
		),
	);

	return result;
}