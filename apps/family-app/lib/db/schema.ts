import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const meals = sqliteTable("meals", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	day: integer("day").notNull(),
	recipe: text("recipe").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const ingredients = sqliteTable("ingredients", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	mealId: integer("meal_id")
		.notNull()
		.references(() => meals.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	quantity: text("quantity"),
	unit: text("unit"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const mealsRelations = relations(meals, ({ many }) => ({
	ingredients: many(ingredients),
}));

export const ingredientsRelations = relations(ingredients, ({ one }) => ({
	meal: one(meals, {
		fields: [ingredients.mealId],
		references: [meals.id],
	}),
}));

export type Meal = typeof meals.$inferSelect;
export type NewMeal = typeof meals.$inferInsert;
export type Ingredient = typeof ingredients.$inferSelect;
export type NewIngredient = typeof ingredients.$inferInsert;
