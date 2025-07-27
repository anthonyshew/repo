"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Button } from "@repo/ui/Button";
import { Badge } from "@repo/ui/badge";
import { Calendar } from "@repo/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { CalendarDays, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { mealPlanSchema, mealSchema } from "#/lib/schemas";

export function MealPlanner() {
	const [isRegeneratingFor, setIsRegeneratingFor] = useState<Date | null>(null);
	const [localMeals, setLocalMeals] = useState<Map<string, string>>(new Map());
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(
		new Date(),
	);
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

	// Convert date to a consistent string format for storage
	const dateToKey = useCallback((date: Date) => date.toDateString(), []);

	// Update local meals when main object changes
	useEffect(() => {
		if (object?.meals) {
			const mealMap = new Map<string, string>();
			const today = new Date();

			object.meals.forEach((meal, index) => {
				if (meal?.day && meal?.meal) {
					// Calculate date based on today + index
					const mealDate = new Date(today);
					mealDate.setDate(today.getDate() + index);
					mealMap.set(dateToKey(mealDate), meal.meal);
				}
			});
			setLocalMeals(mealMap);
		}
	}, [object?.meals, dateToKey]);

	// Update the meal plan when a single meal is regenerated
	useEffect(() => {
		if (singleMealObject?.meal && isRegeneratingFor) {
			const newMeal = singleMealObject.meal;
			setLocalMeals((prevMeals) => {
				const newMeals = new Map(prevMeals);
				newMeals.set(dateToKey(isRegeneratingFor), newMeal);
				return newMeals;
			});
			setIsRegeneratingFor(null);
		}
	}, [singleMealObject, isRegeneratingFor, dateToKey]);

	const regenerateSingleMeal = (date: Date) => {
		setIsRegeneratingFor(date);
		const currentMeal = localMeals.get(dateToKey(date));
		const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
		submitSingleMeal(
			`Generate a single meal recommendation for ${dayName}. Provide the day as "${dayName}" and a new meal name. Focus on variety, nutrition, and family-friendly meals for 3 people. Make it different from "${currentMeal}" and common meals like spaghetti, pizza, or tacos.`,
		);
	};

	const generateMealForDate = (date: Date) => {
		const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
		setIsRegeneratingFor(date);
		submitSingleMeal(
			`Generate a single meal recommendation for ${dayName}. Provide the day as "${dayName}" and a new meal name. Focus on variety, nutrition, and family-friendly meals for 3 people.`,
		);
	};

	const selectedMeal = selectedDate
		? localMeals.get(dateToKey(selectedDate))
		: null;

	return (
		<div className="w-full max-w-4xl mx-auto space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CalendarDays className="h-5 w-5" />
						Meal Planning Calendar
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Button
						onClick={generateAIMeals}
						disabled={isLoading}
						className="w-full sm:w-auto"
					>
						{isLoading ? "Generating Meal Plan..." : "Generate New Meal Plan"}
					</Button>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div className="space-y-4">
							<Calendar
								mode="single"
								selected={selectedDate}
								onSelect={setSelectedDate}
								modifiers={{
									noMeal: (date) =>
										!localMeals.has(dateToKey(date)) &&
										date > new Date(new Date().setHours(23, 59, 59, 999)),
									isGenerating: (date) =>
										isRegeneratingFor &&
										dateToKey(date) === dateToKey(isRegeneratingFor),
								}}
								modifiersClassNames={{
									noMeal:
										"relative after:content-[''] after:absolute after:top-1 after:right-1 after:w-2 after:h-2 after:bg-red-500 after:rounded-full after:z-10 after:pointer-events-none",
									isGenerating:
										"bg-yellow-100 text-yellow-800 animate-pulse dark:bg-yellow-900 dark:text-yellow-100",
								}}
								className="rounded-md border"
							/>
						</div>

						<div className="space-y-4">
							{selectedDate && (
								<Card>
									<CardContent className="pt-6">
										<div className="space-y-3">
											<div className="flex items-center justify-between">
												<h3 className="font-semibold">
													{selectedDate.toLocaleDateString("en-US", {
														weekday: "long",
														month: "long",
														day: "numeric",
													})}
												</h3>
												<Badge variant={selectedMeal ? "default" : "secondary"}>
													{selectedMeal ? "Planned" : "No meal"}
												</Badge>
											</div>

											{selectedMeal ? (
												<div className="space-y-3">
													<p className="text-sm text-muted-foreground">
														{selectedMeal}
													</p>
													<Button
														variant="outline"
														size="sm"
														onClick={() => regenerateSingleMeal(selectedDate)}
														disabled={
															(isRegeneratingFor &&
																dateToKey(selectedDate) ===
																	dateToKey(isRegeneratingFor)) ||
															isLoading ||
															isSingleMealLoading
														}
														className="w-full"
													>
														<RefreshCw
															className={`h-4 w-4 mr-2 ${
																isRegeneratingFor &&
																dateToKey(selectedDate) ===
																	dateToKey(isRegeneratingFor)
																	? "animate-spin"
																	: ""
															}`}
														/>
														Generate New Meal
													</Button>
												</div>
											) : (
												<Button
													onClick={() => generateMealForDate(selectedDate)}
													disabled={
														(isRegeneratingFor &&
															dateToKey(selectedDate) ===
																dateToKey(isRegeneratingFor)) ||
														isLoading ||
														isSingleMealLoading
													}
													className="w-full"
												>
													{isRegeneratingFor &&
													dateToKey(selectedDate) ===
														dateToKey(isRegeneratingFor)
														? "Generating..."
														: "Generate Meal"}
												</Button>
											)}
										</div>
									</CardContent>
								</Card>
							)}

							{localMeals.size > 0 && (
								<Card>
									<CardHeader>
										<CardTitle className="text-base">Upcoming Meals</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-2 max-h-64 overflow-y-auto">
											{Array.from(localMeals.entries())
												.sort(
													([a], [b]) =>
														new Date(a).getTime() - new Date(b).getTime(),
												)
												.slice(0, 7)
												.map(([dateKey, meal]) => {
													const date = new Date(dateKey);
													return (
														<button
															key={dateKey}
															type="button"
															className="flex items-center justify-between p-2 rounded-md border cursor-pointer hover:bg-muted/50 w-full text-left"
															onClick={() => setSelectedDate(date)}
														>
															<div>
																<p className="text-sm font-medium">
																	{date.toLocaleDateString("en-US", {
																		weekday: "short",
																		month: "short",
																		day: "numeric",
																	})}
																</p>
																<p className="text-xs text-muted-foreground">
																	{meal}
																</p>
															</div>
														</button>
													);
												})}
										</div>
									</CardContent>
								</Card>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
