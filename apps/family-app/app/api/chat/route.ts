import { convertToModelMessages, streamText, type UIMessage } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
	try {
		const body = await req.json();
		console.log("Full request body:", JSON.stringify(body, null, 2));

		const { messages }: { messages: UIMessage[] } = body;
		console.log("Extracted messages:", messages);

		if (!messages) {
			console.error("No messages found in request body");
			return new Response("No messages provided", { status: 400 });
		}

		if (!Array.isArray(messages)) {
			console.error("Messages is not an array:", typeof messages);
			return new Response("Messages must be an array", { status: 400 });
		}

		// Messages are already in the correct UIMessage format
		const formattedMessages: UIMessage[] = messages;

		const result = streamText({
			model: "xai/grok-3",
			system:
				"You are a personal chef for our family. Recommend a dinner recipe that is simple, delicious, and healthy. Recommend portions for 3 people.",
			messages: convertToModelMessages(formattedMessages),
		});

		return result.toUIMessageStreamResponse();
	} catch (error) {
		console.error("Error in POST handler:", error);
		return new Response("Internal server error", { status: 500 });
	}
}
