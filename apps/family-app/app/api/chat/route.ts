import { convertToModelMessages, streamText, type UIMessage } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
	const body = await req.json();
	console.log(body.messages);
	const { messages }: { messages: UIMessage[] } = body;

	const result = streamText({
		model: "xai/grok-3",
		system:
			"You are a personal chef for our family. Recommend a dinner recipe that is simple, delicious, and healthy. Recommend portions for 3 people.",
		messages: convertToModelMessages(messages),
	});

	console.log(result);

	return result.toUIMessageStreamResponse();
}
