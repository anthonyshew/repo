import { reevaluateComposition, writeStaticFile } from "@remotion/studio";
import { useCallback, useEffect, useRef, useState } from "react";
import { staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { CurrentSegmentInfo } from "./find-current-segment";
import { findCurrentSegment } from "./find-current-segment";

type Segment = {
	startMs: number;
	endMs: number;
	broll?: string;
};

type GoodTakeJson = {
	startSec: number;
	endSec: number;
	text: string;
	broll?: string;
};

type UseTrimKeyboardResult = {
	currentSegmentInfo: CurrentSegmentInfo | null;
	showSaved: boolean;
};

async function loadGoodTakesJson(): Promise<GoodTakeJson[]> {
	const response = await fetch(staticFile("2-8/good-takes.json"));
	return response.json();
}

async function saveGoodTakesJson(takes: GoodTakeJson[]): Promise<void> {
	await writeStaticFile({
		filePath: "2-8/good-takes.json",
		contents: JSON.stringify(takes, null, "\t"),
	});
	reevaluateComposition();
}

function isInputFocused(): boolean {
	const activeElement = document.activeElement;
	if (!activeElement) return false;

	const tagName = activeElement.tagName.toLowerCase();
	if (tagName === "input" || tagName === "textarea") return true;

	if (activeElement.getAttribute("contenteditable") === "true") return true;

	const dialog = document.querySelector('[role="dialog"]');
	if (dialog) return true;

	return false;
}

export function useTrimKeyboard(
	speechSegments: Segment[],
): UseTrimKeyboardResult {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const [showSaved, setShowSaved] = useState(false);
	const previousStateRef = useRef<GoodTakeJson[] | null>(null);
	const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const currentSegmentInfo = findCurrentSegment(frame, speechSegments, fps);

	const handleTrimStart = useCallback(async () => {
		if (!currentSegmentInfo) return;

		const { index, sourceTimeSec, segment } = currentSegmentInfo;
		const newStartSec = sourceTimeSec;
		const currentEndSec = segment.endMs / 1000;

		if (newStartSec >= currentEndSec) {
			console.warn("Cannot set start >= end");
			return;
		}

		const takes = await loadGoodTakesJson();
		previousStateRef.current = takes;

		const updatedTakes = takes.map((take, i) => {
			if (i === index) {
				return { ...take, startSec: Number(newStartSec.toFixed(2)) };
			}
			return take;
		});

		await saveGoodTakesJson(updatedTakes);

		setShowSaved(true);
		if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
		saveTimeoutRef.current = setTimeout(() => setShowSaved(false), 1500);
	}, [currentSegmentInfo]);

	const handleTrimEnd = useCallback(async () => {
		if (!currentSegmentInfo) return;

		const { index, sourceTimeSec, segment } = currentSegmentInfo;
		const newEndSec = sourceTimeSec;
		const currentStartSec = segment.startMs / 1000;

		if (newEndSec <= currentStartSec) {
			console.warn("Cannot set end <= start");
			return;
		}

		const takes = await loadGoodTakesJson();
		previousStateRef.current = takes;

		const updatedTakes = takes.map((take, i) => {
			if (i === index) {
				return { ...take, endSec: Number(newEndSec.toFixed(2)) };
			}
			return take;
		});

		await saveGoodTakesJson(updatedTakes);

		setShowSaved(true);
		if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
		saveTimeoutRef.current = setTimeout(() => setShowSaved(false), 1500);
	}, [currentSegmentInfo]);

	const handleSplit = useCallback(async () => {
		if (!currentSegmentInfo) return;

		const { index, sourceTimeSec, segment } = currentSegmentInfo;
		const splitPoint = Number(sourceTimeSec.toFixed(2));
		const currentStartSec = segment.startMs / 1000;
		const currentEndSec = segment.endMs / 1000;

		// Don't split if we're at the very start or end
		if (splitPoint <= currentStartSec || splitPoint >= currentEndSec) {
			console.warn("Cannot split at segment boundary");
			return;
		}

		const takes = await loadGoodTakesJson();
		previousStateRef.current = takes;

		const originalTake = takes[index]!;
		const firstHalf: GoodTakeJson = {
			...originalTake,
			endSec: splitPoint,
		};
		const secondHalf: GoodTakeJson = {
			...originalTake,
			startSec: splitPoint,
			text: "", // Clear text for the new segment
		};

		const updatedTakes = [
			...takes.slice(0, index),
			firstHalf,
			secondHalf,
			...takes.slice(index + 1),
		];

		await saveGoodTakesJson(updatedTakes);

		setShowSaved(true);
		if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
		saveTimeoutRef.current = setTimeout(() => setShowSaved(false), 1500);
	}, [currentSegmentInfo]);

	const handleUndo = useCallback(async () => {
		if (!previousStateRef.current) {
			console.warn("Nothing to undo");
			return;
		}

		await saveGoodTakesJson(previousStateRef.current);
		previousStateRef.current = null;

		setShowSaved(true);
		if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
		saveTimeoutRef.current = setTimeout(() => setShowSaved(false), 1500);
	}, []);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (isInputFocused()) return;

			if (event.key === "[" && !event.metaKey) {
				event.preventDefault();
				void handleTrimStart();
			} else if (event.key === "]" && !event.metaKey) {
				event.preventDefault();
				void handleTrimEnd();
			} else if (event.key === "s" && !event.metaKey && !event.shiftKey) {
				event.preventDefault();
				void handleSplit();
			} else if (event.key === "z" && event.metaKey && !event.shiftKey) {
				event.preventDefault();
				void handleUndo();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleTrimStart, handleTrimEnd, handleSplit, handleUndo]);

	useEffect(() => {
		return () => {
			if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
		};
	}, []);

	return {
		currentSegmentInfo,
		showSaved,
	};
}
