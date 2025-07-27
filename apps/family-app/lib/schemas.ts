import { z } from "zod";

export const mealSchema = z.object({
	day: z.string().describe("Day of the week"),
	meal: z.string().describe("Name of the meal"),
});

export const mealPlanSchema = z.object({
	meals: z.array(mealSchema).describe("Weekly meal plan"),
});
