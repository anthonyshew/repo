"use client";

import { MealPlanner } from "#/components/meal-planner";
import { Recipe } from "#/components/recipe";

export default function MealsPage() {
	return (
		<div className="p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-[32px] items-center sm:items-start w-full max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold">Meals</h1>
				<MealPlanner />
				<Recipe />
			</main>
		</div>
	);
}
