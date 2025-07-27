import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST() {
	try {
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

		const result = await generateObject({
			model: "xai/grok-3",
			prompt:
				"You are a personal chef for our family. Create a weekly dinner plan with simple, delicious, and healthy meals for 3 people. Provide the day of the week and meal name only.",
			schema: mealPlanSchema,
		});

		return Response.json(result.object);
	} catch (error) {
		console.error("Error in POST handler:", error);
		return new Response("Internal server error", { status: 500 });
	}
}
