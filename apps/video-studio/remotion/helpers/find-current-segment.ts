type Segment = {
	startMs: number;
	endMs: number;
	broll?: string;
};

export type CurrentSegmentInfo = {
	index: number;
	sourceTimeSec: number;
	segmentStartFrame: number;
	frameIntoSegment: number;
	segment: Segment;
	totalSegments: number;
};

export function findCurrentSegment(
	frame: number,
	segments: Segment[],
	fps: number,
): CurrentSegmentInfo | null {
	let accumulatedFrames = 0;

	for (let i = 0; i < segments.length; i++) {
		const segment = segments[i]!;
		const segmentDurationFrames = Math.ceil(
			((segment.endMs - segment.startMs) / 1000) * fps,
		);

		if (frame < accumulatedFrames + segmentDurationFrames) {
			const frameIntoSegment = frame - accumulatedFrames;
			const secondsIntoSegment = frameIntoSegment / fps;
			const sourceTimeSec = segment.startMs / 1000 + secondsIntoSegment;

			return {
				index: i,
				sourceTimeSec,
				segmentStartFrame: accumulatedFrames,
				frameIntoSegment,
				segment,
				totalSegments: segments.length,
			};
		}

		accumulatedFrames += segmentDurationFrames;
	}

	return null;
}
