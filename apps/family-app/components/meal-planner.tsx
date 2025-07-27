"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Button } from "@repo/ui/Button";
import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import type { Meal } from "#/lib/schemas";
import { mealPlanSchema, mealSchema } from "#/lib/schemas";

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
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle>Weekly Meal Plan</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<Button
					onClick={generateAIMeals}
					disabled={isLoading}
					className="w-full sm:w-auto"
				>
					{isLoading ? "Generating Meal Plan..." : "Generate New Meal Plan"}
				</Button>

				<div className="space-y-3">
					{localMeals.map((meal) => (
						<Card key={meal.day} className="border-l-4 border-l-blue-500">
							<CardContent className="pt-4">
								<div className="flex justify-between items-start">
									<div className="flex-1 space-y-1">
										<Badge variant="secondary" className="text-blue-600">
											{meal.day}
										</Badge>
										<p className="text-sm text-muted-foreground">{meal.meal}</p>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => regenerateSingleMeal(meal.day)}
										disabled={
											isRegeneratingFor === meal.day ||
											isLoading ||
											isSingleMealLoading
										}
										title="Regenerate this meal"
									>
										<RefreshCw
											className={`h-4 w-4 ${
												isRegeneratingFor === meal.day ? "animate-spin" : ""
											}`}
										/>
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
