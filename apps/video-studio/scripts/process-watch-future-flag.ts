import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Caption } from "@remotion/captions";
import { captionFile } from "./captions/caption-file";
import { ensureWhisper } from "./captions/install-whisper";

const publicFolder = path.join(process.cwd(), "public");
const folder = path.join(publicFolder, "watch-future-flag");
const camFile = path.join(folder, "cam.mov");
const captionsPath = path.join(folder, "captions.json");
const goodTakesPath = path.join(folder, "good-takes.json");

if (!existsSync(camFile)) {
	console.error(`Missing: ${camFile}`);
	console.error("Place your cam.mov recording in public/watch-future-flag/");
	process.exit(1);
}

console.log("=== Step 1: Transcription ===\n");

await ensureWhisper({
	onInstall: () => console.log("Installing Whisper..."),
	onModelProgressInPercent: (p) => console.log(`Downloading model: ${p}%`),
	signal: new AbortController().signal,
});

if (existsSync(captionsPath)) {
	console.log("captions.json already exists, skipping transcription");
} else {
	console.log("Transcribing cam.mov...");
	await captionFile({
		file: "cam.mov",
		outPath: captionsPath,
		fileToTranscribe: camFile,
		onProgress(progress) {
			process.stdout.write(`\r${progress.progressInPercent}%`);
		},
		signal: new AbortController().signal,
	});
	console.log("\nTranscription complete");
}

console.log("\n=== Step 2: Remove Retakes ===\n");

const captions: Caption[] = JSON.parse(readFileSync(captionsPath, "utf-8"));

type Segment = {
	startMs: number;
	endMs: number;
	text: string;
};

function buildFullText(caps: Caption[]): string {
	return caps.map((c) => c.text).join("");
}

function findTimestampForPosition(
	caps: Caption[],
	position: number,
	type: "start" | "end",
): number {
	let currentPos = 0;
	for (const caption of caps) {
		const textLen = caption.text.length;
		if (position >= currentPos && position < currentPos + textLen) {
			return type === "start" ? caption.startMs : caption.endMs;
		}
		currentPos += textLen;
	}
	return type === "start" ? caps[0]!.startMs : caps[caps.length - 1]!.endMs;
}

function splitIntoSegments(caps: Caption[]): Segment[] {
	const fullText = buildFullText(caps);
	const silencePattern = /\s*\[silence\]\s*|\s*\[BLANK_AUDIO\]\s*/gi;
	const parts = fullText.split(silencePattern);

	const segments: Segment[] = [];
	let searchStart = 0;

	for (const part of parts) {
		const trimmed = part.trim();
		if (trimmed.length === 0) continue;

		const partStart = fullText.indexOf(part, searchStart);
		if (partStart === -1) continue;

		const partEnd = partStart + part.length;
		searchStart = partEnd;

		const startMs = findTimestampForPosition(caps, partStart, "start");
		const endMs = findTimestampForPosition(caps, partEnd - 1, "end");

		segments.push({ startMs, endMs, text: trimmed });
	}

	return segments;
}

function normalizeForComparison(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

function getFirstNWords(text: string, n: number): string {
	return normalizeForComparison(text).split(" ").slice(0, n).join(" ");
}

function isSameContent(a: Segment, b: Segment): boolean {
	const firstWordsA = getFirstNWords(a.text, 5);
	const firstWordsB = getFirstNWords(b.text, 5);

	if (firstWordsA.length > 12 && firstWordsA === firstWordsB) {
		return true;
	}

	return false;
}

function selectBestTake(takes: Segment[]): Segment {
	let best = takes[0]!;
	for (const take of takes) {
		if (take.text.length > best.text.length) {
			best = take;
		}
	}
	return best;
}

function removeRetakes(segments: Segment[]): Segment[] {
	const result: Segment[] = [];
	let i = 0;

	while (i < segments.length) {
		const group: Segment[] = [segments[i]!];
		let j = i + 1;

		while (j < segments.length && isSameContent(segments[i]!, segments[j]!)) {
			group.push(segments[j]!);
			j++;
		}

		if (group.length > 1) {
			console.log(`Found retake group (${group.length} takes):`);
			for (const seg of group) {
				const preview = seg.text.slice(0, 50);
				console.log(`  - ${(seg.startMs / 1000).toFixed(1)}s: "${preview}..."`);
			}
			console.log(
				`  -> Selected: ${(selectBestTake(group).startMs / 1000).toFixed(1)}s\n`,
			);
		}

		result.push(selectBestTake(group));
		i = j;
	}

	return result;
}

const segments = splitIntoSegments(captions);
console.log(`Found ${segments.length} segments\n`);

const goodTakes = removeRetakes(segments);
console.log(`\nGood takes: ${goodTakes.length} of ${segments.length}\n`);

const goodTakesInSeconds = goodTakes.map((take) => ({
	startSec: take.startMs / 1000,
	endSec: take.endMs / 1000,
	text: take.text,
}));

writeFileSync(goodTakesPath, JSON.stringify(goodTakesInSeconds, null, 2));
console.log(`Wrote: ${goodTakesPath}`);
