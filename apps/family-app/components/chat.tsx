"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export function Chat() {
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
								{message.parts?.map((part, i) => {
									switch (part.type) {
										case "text":
											return (
												<span key={`${message.id}-${i}`}>{part.text}</span>
											);
										default:
											return null;
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
