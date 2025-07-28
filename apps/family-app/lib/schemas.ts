import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { meals } from "./db/schema";

// Utility type for creating AI-compatible schemas that stay in sync with Drizzle
// biome-ignore lint/complexity/noBannedTypes: It's what I want.
type AICompatibleSchema<TDrizzle, TOverrides = {}> = {
	[K in keyof TDrizzle]: K extends keyof TOverrides
		? TOverrides[K]
		: TDrizzle[K];
};

// Derive schemas from Drizzle table
export const insertMealSchema = createInsertSchema(meals);
export const selectMealSchema = createSelectSchema(meals);

// Get the exact shape from Drizzle insert schema
type DrizzleInsertMeal = z.infer<typeof insertMealSchema>;

// Create AI schema that must match Drizzle structure, but with string day for JSON Schema compatibility
export const mealSchema = z.object({
	test: z.string(),
	name: z.string().describe("Name of the meal"),
	day: z.string().describe("Date in YYYY-MM-DD format"),
	recipe: z.string().describe("Recipe description").default(""),
}) satisfies z.ZodType<
	AICompatibleSchema<
		DrizzleInsertMeal,
		{
			day: string; // Override: string instead of number for JSON Schema compatibility
		}
	>
>;

// Type-safe converter that must satisfy both input and output types
export const convertMealForInsert = (
	meal: z.infer<typeof mealSchema>,
): DrizzleInsertMeal => ({
	name: meal.name,
	day: Math.floor(new Date(meal.day).getTime() / 1000),
	recipe: meal.recipe,
	// If you add fields to DrizzleInsertMeal, TypeScript will force you to handle them here
});

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
