import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { Effect } from "effect";

export const maxDuration = 30;

export async function POST(req: Request) {
	const processChat = Effect.gen(function* () {
		const body = yield* Effect.promise(() => req.json());
		const { messages }: { messages: UIMessage[] } = body;

		if (!messages || !Array.isArray(messages)) {
			return yield* Effect.fail(new Error("Messages must be an array"));
		}

		// For regular chat messages, use streaming
		const result = streamText({
			model: "xai/grok-3",
			system:
				"You are a personal chef for our family. Help with cooking questions and meal suggestions for 3 people.",
			messages: convertToModelMessages(messages),
		});

		return result.toUIMessageStreamResponse();
	});

	return await Effect.runPromise(
		Effect.matchEffect(processChat, {
			onFailure: (error) =>
				Effect.sync(() => {
					console.error("Error in POST handler:", error);
					const errorMessage = error.message || "Internal server error";
					const status =
						errorMessage === "Messages must be an array" ? 400 : 500;
					return new Response(errorMessage, { status });
				}),
			onSuccess: (response) => Effect.succeed(response),
		}),
	);
}
