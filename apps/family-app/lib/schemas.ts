import { z } from "zod";

export const mealPlanSchema = z.object({
	meals: z
		.array(
			z.object({
				day: z.string().describe("Day of the week"),
				meal: z.string().describe("Name of the meal"),
			}),
		)
		.describe("Weekly meal plan"),
});

export const singleMealSchema = z.object({
	day: z.string().describe("Day of the week"),
	meal: z.string().describe("Name of the meal"),
});