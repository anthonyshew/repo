"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useState } from "react";
import type { Meal } from "../lib/types";
import { mealPlanSchema } from "../lib/schemas";

export function MealPlanner() {
	const [isRegeneratingFor, setIsRegeneratingFor] = useState<string | null>(
		null,
	);
	const { object, submit, isLoading } = useObject({
		api: "/api/meals",
		schema: mealPlanSchema,
	});

	const generateAIMeals = () => {
		setIsRegeneratingFor(null);
		submit("Generate a weekly dinner plan with simple, delicious, and healthy meals for 3 people.");
	};

	const meals = object?.meals || [];

	const regenerateSingleMeal = (dayToRegenerate: string) => {
		setIsRegeneratingFor(dayToRegenerate);
		submit(`Generate a new weekly meal plan, but change only ${dayToRegenerate} to a different meal. Keep all other days the same as: ${meals.filter(m => m.day !== dayToRegenerate).map(m => `${m.day}: ${m.meal}`).join(", ")}`);
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
				{meals.map((meal) => (
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
								disabled={isRegeneratingFor === meal.day || isLoading}
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