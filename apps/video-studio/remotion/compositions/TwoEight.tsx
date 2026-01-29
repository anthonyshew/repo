import type { Caption } from "@remotion/captions";
import {
	AbsoluteFill,
	type CalculateMetadataFunction,
	Easing,
	interpolate,
	OffthreadVideo,
	Sequence,
	staticFile,
	useCurrentFrame,
} from "remotion";
import { z } from "zod";
import { VIDEO_FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from "../constants";
import {
	getSpeechSegments,
	getTotalDurationMs,
	type SpeechSegment,
} from "../helpers/speech-segments";
import { getLayoutConfig } from "../layouts";

export const twoEightSchema = z.object({
	title: z.string().default("2-8"),
	speechSegments: z
		.array(
			z.object({
				startMs: z.number(),
				endMs: z.number(),
			}),
		)
		.default([]),
});

type TwoEightProps = z.infer<typeof twoEightSchema>;

const START_FRAME = 92;
const START_OFFSET_MS = (START_FRAME / VIDEO_FPS) * 1000;
const FULL_CAM_DURATION_SECONDS = 5;
const TRANSITION_DURATION_FRAMES = 15;

async function loadCaptions(): Promise<Caption[]> {
	const response = await fetch(staticFile("2-8/captions.json"));
	return response.json();
}

export const calculateTwoEightMetadata: CalculateMetadataFunction<
	TwoEightProps
> = async () => {
	const captions = await loadCaptions();
	const speechSegments = getSpeechSegments(captions, START_OFFSET_MS);
	const totalDurationMs = getTotalDurationMs(speechSegments);

	return {
		durationInFrames: Math.ceil((totalDurationMs / 1000) * VIDEO_FPS),
		fps: VIDEO_FPS,
		width: VIDEO_WIDTH,
		height: VIDEO_HEIGHT,
		props: {
			title: "2-8",
			speechSegments,
		},
	};
};

function VideoSegment({
	segment,
	camX,
	camY,
	camWidth,
	camHeight,
	monitorX,
	monitorY,
	monitorWidth,
	monitorHeight,
}: {
	segment: SpeechSegment;
	camX: number;
	camY: number;
	camWidth: number;
	camHeight: number;
	monitorX: number;
	monitorY: number;
	monitorWidth: number;
	monitorHeight: number;
}) {
	const trimBefore = Math.floor((segment.startMs / 1000) * VIDEO_FPS);
	const trimAfter = Math.floor((segment.endMs / 1000) * VIDEO_FPS);

	return (
		<>
			<OffthreadVideo
				src={staticFile("2-8/screen-2.mov")}
				trimBefore={trimBefore}
				trimAfter={trimAfter}
				style={{
					position: "absolute",
					left: monitorX,
					top: monitorY,
					width: monitorWidth,
					height: monitorHeight,
					objectFit: "cover",
				}}
			/>
			<OffthreadVideo
				src={staticFile("2-8/cam-2.mov")}
				trimBefore={trimBefore}
				trimAfter={trimAfter}
				style={{
					position: "absolute",
					left: camX,
					top: camY,
					width: camWidth,
					height: camHeight,
					objectFit: "cover",
					borderRadius: 28,
				}}
			/>
		</>
	);
}

export function TwoEight({ speechSegments }: TwoEightProps) {
	const frame = useCurrentFrame();
	const transitionStartFrame = FULL_CAM_DURATION_SECONDS * VIDEO_FPS;

	const fullCamConfig = getLayoutConfig("full-cam");
	const splitConfig = getLayoutConfig("cam-bottom-right");

	const progress = interpolate(
		frame,
		[transitionStartFrame, transitionStartFrame + TRANSITION_DURATION_FRAMES],
		[0, 1],
		{
			extrapolateLeft: "clamp",
			extrapolateRight: "clamp",
			easing: Easing.out(Easing.quad),
		},
	);

	const camX = interpolate(
		progress,
		[0, 1],
		[fullCamConfig.cam!.x, splitConfig.cam!.x],
	);
	const camY = interpolate(
		progress,
		[0, 1],
		[fullCamConfig.cam!.y, splitConfig.cam!.y],
	);
	const camWidth = interpolate(
		progress,
		[0, 1],
		[fullCamConfig.cam!.width, splitConfig.cam!.width],
	);
	const camHeight = interpolate(
		progress,
		[0, 1],
		[fullCamConfig.cam!.height, splitConfig.cam!.height],
	);

	const monitorX = splitConfig.monitor!.x;
	const monitorY = splitConfig.monitor!.y;
	const monitorWidth = splitConfig.monitor!.width;
	const monitorHeight = splitConfig.monitor!.height;

	let accumulatedFrames = 0;

	return (
		<AbsoluteFill style={{ backgroundColor: "#000" }}>
			{(speechSegments as SpeechSegment[]).map((segment, index) => {
				const segmentDuration = Math.ceil(
					((segment.endMs - segment.startMs) / 1000) * VIDEO_FPS,
				);
				const sequenceFrom = accumulatedFrames;
				accumulatedFrames += segmentDuration;

				return (
					<Sequence
						key={index}
						from={sequenceFrom}
						durationInFrames={segmentDuration}
					>
						<VideoSegment
							segment={segment}
							camX={camX}
							camY={camY}
							camWidth={camWidth}
							camHeight={camHeight}
							monitorX={monitorX}
							monitorY={monitorY}
							monitorWidth={monitorWidth}
							monitorHeight={monitorHeight}
						/>
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
}
