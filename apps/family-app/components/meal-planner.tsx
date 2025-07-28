"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Button } from "@repo/ui/Button";
import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { CalendarDays, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Meal } from "#/lib/db";
import { mealSchema } from "#/lib/schemas";

export function MealPlanner() {
	const [isRegeneratingFor, setIsRegeneratingFor] = useState<Date | null>(null);
	const [dbMeals, setDbMeals] = useState<Meal[]>([]);

	const {
		object: singleMealObject,
		submit: submitSingleMeal,
		isLoading: isSingleMealLoading,
	} = useObject({
		api: "/api/meals/day",
		schema: mealSchema,
	});

	// Fetch meals from database
	const fetchDbMeals = useCallback(async () => {
		try {
			const response = await fetch("/api/meals");
			if (response.ok) {
				const meals: Meal[] = await response.json();
				setDbMeals(meals);
			}
		} catch (error) {
			console.error("Failed to fetch meals:", error);
		}
	}, []);

	// Load meals from database on component mount
	useEffect(() => {
		void fetchDbMeals();
	}, [fetchDbMeals]);

	// Convert date to a consistent string format for storage
	const dateToKey = useCallback((date: Date) => date.toDateString(), []);

	// Update the meal plan when a single meal is regenerated and refresh database
	useEffect(() => {
		if (singleMealObject?.name && isRegeneratingFor) {
			setIsRegeneratingFor(null);
			// Refresh database meals after single meal generation
			void fetchDbMeals();
		}
	}, [singleMealObject, isRegeneratingFor, fetchDbMeals]);

	const regenerateSingleMeal = (date: Date) => {
		setIsRegeneratingFor(date);
		const currentMeal = allMeals.get(dateToKey(date));
		const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
		const timestamp = Math.floor(date.getTime() / 1000);
		submitSingleMeal({
			prompt: `Generate a single meal recommendation for ${dayName}. Focus on variety, nutrition, and family-friendly meals for 3 people. Make it different from "${currentMeal}" and common meals like spaghetti, pizza, or tacos.`,
			date: timestamp,
		});
	};

	const generateMealForDate = (date: Date) => {
		const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
		const timestamp = Math.floor(date.getTime() / 1000);
		setIsRegeneratingFor(date);
		submitSingleMeal({
			prompt: `Generate a single meal recommendation for ${dayName}. Focus on variety, nutrition, and family-friendly meals for 3 people.`,
			date: timestamp,
		});
	};

	// Create meals map from database only
	const combinedMeals = useCallback(() => {
		const combined = new Map<string, string>();

		// Add database meals, which use unix timestamps for dates
		dbMeals.forEach((meal) => {
			// Convert unix timestamp to date
			const mealDate = new Date(meal.day * 1000);
			combined.set(dateToKey(mealDate), meal.name);
		});

		return combined;
	}, [dbMeals, dateToKey]);

	const allMeals = combinedMeals();

	// Generate array of next 7 days starting from today
	const getNext7Days = () => {
		const days = [];
		const today = new Date();
		for (let i = 0; i < 7; i++) {
			const date = new Date(today);
			date.setDate(today.getDate() + i);
			days.push(date);
		}
		return days;
	};

	return (
		<div className="w-full max-w-4xl mx-auto space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CalendarDays className="h-5 w-5" />
						Meal Planning
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-3">
						{getNext7Days().map((date) => {
							const dateKey = dateToKey(date);
							const meal = allMeals.get(dateKey);
							const isGenerating =
								isRegeneratingFor && dateToKey(isRegeneratingFor) === dateKey;

							return (
								<Card key={dateKey} className="p-4">
									<div className="flex items-center justify-between">
										<div className="flex-1">
											<h3 className="font-semibold text-lg">
												{date.toLocaleDateString("en-US", {
													weekday: "long",
													month: "long",
													day: "numeric",
												})}
											</h3>
											{meal ? (
												<p className="text-muted-foreground mt-1">{meal}</p>
											) : (
												<p className="text-muted-foreground mt-1 italic">
													No meal planned
												</p>
											)}
										</div>

										<div className="flex items-center gap-2">
											<Badge variant={meal ? "default" : "secondary"}>
												{meal ? "Planned" : "No meal"}
											</Badge>

											{meal ? (
												<Button
													variant="outline"
													size="sm"
													onClick={() => regenerateSingleMeal(date)}
													disabled={isGenerating || isSingleMealLoading}
												>
													<RefreshCw
														className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`}
													/>
													{isGenerating ? "Generating..." : "Regenerate"}
												</Button>
											) : (
												<Button
													size="sm"
													onClick={() => generateMealForDate(date)}
													disabled={isGenerating || isSingleMealLoading}
												>
													{isGenerating ? "Generating..." : "Generate"}
												</Button>
											)}
										</div>
									</div>
								</Card>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
