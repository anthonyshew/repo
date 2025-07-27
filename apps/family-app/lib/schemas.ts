import { z } from "zod";

export const mealSchema = z.object({
	day: z.string().describe("Day of the week"),
	meal: z.string().describe("Name of the meal"),
});

export const mealPlanSchema = z.object({
	meals: z.array(mealSchema).describe("Weekly meal plan"),
});

export const recipeSchema = z.object({
	mealName: z.string().describe("Name of the meal"),
	ingredients: z.array(z.string()).describe("List of ingredients"),
	instructions: z.array(z.string()).describe("Step-by-step cooking instructions"),
	prepTime: z.string().describe("Preparation time"),
	cookTime: z.string().describe("Cooking time"),
	servings: z.number().describe("Number of servings"),
});
