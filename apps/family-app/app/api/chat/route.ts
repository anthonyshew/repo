import { convertToModelMessages, streamText, type UIMessage } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
	const { messages }: { messages: UIMessage[] } = await req.json();

	const result = streamText({
		model: "xai/grok-3",
		system:
			"You are a personal chef for our family. Recommend a dinner recipe that is simple, delicious, and healthy. Recommend portions for 3 people.",
		messages: convertToModelMessages(messages),
	});

	return result.toUIMessageStreamResponse();
}
