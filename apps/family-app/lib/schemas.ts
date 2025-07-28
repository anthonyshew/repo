import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { meals } from "./db/schema";

// Derive schemas from Drizzle table
export const insertMealSchema = createInsertSchema(meals);
export const selectMealSchema = createSelectSchema(meals);

// Get the exact shape from Drizzle insert schema
type DrizzleInsertMeal = z.infer<typeof insertMealSchema>;

// AI schema for generating meal content only (no dates)
export const mealSchema = z.object({
	name: z.string().describe("Name of the meal"),
	recipe: z.string().describe("Recipe description").default(""),
});

// Type-safe converter that adds date when converting to database format
export const convertMealForInsert = (
	meal: z.infer<typeof mealSchema>,
	day: number, // Unix timestamp provided by caller
): DrizzleInsertMeal => {
	return {
		name: meal.name,
		day: day,
		recipe: meal.recipe,
	};
};

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
