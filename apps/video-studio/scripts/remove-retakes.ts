import type { Caption } from "@remotion/captions";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const captionsPath = path.join(process.cwd(), "public/2-8/captions.json");
const captions: Caption[] = JSON.parse(readFileSync(captionsPath, "utf-8"));

type Segment = {
	startMs: number;
	endMs: number;
	text: string;
};

function buildFullText(captions: Caption[]): string {
	return captions.map((c) => c.text).join("");
}

function findTimestampForPosition(
	captions: Caption[],
	position: number,
	type: "start" | "end",
): number {
	let currentPos = 0;
	for (const caption of captions) {
		const textLen = caption.text.length;
		if (position >= currentPos && position < currentPos + textLen) {
			return type === "start" ? caption.startMs : caption.endMs;
		}
		currentPos += textLen;
	}
	return type === "start"
		? captions[0]!.startMs
		: captions[captions.length - 1]!.endMs;
}

function splitIntoSegments(captions: Caption[]): Segment[] {
	const fullText = buildFullText(captions);
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

		const startMs = findTimestampForPosition(captions, partStart, "start");
		const endMs = findTimestampForPosition(captions, partEnd - 1, "end");

		segments.push({
			startMs,
			endMs,
			text: trimmed,
		});
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

console.log("=== All segments ===\n");
for (let i = 0; i < Math.min(segments.length, 50); i++) {
	const seg = segments[i]!;
	const startSec = (seg.startMs / 1000).toFixed(1);
	const endSec = (seg.endMs / 1000).toFixed(1);
	const preview =
		seg.text.length > 60 ? seg.text.slice(0, 60) + "..." : seg.text;
	console.log(`[${i}] ${startSec}s - ${endSec}s: "${preview}"`);
}
if (segments.length > 50) {
	console.log(`... and ${segments.length - 50} more`);
}

console.log("\n=== Detecting retakes ===\n");
const goodTakes = removeRetakes(segments);

console.log(
	`\n=== Good takes (${goodTakes.length} of ${segments.length}) ===\n`,
);
for (const take of goodTakes) {
	const startSec = (take.startMs / 1000).toFixed(1);
	const endSec = (take.endMs / 1000).toFixed(1);
	const preview =
		take.text.length > 60 ? take.text.slice(0, 60) + "..." : take.text;
	console.log(`${startSec}s - ${endSec}s: "${preview}"`);
}

const outputPath = path.join(process.cwd(), "public/2-8/good-takes.json");
const goodTakesInSeconds = goodTakes.map((take) => ({
	startSec: take.startMs / 1000,
	endSec: take.endMs / 1000,
	text: take.text,
}));
writeFileSync(outputPath, JSON.stringify(goodTakesInSeconds, null, 2));
console.log(`\nWrote good takes to ${outputPath}`);
