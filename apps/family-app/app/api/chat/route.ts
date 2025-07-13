import { generateText } from "ai";

export async function GET() {
	const result = await generateText({
		model: "xai/grok-3",
		prompt: "Why is the sky blue?",
	});
	return Response.json(result);
}
