"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingredientsRelations = exports.mealsRelations = exports.ingredients = exports.meals = void 0;
var drizzle_orm_1 = require("drizzle-orm");
var sqlite_core_1 = require("drizzle-orm/sqlite-core");
exports.meals = (0, sqlite_core_1.sqliteTable)("meals", {
    id: (0, sqlite_core_1.integer)("id").primaryKey({ autoIncrement: true }),
    name: (0, sqlite_core_1.text)("name").notNull(),
    day: (0, sqlite_core_1.integer)("day").notNull(),
    recipe: (0, sqlite_core_1.text)("recipe").notNull(),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" })
        .notNull()
        .default((0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["(unixepoch())"], ["(unixepoch())"])))),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" })
        .notNull()
        .default((0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["(unixepoch())"], ["(unixepoch())"])))),
});
exports.ingredients = (0, sqlite_core_1.sqliteTable)("ingredients", {
    id: (0, sqlite_core_1.integer)("id").primaryKey({ autoIncrement: true }),
    mealId: (0, sqlite_core_1.integer)("meal_id")
        .notNull()
        .references(function () { return exports.meals.id; }, { onDelete: "cascade" }),
    name: (0, sqlite_core_1.text)("name").notNull(),
    quantity: (0, sqlite_core_1.text)("quantity"),
    unit: (0, sqlite_core_1.text)("unit"),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" })
        .notNull()
        .default((0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["(unixepoch())"], ["(unixepoch())"])))),
});
exports.mealsRelations = (0, drizzle_orm_1.relations)(exports.meals, function (_a) {
    var many = _a.many;
    return ({
        ingredients: many(exports.ingredients),
    });
});
exports.ingredientsRelations = (0, drizzle_orm_1.relations)(exports.ingredients, function (_a) {
    var one = _a.one;
    return ({
        meal: one(exports.meals, {
            fields: [exports.ingredients.mealId],
            references: [exports.meals.id],
        }),
    });
});
var templateObject_1, templateObject_2, templateObject_3;
