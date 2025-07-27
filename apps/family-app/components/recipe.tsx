"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useState } from "react";
import { recipeSchema } from "#/lib/schemas";
import type { RecipeType } from "#/lib/types";

export function Recipe() {
	const [selectedMeal, setSelectedMeal] = useState("");
	const [currentRecipe, setCurrentRecipe] = useState<RecipeType | null>(null);

	const { object, submit, isLoading } = useObject({
		api: "/api/recipe",
		schema: recipeSchema,
		onFinish: (result) => {
			if (result.object) {
				setCurrentRecipe(result.object);
			}
		},
	});

	const generateRecipe = () => {
		if (!selectedMeal.trim()) return;
		submit({ mealName: selectedMeal });
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !isLoading) {
			generateRecipe();
		}
	};

	return (
		<div className="w-full max-w-2xl mx-auto mb-8 p-4 border rounded-lg bg-white dark:bg-gray-900">
			<h3 className="text-lg font-semibold mb-4">Recipe Generator</h3>

			<div className="mb-4 flex gap-2">
				<input
					type="text"
					value={selectedMeal}
					onChange={(e) => setSelectedMeal(e.target.value)}
					onKeyPress={handleKeyPress}
					placeholder="Enter a meal name (e.g., Chicken Parmesan)"
					className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
					disabled={isLoading}
				/>
				<button
					type="button"
					onClick={generateRecipe}
					disabled={isLoading || !selectedMeal.trim()}
					className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
				>
					{isLoading ? "Generating..." : "Get Recipe"}
				</button>
			</div>

			{(currentRecipe || object) && (
				<div className="space-y-4">
					<div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
						<h4 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
							{(currentRecipe || object)?.mealName}
						</h4>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
							<div className="flex items-center">
								<span className="font-semibold">Prep Time:</span>
								<span className="ml-2">
									{(currentRecipe || object)?.prepTime}
								</span>
							</div>
							<div className="flex items-center">
								<span className="font-semibold">Cook Time:</span>
								<span className="ml-2">
									{(currentRecipe || object)?.cookTime}
								</span>
							</div>
							<div className="flex items-center">
								<span className="font-semibold">Servings:</span>
								<span className="ml-2">
									{(currentRecipe || object)?.servings}
								</span>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<h5 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
									Ingredients:
								</h5>
								<ul className="space-y-1">
									{(currentRecipe || object)?.ingredients?.map((ingredient) => (
										<li key={ingredient} className="flex items-start">
											<span className="text-green-500 mr-2">•</span>
											<span className="text-gray-700 dark:text-gray-300">
												{ingredient}
											</span>
										</li>
									))}
								</ul>
							</div>

							<div>
								<h5 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
									Instructions:
								</h5>
								<ol className="space-y-2">
									{(currentRecipe || object)?.instructions?.map(
										(instruction, index) => (
											<li key={instruction} className="flex items-start">
												<span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
													{index + 1}
												</span>
												<span className="text-gray-700 dark:text-gray-300">
													{instruction}
												</span>
											</li>
										),
									)}
								</ol>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
