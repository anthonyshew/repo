"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recipeSchema = exports.mealPlanSchema = exports.convertMealForInsert = exports.mealSchema = exports.selectMealSchema = exports.insertMealSchema = void 0;
var drizzle_zod_1 = require("drizzle-zod");
var zod_1 = require("zod");
var schema_1 = require("./db/schema");
// Derive schemas from Drizzle table
exports.insertMealSchema = (0, drizzle_zod_1.createInsertSchema)(schema_1.meals);
exports.selectMealSchema = (0, drizzle_zod_1.createSelectSchema)(schema_1.meals);
exports.mealSchema = zod_1.z.object({
    name: zod_1.z.string().describe("Name of the meal"),
    recipe: zod_1.z.string().describe("Recipe description").default(""),
});
// Type-safe converter that adds date when converting to database format
var convertMealForInsert = function (meal, timestamp) {
    // Validate that day is a proper Unix timestamp
    var validatedDay = zod_1.z
        .number()
        .int()
        .positive()
        .describe("Unix timestamp in seconds")
        .parse(timestamp);
    return {
        name: meal.name,
        day: validatedDay,
        recipe: meal.recipe,
    };
};
exports.convertMealForInsert = convertMealForInsert;
exports.mealPlanSchema = zod_1.z.object({
    meals: zod_1.z.array(exports.mealSchema).describe("Weekly meal plan"),
});
exports.recipeSchema = zod_1.z.object({
    mealName: zod_1.z.string().describe("Name of the meal"),
    ingredients: zod_1.z.array(zod_1.z.string()).describe("List of ingredients"),
    instructions: zod_1.z
        .array(zod_1.z.string())
        .describe("Step-by-step cooking instructions"),
    prepTime: zod_1.z.string().describe("Preparation time"),
    cookTime: zod_1.z.string().describe("Cooking time"),
    servings: zod_1.z.number().describe("Number of servings"),
});
