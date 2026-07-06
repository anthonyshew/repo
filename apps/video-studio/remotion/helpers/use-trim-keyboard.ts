import { reevaluateComposition, seek, writeStaticFile } from "@remotion/studio";
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

async function loadGoodTakesJson(
	goodTakesPath: string,
): Promise<GoodTakeJson[]> {
	const response = await fetch(staticFile(goodTakesPath));
	return response.json();
}

async function saveAndSeek(
	goodTakesPath: string,
	takes: GoodTakeJson[],
	sourceTimeSec: number,
	fps: number,
): Promise<void> {
	const newFrame = sourceTimeToFrame(takes, sourceTimeSec, fps);

	await writeStaticFile({
		filePath: goodTakesPath,
		contents: JSON.stringify(takes, null, "\t"),
	});
	reevaluateComposition();
	seek(newFrame);
}

function sourceTimeToFrame(
	takes: GoodTakeJson[],
	sourceTimeSec: number,
	fps: number,
): number {
	let accumulatedFrames = 0;

	for (const take of takes) {
		const segDurationFrames = Math.ceil((take.endSec - take.startSec) * fps);

		if (sourceTimeSec >= take.startSec && sourceTimeSec <= take.endSec) {
			const secondsIntoSegment = sourceTimeSec - take.startSec;
			return accumulatedFrames + Math.round(secondsIntoSegment * fps);
		}

		accumulatedFrames += segDurationFrames;
	}

	return Math.max(0, accumulatedFrames - 1);
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
	goodTakesPath: string,
): UseTrimKeyboardResult {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const [showSaved, setShowSaved] = useState(false);
	const previousStateRef = useRef<GoodTakeJson[] | null>(null);
	const sourceTimeRef = useRef<number | null>(null);
	const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const currentSegmentInfo = findCurrentSegment(frame, speechSegments, fps);

	const flashSaved = useCallback(() => {
		setShowSaved(true);
		if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
		saveTimeoutRef.current = setTimeout(() => setShowSaved(false), 1500);
	}, []);

	const handleTrimStart = useCallback(async () => {
		if (!currentSegmentInfo) return;

		const { index, sourceTimeSec, segment } = currentSegmentInfo;
		const newStartSec = sourceTimeSec;
		const currentEndSec = segment.endMs / 1000;

		if (newStartSec >= currentEndSec) {
			console.warn("Cannot set start >= end");
			return;
		}

		const takes = await loadGoodTakesJson(goodTakesPath);
		previousStateRef.current = takes;
		sourceTimeRef.current = sourceTimeSec;

		const updatedTakes = takes.map((take, i) => {
			if (i === index) {
				return { ...take, startSec: Number(newStartSec.toFixed(2)) };
			}
			return take;
		});

		await saveAndSeek(goodTakesPath, updatedTakes, sourceTimeSec, fps);
		flashSaved();
	}, [currentSegmentInfo, goodTakesPath, fps, flashSaved]);

	const handleTrimEnd = useCallback(async () => {
		if (!currentSegmentInfo) return;

		const { index, sourceTimeSec, segment } = currentSegmentInfo;
		const newEndSec = sourceTimeSec;
		const currentStartSec = segment.startMs / 1000;

		if (newEndSec <= currentStartSec) {
			console.warn("Cannot set end <= start");
			return;
		}

		const takes = await loadGoodTakesJson(goodTakesPath);
		previousStateRef.current = takes;
		sourceTimeRef.current = sourceTimeSec;

		const updatedTakes = takes.map((take, i) => {
			if (i === index) {
				return { ...take, endSec: Number(newEndSec.toFixed(2)) };
			}
			return take;
		});

		await saveAndSeek(goodTakesPath, updatedTakes, sourceTimeSec, fps);
		flashSaved();
	}, [currentSegmentInfo, goodTakesPath, fps, flashSaved]);

	const handleSplit = useCallback(async () => {
		if (!currentSegmentInfo) return;

		const { index, sourceTimeSec, segment } = currentSegmentInfo;
		const splitPoint = Number(sourceTimeSec.toFixed(2));
		const currentStartSec = segment.startMs / 1000;
		const currentEndSec = segment.endMs / 1000;

		if (splitPoint <= currentStartSec || splitPoint >= currentEndSec) {
			console.warn("Cannot split at segment boundary");
			return;
		}

		const takes = await loadGoodTakesJson(goodTakesPath);
		previousStateRef.current = takes;
		sourceTimeRef.current = sourceTimeSec;

		const originalTake = takes[index]!;
		const firstHalf: GoodTakeJson = {
			...originalTake,
			endSec: splitPoint,
		};
		const secondHalf: GoodTakeJson = {
			...originalTake,
			startSec: splitPoint,
			text: "",
		};

		const updatedTakes = [
			...takes.slice(0, index),
			firstHalf,
			secondHalf,
			...takes.slice(index + 1),
		];

		await saveAndSeek(goodTakesPath, updatedTakes, sourceTimeSec, fps);
		flashSaved();
	}, [currentSegmentInfo, goodTakesPath, fps, flashSaved]);

	const handleDelete = useCallback(async () => {
		if (!currentSegmentInfo) return;

		const { index, sourceTimeSec } = currentSegmentInfo;

		const takes = await loadGoodTakesJson(goodTakesPath);
		if (takes.length <= 1) {
			console.warn("Cannot delete the last segment");
			return;
		}

		previousStateRef.current = takes;
		sourceTimeRef.current = sourceTimeSec;

		const updatedTakes = [...takes.slice(0, index), ...takes.slice(index + 1)];

		const seekTo =
			index < updatedTakes.length
				? updatedTakes[index]!.startSec
				: updatedTakes[updatedTakes.length - 1]!.startSec;

		await saveAndSeek(goodTakesPath, updatedTakes, seekTo, fps);
		flashSaved();
	}, [currentSegmentInfo, goodTakesPath, fps, flashSaved]);

	const handleUndo = useCallback(async () => {
		if (!previousStateRef.current) {
			console.warn("Nothing to undo");
			return;
		}

		const restoreSourceTime = sourceTimeRef.current ?? 0;
		const restoredTakes = previousStateRef.current;
		previousStateRef.current = null;
		sourceTimeRef.current = null;

		await saveAndSeek(goodTakesPath, restoredTakes, restoreSourceTime, fps);
		flashSaved();
	}, [goodTakesPath, fps, flashSaved]);

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
			} else if (event.key === "d" && !event.metaKey && !event.shiftKey) {
				event.preventDefault();
				void handleDelete();
			} else if (event.key === "z" && event.metaKey && !event.shiftKey) {
				event.preventDefault();
				void handleUndo();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleTrimStart, handleTrimEnd, handleSplit, handleDelete, handleUndo]);

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
