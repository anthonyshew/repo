import { convertToModelMessages, streamText, type UIMessage } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { messages }: { messages: UIMessage[] } = body;

		if (!messages || !Array.isArray(messages)) {
			return new Response("Messages must be an array", { status: 400 });
		}

		// For regular chat messages, use streaming
		const result = streamText({
			model: "xai/grok-3",
			system:
				"You are a personal chef for our family. Help with cooking questions and meal suggestions for 3 people.",
			messages: convertToModelMessages(messages),
		});

		return result.toUIMessageStreamResponse();
	} catch (error) {
		console.error("Error in POST handler:", error);
		return new Response("Internal server error", { status: 500 });
	}
}
