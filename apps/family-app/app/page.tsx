"use client";

import { useChat } from "@ai-sdk/react";
import { checkEnvVar } from "@repo/utils/check-env-var";
import { useCallback, useEffect, useState } from "react";
import { sendNotification, subscribeUser, unsubscribeUser } from "./actions";

type Meal = {
	day: string;
	meal: string;
};

function urlBase64ToUint8Array(base64String: string) {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

function PushNotificationManager() {
	const [isSupported, setIsSupported] = useState(false);
	const [subscription, setSubscription] = useState<PushSubscription | null>(
		null,
	);
	const [message, setMessage] = useState("");

	const registerServiceWorker = useCallback(async () => {
		const registration = await navigator.serviceWorker.register("/sw.js", {
			scope: "/",
			updateViaCache: "none",
		});
		const sub = await registration.pushManager.getSubscription();
		setSubscription(sub);
	}, []);

	useEffect(() => {
		if ("serviceWorker" in navigator && "PushManager" in window) {
			setIsSupported(true);
			void registerServiceWorker();
		}
	}, [registerServiceWorker]);
	async function subscribeToPush() {
		const registration = await navigator.serviceWorker.ready;

		const vapidPublicKey = checkEnvVar("NEXT_PUBLIC_VAPID_PUBLIC_KEY");

		const sub = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
		});
		setSubscription(sub);
		const serializedSub = JSON.parse(JSON.stringify(sub));
		await subscribeUser(serializedSub);
	}

	async function unsubscribeFromPush() {
		await subscription?.unsubscribe();
		setSubscription(null);
		await unsubscribeUser();
	}

	async function sendTestNotification() {
		if (subscription) {
			await sendNotification(message);
			setMessage("");
		}
	}

	if (!isSupported) {
		return (
			<p className="text-red-500">
				Push notifications are not supported in this browser.
			</p>
		);
	}

	return (
		<div className="mb-8 p-4 border rounded-lg">
			<h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
			{subscription ? (
				<>
					<p className="text-green-600 mb-4">
						You are subscribed to push notifications.
					</p>
					<div className="flex gap-2 mb-4">
						<input
							type="text"
							placeholder="Enter notification message"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							className="flex-1 px-3 py-2 border rounded"
						/>
						<button
							type="button"
							onClick={sendTestNotification}
							className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						>
							{" "}
							Send Test
						</button>
					</div>
					<button
						type="button"
						onClick={unsubscribeFromPush}
						className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
					>
						{" "}
						Unsubscribe
					</button>
				</>
			) : (
				<>
					<p className="text-gray-600 mb-4">
						You are not subscribed to push notifications.
					</p>
					<button
						type="button"
						onClick={subscribeToPush}
						className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
					>
						{" "}
						Subscribe
					</button>
				</>
			)}
		</div>
	);
}

function InstallPrompt() {
	const [isIOS, setIsIOS] = useState(false);
	const [isStandalone, setIsStandalone] = useState(false);

	useEffect(() => {
		setIsIOS(
			/iPad|iPhone|iPod/.test(navigator.userAgent) &&
				!(window as unknown as { MSStream?: unknown }).MSStream,
		);

		setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
	}, []);

	if (isStandalone) {
		return null;
	}

	return (
		<div className="mb-8 p-4 border rounded-lg bg-blue-50">
			<h3 className="text-lg font-semibold mb-2">Install App</h3>
			<button
				type="button"
				className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2"
			>
				Add to Home Screen
			</button>
			{isIOS && (
				<p className="text-sm text-gray-600">
					To install this app on your iOS device, tap the share button
					<span role="img" aria-label="share icon">
						{" "}
						⎋{" "}
					</span>
					and then "Add to Home Screen"
					<span role="img" aria-label="plus icon">
						{" "}
						➕{" "}
					</span>
					.
				</p>
			)}
		</div>
	);
}

function MealPlanner() {
	const [meals, setMeals] = useState<Meal[]>([]);
	const [isGenerating, setIsGenerating] = useState(false);

	const generateAIMeals = async () => {
		setIsGenerating(true);
		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					messages: [
						{
							role: "user",
							content:
								'Generate a weekly meal plan for 7 days (Monday through Sunday). For each day, provide just the meal name. Format your response as a simple list with the day and meal separated by a colon, like "Monday: Spaghetti Bolognese". Focus on variety, nutrition, and family-friendly meals for 3 people.',
						},
					],
				}),
			});

			if (response.ok) {
				const data = await response.json();
				console.log("AI Response data:", data);

				// Extract the content from the AI SDK response
				const content =
					data.messages?.[data.messages.length - 1]?.content ||
					data.content ||
					"";
				console.log("AI Content:", content);

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
						if (days.includes(day) && meal) {
							aiMeals.push({ day, meal });
						}
					}
				}

				if (aiMeals.length === 7) {
					setMeals(aiMeals);
				} else {
					console.warn(
						"AI response format was unexpected, found meals:",
						aiMeals,
					);
				}
			} else {
				console.error(
					"Failed to get AI meal recommendations",
					response.status,
					response.statusText,
				);
				const errorText = await response.text();
				console.error("Error response:", errorText);
			}
		} catch (error) {
			console.error("Error generating AI meals:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	const regenerateSingleMeal = async (dayToRegenerate: string) => {
		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					messages: [
						{
							role: "user",
							content: `Generate a single meal recommendation for ${dayToRegenerate}. Provide just the meal name without the day. Focus on variety, nutrition, and family-friendly meals for 3 people. Make it different from common meals like spaghetti, pizza, or tacos.`,
						},
					],
				}),
			});

			if (response.ok) {
				const reader = response.body?.getReader();
				const decoder = new TextDecoder();
				let aiResponse = "";

				if (reader) {
					while (true) {
						const { done, value } = await reader.read();
						if (done) break;
						aiResponse += decoder.decode(value);
					}
				}

				const newMeal = aiResponse.trim();
				if (newMeal) {
					setMeals((prev) =>
						prev.map((meal) =>
							meal.day === dayToRegenerate ? { ...meal, meal: newMeal } : meal,
						),
					);
				}
			}
		} catch (error) {
			console.error("Error regenerating single meal:", error);
		}
	};

	useEffect(() => {
		generateAIMeals();
	}, []);

	return (
		<div className="w-full max-w-2xl mx-auto mb-8 p-4 border rounded-lg bg-white dark:bg-gray-900">
			<h3 className="text-lg font-semibold mb-4">Weekly Meal Plan</h3>

			<div className="mb-4">
				<button
					onClick={generateAIMeals}
					disabled={isGenerating}
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
				>
					{isGenerating ? "Generating Meal Plan..." : "Generate New Meal Plan"}
				</button>
			</div>

			<ul className="space-y-2">
				{meals.map((meal, index) => (
					<li
						key={index}
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
								onClick={() => regenerateSingleMeal(meal.day)}
								className="ml-2 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
								title="Regenerate this meal"
							>
								🔄
							</button>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}

function Chat() {
	const [input, setInput] = useState("");
	const { messages, sendMessage } = useChat();
	return (
		<div className="w-full max-w-2xl mx-auto mb-8 p-4 border rounded-lg bg-white dark:bg-gray-900">
			<h3 className="text-lg font-semibold mb-4">Family Assistant</h3>

			<div className="h-96 overflow-y-auto mb-4 p-4 border rounded bg-gray-50 dark:bg-gray-800">
				{messages.length === 0 ? (
					<p className="text-gray-500 text-center">
						Start a conversation with your family assistant!
					</p>
				) : (
					messages.map((message) => (
						<div
							key={message.id}
							className={`mb-4 p-3 rounded-lg ${
								message.role === "user"
									? "bg-blue-100 dark:bg-blue-900 ml-8"
									: "bg-gray-100 dark:bg-gray-700 mr-8"
							}`}
						>
							<div className="font-semibold text-sm mb-1">
								{message.role === "user" ? "You" : "Assistant"}
							</div>
							<div className="whitespace-pre-wrap">
								{message.parts.map((part, i) => {
									switch (part.type) {
										case "text":
											return (
												<span key={`${message.id}-${i}`}>{part.text}</span>
											);
									}
								})}
							</div>
						</div>
					))
				)}
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					sendMessage({ text: input });
					setInput("");
				}}
				className="flex gap-2"
			>
				<input
					value={input}
					placeholder="Ask about recipes, activities, or anything else..."
					onChange={(e) => setInput(e.currentTarget.value)}
					className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<button
					type="submit"
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
				>
					Send
				</button>
			</form>
		</div>
	);
}

export default function Home() {
	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-4xl">
				<MealPlanner />
				<Chat />
				<PushNotificationManager />
				<InstallPrompt />
			</main>
		</div>
	);
}
