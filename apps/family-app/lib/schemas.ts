import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { meals } from "./db/schema";

// Derive schemas from Drizzle table
export const insertMealSchema = createInsertSchema(meals);
export const selectMealSchema = createSelectSchema(meals);

// For AI generation, transform between date strings and unix timestamps
export const mealSchema = z
	.object({
		day: z
			.string()
			.describe("Date in YYYY-MM-DD format")
			.transform((dateStr) => {
				return Math.floor(new Date(dateStr).getTime() / 1000);
			}),
		meal: z.string().describe("Name of the meal"),
	})
	.transform((data) => ({
		name: data.meal,
		day: data.day,
	}));

export type Meal = z.infer<typeof selectMealSchema>;

export const mealPlanSchema = z.object({
	meals: z.array(mealSchema).describe("Weekly meal plan"),
});

export type MealPlan = z.infer<typeof mealPlanSchema>;

export const recipeSchema = z.object({
	mealName: z.string().describe("Name of the meal"),
	ingredients: z.array(z.string()).describe("List of ingredients"),
	instructions: z
		.array(z.string())
		.describe("Step-by-step cooking instructions"),
	prepTime: z.string().describe("Preparation time"),
	cookTime: z.string().describe("Cooking time"),
	servings: z.number().describe("Number of servings"),
});

export type RecipeType = z.infer<typeof recipeSchema>;
