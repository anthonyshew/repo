"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import { mealPlanSchema, mealSchema } from "../lib/schemas";
import type { Meal } from "../lib/types";

export function MealPlanner() {
	const [isRegeneratingFor, setIsRegeneratingFor] = useState<string | null>(
		null,
	);
	const [localMeals, setLocalMeals] = useState<Meal[]>([]);
	const { object, submit, isLoading } = useObject({
		api: "/api/meals/week",
		schema: mealPlanSchema,
	});

	const {
		object: singleMealObject,
		submit: submitSingleMeal,
		isLoading: isSingleMealLoading,
	} = useObject({
		api: "/api/meals/day",
		schema: mealSchema,
	});

	const generateAIMeals = () => {
		setIsRegeneratingFor(null);
		submit(
			"Generate a weekly dinner plan with simple, delicious, and healthy meals for 3 people.",
		);
	};

	// Update local meals when main object changes
	useEffect(() => {
		if (object?.meals) {
			const validMeals = object.meals.filter(
				(meal): meal is Meal =>
					meal !== undefined &&
					meal.day !== undefined &&
					meal.meal !== undefined,
			);
			setLocalMeals(validMeals);
		}
	}, [object?.meals]);

	// Update the meal plan when a single meal is regenerated
	useEffect(() => {
		if (singleMealObject?.meal && isRegeneratingFor) {
			const newMeal = singleMealObject.meal;
			setLocalMeals((prevMeals) =>
				prevMeals.map((meal) =>
					meal.day === isRegeneratingFor ? { ...meal, meal: newMeal } : meal,
				),
			);
			setIsRegeneratingFor(null);
		}
	}, [singleMealObject, isRegeneratingFor]);

	const regenerateSingleMeal = (dayToRegenerate: string) => {
		setIsRegeneratingFor(dayToRegenerate);
		const currentMeal = localMeals.find((m) => m.day === dayToRegenerate)?.meal;
		submitSingleMeal(
			`Generate a single meal recommendation for ${dayToRegenerate}. Provide the day as "${dayToRegenerate}" and a new meal name. Focus on variety, nutrition, and family-friendly meals for 3 people. Make it different from "${currentMeal}" and common meals like spaghetti, pizza, or tacos.`,
		);
	};
	return (
		<div className="w-full max-w-2xl mx-auto mb-8 p-4 border rounded-lg bg-white dark:bg-gray-900">
			<h3 className="text-lg font-semibold mb-4">Weekly Meal Plan</h3>

			<div className="mb-4">
				<button
					type="button"
					onClick={generateAIMeals}
					disabled={isLoading}
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
				>
					{isLoading ? "Generating Meal Plan..." : "Generate New Meal Plan"}
				</button>
			</div>

			<ul className="space-y-2">
				{localMeals.map((meal) => (
					<li
						key={meal.day}
						className="p-3 bg-gray-50 dark:bg-gray-800 rounded border-l-4 border-blue-500"
					>
						<div className="flex justify-between items-start">
							<div className="flex-1">
								<div className="font-semibold text-blue-600 dark:text-blue-400">
									{meal.day}
								</div>
								<div className="text-gray-800 dark:text-gray-200">
									{meal.meal}
								</div>
							</div>
							<button
								type="button"
								onClick={() => regenerateSingleMeal(meal.day)}
								disabled={
									isRegeneratingFor === meal.day ||
									isLoading ||
									isSingleMealLoading
								}
								className="ml-2 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
								title="Regenerate this meal"
							>
								{isRegeneratingFor === meal.day ? "⏳" : "🔄"}
							</button>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
