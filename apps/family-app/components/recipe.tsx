"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Button } from "@repo/ui/Button";
import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Separator } from "@repo/ui/separator";
import { ChefHat, Clock, Users } from "lucide-react";
import { useState } from "react";
import type { RecipeType } from "#/lib/schemas";
import { recipeSchema } from "#/lib/schemas";

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
		<Card className="w-full max-w-4xl mx-auto">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ChefHat className="h-5 w-5" />
					Recipe Generator
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="flex gap-2">
					<Input
						type="text"
						value={selectedMeal}
						onChange={(e) => setSelectedMeal(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Enter a meal name (e.g., Chicken Parmesan)"
						disabled={isLoading}
						className="flex-1"
					/>
					<Button
						onClick={generateRecipe}
						disabled={isLoading || !selectedMeal.trim()}
					>
						{isLoading ? "Generating..." : "Get Recipe"}
					</Button>
				</div>

				{(currentRecipe || object) && (
					<Card>
						<CardHeader>
							<CardTitle className="text-2xl text-green-600">
								{(currentRecipe || object)?.mealName}
							</CardTitle>
							<div className="flex flex-wrap gap-4">
								<Badge variant="outline" className="flex items-center gap-1">
									<Clock className="h-3 w-3" />
									Prep: {(currentRecipe || object)?.prepTime}
								</Badge>
								<Badge variant="outline" className="flex items-center gap-1">
									<Clock className="h-3 w-3" />
									Cook: {(currentRecipe || object)?.cookTime}
								</Badge>
								<Badge variant="outline" className="flex items-center gap-1">
									<Users className="h-3 w-3" />
									Serves: {(currentRecipe || object)?.servings}
								</Badge>
							</div>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
								<div className="space-y-3">
									<h5 className="font-semibold text-lg">Ingredients</h5>
									<Separator />
									<ul className="space-y-2">
										{(currentRecipe || object)?.ingredients?.map(
											(ingredient) => (
												<li key={ingredient} className="flex items-start gap-2">
													<span className="text-green-500 mt-1">•</span>
													<span className="text-sm">{ingredient}</span>
												</li>
											),
										)}
									</ul>
								</div>

								<div className="space-y-3">
									<h5 className="font-semibold text-lg">Instructions</h5>
									<Separator />
									<ol className="space-y-3">
										{(currentRecipe || object)?.instructions?.map(
											(instruction, index) => (
												<li
													key={instruction}
													className="flex items-start gap-3"
												>
													<Badge
														variant="default"
														className="min-w-[24px] h-6 rounded-full flex items-center justify-center text-xs"
													>
														{index + 1}
													</Badge>
													<span className="text-sm leading-relaxed">
														{instruction}
													</span>
												</li>
											),
										)}
									</ol>
								</div>
							</div>
						</CardContent>
					</Card>
				)}
			</CardContent>
		</Card>
	);
}
