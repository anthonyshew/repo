"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MealsPage;
var meal_planner_1 = require("#/components/meal-planner");
var recipe_1 = require("#/components/recipe");
function MealsPage() {
    return (<div className="p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-[32px] items-center sm:items-start w-full max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold">Meals</h1>
				<meal_planner_1.MealPlanner />
				<recipe_1.Recipe />
			</main>
		</div>);
}
