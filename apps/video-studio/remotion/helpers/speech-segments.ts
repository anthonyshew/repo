import type { Caption } from "@remotion/captions";

export type SpeechSegment = {
	startMs: number;
	endMs: number;
};

const START_PADDING_MS = 250;
const END_PADDING_MS = 500;
const MIN_SILENCE_THRESHOLD_MS = 500;

export function getSpeechSegments(
	captions: Caption[],
	startOffsetMs = 0,
): SpeechSegment[] {
	if (captions.length === 0) {
		return [];
	}

	const filteredCaptions = captions.filter((c) => {
		const text = c.text.trim();
		return (
			text.length > 0 &&
			!text.includes("[BLANK_AUDIO]") &&
			!text.includes("[silence]") &&
			c.endMs > startOffsetMs
		);
	});

	if (filteredCaptions.length === 0) {
		return [];
	}

	const segments: SpeechSegment[] = [];
	const firstCaption = filteredCaptions[0]!;
	let currentSegment: SpeechSegment = {
		startMs: Math.max(startOffsetMs, firstCaption.startMs - START_PADDING_MS),
		endMs: firstCaption.endMs + END_PADDING_MS,
	};

	for (let i = 1; i < filteredCaptions.length; i++) {
		const caption = filteredCaptions[i]!;
		const gapMs = caption.startMs - currentSegment.endMs + END_PADDING_MS;

		if (gapMs > MIN_SILENCE_THRESHOLD_MS) {
			segments.push(currentSegment);
			currentSegment = {
				startMs: Math.max(0, caption.startMs - START_PADDING_MS),
				endMs: caption.endMs + END_PADDING_MS,
			};
		} else {
			currentSegment.endMs = caption.endMs + END_PADDING_MS;
		}
	}

	segments.push(currentSegment);

	return segments;
}

export function getTotalDurationMs(segments: SpeechSegment[]): number {
	return segments.reduce((total, seg) => total + (seg.endMs - seg.startMs), 0);
}

export function mapOutputTimeToSourceTime(
	outputTimeMs: number,
	segments: SpeechSegment[],
): number {
	let accumulatedOutputTime = 0;

	for (const segment of segments) {
		const segmentDuration = segment.endMs - segment.startMs;

		if (outputTimeMs < accumulatedOutputTime + segmentDuration) {
			const offsetInSegment = outputTimeMs - accumulatedOutputTime;
			return segment.startMs + offsetInSegment;
		}

		accumulatedOutputTime += segmentDuration;
	}

	const lastSegment = segments[segments.length - 1];
	return lastSegment?.endMs ?? 0;
}
