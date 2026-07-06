import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Caption } from "@remotion/captions";
import { detectSilence } from "./audio/detect-silence";
import { captionFile } from "./captions/caption-file";
import { ensureWhisper } from "./captions/install-whisper";

const publicFolder = path.join(process.cwd(), "public");
const folder = path.join(publicFolder, "turbo-ignore-ded");
const camFile = path.join(folder, "cam.mov");
const captionsPath = path.join(folder, "captions.json");
const goodTakesPath = path.join(folder, "good-takes.json");

if (!existsSync(camFile)) {
	console.error(`Missing: ${camFile}`);
	console.error("Place your cam.mov recording in public/turbo-ignore-ded/");
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

console.log("\n=== Step 2: Silence Detection ===\n");

const silences = await detectSilence(camFile, {
	minDuration: 0.5,
	thresholdDb: -30,
});
console.log(`Found ${silences.length} silent intervals\n`);

console.log("\n=== Step 3: Split into Segments & Remove Retakes ===\n");

const captions: Caption[] = JSON.parse(readFileSync(captionsPath, "utf-8"));

type Segment = {
	startMs: number;
	endMs: number;
	text: string;
};

function getCaptionTextInRange(
	caps: Caption[],
	startMs: number,
	endMs: number,
): string {
	return caps
		.filter((c) => c.startMs >= startMs && c.endMs <= endMs)
		.map((c) => c.text)
		.join("")
		.trim();
}

function splitBySilence(
	caps: Caption[],
	silenceIntervals: { startSec: number; endSec: number }[],
): Segment[] {
	if (caps.length === 0) return [];

	const firstCaptionMs = caps[0]!.startMs;
	const lastCaptionMs = caps[caps.length - 1]!.endMs;

	const splitPoints = silenceIntervals.map((s) => ({
		startMs: s.startSec * 1000,
		endMs: s.endSec * 1000,
	}));

	const segments: Segment[] = [];
	let segStart = firstCaptionMs;

	for (const silence of splitPoints) {
		if (silence.startMs <= segStart) {
			segStart = silence.endMs;
			continue;
		}

		const text = getCaptionTextInRange(caps, segStart, silence.startMs);
		if (text.length > 0) {
			segments.push({
				startMs: segStart,
				endMs: silence.startMs,
				text,
			});
		}

		segStart = silence.endMs;
	}

	const trailingText = getCaptionTextInRange(caps, segStart, lastCaptionMs);
	if (trailingText.length > 0) {
		segments.push({
			startMs: segStart,
			endMs: lastCaptionMs,
			text: trailingText,
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

const segments = splitBySilence(captions, silences);
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
