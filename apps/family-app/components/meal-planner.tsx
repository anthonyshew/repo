"use client";

import { useChat } from "@ai-sdk/react";
import { Effect } from "effect";
import { useCallback, useEffect, useState } from "react";
import type { Meal } from "../lib/types";

export function MealPlanner() {
	const [meals, setMeals] = useState<Meal[]>([]);
	const [isRegeneratingFor, setIsRegeneratingFor] = useState<string | null>(
		null,
	);
	const [isGenerating, setIsGenerating] = useState(false);
	const { messages, sendMessage, status } = useChat();

	const generateAIMeals = useCallback(async () => {
		setIsRegeneratingFor(null);
		setIsGenerating(true);

		const fetchMeals = Effect.gen(function* () {
			const response = yield* Effect.promise(() =>
				fetch("/api/meals", { method: "POST" }),
			);

			if (response.ok) {
				const data = yield* Effect.promise(() => response.json());
				return data.meals;
			}
			return yield* Effect.fail(new Error("Failed to fetch meals"));
		});

		const result = await Effect.runPromise(
			Effect.catchAll(fetchMeals, (error) =>
				Effect.sync(() => {
					console.error(error);
					return null;
				}),
			),
		);

		if (result) {
			setMeals(result);
		}
		setIsGenerating(false);
	}, []);

	// Parse meals from the latest assistant message
	const parseMealsFromMessages = useCallback(() => {
		const lastAssistantMessage = messages
			.filter((m) => m.role === "assistant")
			.pop();

		if (!lastAssistantMessage) return;

		const content =
			lastAssistantMessage.parts
				?.map((part) => (part.type === "text" ? part.text : ""))
				.join("") || "";

		// Check if this is a single meal regeneration
		if (isRegeneratingFor) {
			// For single meal regeneration, the content should just be the meal name
			const mealName = content.trim();
			if (mealName) {
				setMeals((prevMeals) =>
					prevMeals.map((meal) =>
						meal.day === isRegeneratingFor ? { ...meal, meal: mealName } : meal,
					),
				);
				setIsRegeneratingFor(null);
				return;
			}
		}

		// Try to parse as JSON first (structured output)
		const parseJson = Effect.gen(function* () {
			const parsed = yield* Effect.promise(() =>
				Promise.resolve(JSON.parse(content)),
			);
			if (parsed.meals && Array.isArray(parsed.meals)) {
				return parsed.meals;
			}
			return yield* Effect.fail(new Error("Invalid meal structure"));
		});

		const jsonResult = Effect.runSync(
			Effect.catchAll(parseJson, () => Effect.succeed(null)),
		);

		if (jsonResult) {
			setMeals(jsonResult);
			return;
		}

		// Original logic for full meal plan parsing
		const lines = content.split("\n").filter((line: string) => line.trim());

		const aiMeals: Meal[] = [];
		const days = [
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
			"Sunday",
		];

		for (const line of lines) {
			if (line.includes(":")) {
				const [day, meal] = line.split(":").map((s: string) => s.trim());
				// Remove leading dash and any extra whitespace
				const cleanDay = day.replace(/^-\s*/, "");
				if (days.includes(cleanDay) && meal) {
					aiMeals.push({ day: cleanDay, meal });
				}
			}
		}

		if (aiMeals.length === 7) {
			setMeals(aiMeals);
		}
	}, [messages, isRegeneratingFor]);

	// Update meals when messages change
	useEffect(() => {
		parseMealsFromMessages();
	}, [parseMealsFromMessages]);

	const regenerateSingleMeal = async (dayToRegenerate: string) => {
		setIsRegeneratingFor(dayToRegenerate);
		sendMessage({
			text: `Generate a single meal recommendation for ${dayToRegenerate}. Provide just the meal name without the day. Focus on variety, nutrition, and family-friendly meals for 3 people. Make it different from common meals like spaghetti, pizza, or tacos.`,
		});
	};

	useEffect(() => {
		if (meals.length === 0) {
			void generateAIMeals();
		}
	}, [generateAIMeals, meals.length]);

	return (
		<div className="w-full max-w-2xl mx-auto mb-8 p-4 border rounded-lg bg-white dark:bg-gray-900">
			<h3 className="text-lg font-semibold mb-4">Weekly Meal Plan</h3>

			<div className="mb-4">
				<button
					type="button"
					onClick={generateAIMeals}
					disabled={isGenerating}
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
				>
					{isGenerating ? "Generating Meal Plan..." : "Generate New Meal Plan"}
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
								disabled={
									isRegeneratingFor === meal.day ||
									status === "streaming" ||
									status === "submitted"
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