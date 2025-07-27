import { generateObject } from "ai";
import { z } from "zod";
import { Effect } from "effect";

export const maxDuration = 30;

export async function POST() {
	const generateMealPlan = Effect.gen(function* () {
		const mealPlanSchema = z.object({
			meals: z
				.array(
					z.object({
						day: z.string().describe("Day of the week"),
						meal: z.string().describe("Name of the meal"),
					}),
				)
				.describe("Weekly meal plan"),
		});

		const result = yield* Effect.promise(() =>
			generateObject({
				model: "xai/grok-3",
				prompt:
					"You are a personal chef for our family. Create a weekly dinner plan with simple, delicious, and healthy meals for 3 people. Provide the day of the week and meal name only.",
				schema: mealPlanSchema,
			})
		);

		return result.object;
	});

	const result = await Effect.runPromise(
		Effect.catchAll(generateMealPlan, (error) =>
			Effect.sync(() => {
				console.error("Error in POST handler:", error);
				return { error: "Internal server error", status: 500 };
			})
		)
	);

	if ("error" in result) {
		return new Response(result.error, { status: result.status });
	}

	return Response.json(result);
}
