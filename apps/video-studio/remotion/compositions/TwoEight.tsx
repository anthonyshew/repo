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

import { TrimShortcutsOverlay } from "../components/TrimShortcutsOverlay";
import { VIDEO_FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from "../constants";
import { useTrimKeyboard } from "../helpers/use-trim-keyboard";
import { getLayoutConfig } from "../layouts";
import type { Tweet } from "../scenes/TweetWall/TweetCard";
import { TweetWall } from "../scenes/TweetWall/TweetWall";

type Segment = {
	startMs: number;
	endMs: number;
	text?: string;
	broll?: string;
	label?: string;
};

const tweetSchema = z.object({
	id: z.string(),
	image: z.string(),
});

export const twoEightSchema = z.object({
	title: z.string().default("2-8"),
	speechSegments: z
		.array(
			z.object({
				startMs: z.number(),
				endMs: z.number(),
				text: z.string().optional(),
				broll: z.string().optional(),
				label: z.string().optional(),
			}),
		)
		.default([]),
	tweets: z.array(tweetSchema).default([]),
});

type TwoEightProps = z.infer<typeof twoEightSchema>;

const FULL_CAM_DURATION_FRAMES = 46 * VIDEO_FPS;
const TRANSITION_DURATION_FRAMES = 15;

type GoodTakeJson = {
	startSec: number;
	endSec: number;
	text: string;
	broll?: string;
	label?: string;
};

type GoodTake = {
	startMs: number;
	endMs: number;
	text: string;
	broll?: string;
	label?: string;
};

async function loadGoodTakes(): Promise<GoodTake[]> {
	const response = await fetch(staticFile("2-8/good-takes.json"));
	const takes: GoodTakeJson[] = await response.json();
	return takes.map((take) => ({
		startMs: take.startSec * 1000,
		endMs: take.endSec * 1000,
		text: take.text,
		broll: take.broll,
		label: take.label,
	}));
}

function getTotalDuration(takes: GoodTake[]): number {
	return takes.reduce((total, take) => total + (take.endMs - take.startMs), 0);
}

async function loadTweets(): Promise<Tweet[]> {
	const response = await fetch(staticFile("2-8/tweets.json"));
	return response.json();
}

export const calculateTwoEightMetadata: CalculateMetadataFunction<
	TwoEightProps
> = async () => {
	const [goodTakes, tweets] = await Promise.all([
		loadGoodTakes(),
		loadTweets(),
	]);
	const totalDurationMs = getTotalDuration(goodTakes);

	const speechSegments = goodTakes.map((take) => ({
		startMs: take.startMs,
		endMs: take.endMs,
		text: take.text,
		broll: take.broll,
		label: take.label,
	}));

	return {
		durationInFrames: Math.ceil((totalDurationMs / 1000) * VIDEO_FPS),
		fps: VIDEO_FPS,
		width: VIDEO_WIDTH,
		height: VIDEO_HEIGHT,
		props: {
			title: "2-8",
			speechSegments,
			tweets,
		},
	};
};

function Broll({ src }: { src: string }) {
	if (src === "PLACEHOLDER") {
		return (
			<AbsoluteFill
				style={{
					backgroundColor: "#1a1a2e",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<div
					style={{
						color: "#fff",
						fontSize: 80,
						fontFamily: "system-ui",
						textAlign: "center",
					}}
				>
					B-ROLL PLACEHOLDER
				</div>
			</AbsoluteFill>
		);
	}

	return (
		<AbsoluteFill>
			<OffthreadVideo
				src={staticFile(src)}
				volume={0.65}
				style={{
					width: "100%",
					height: "100%",
					objectFit: "cover",
				}}
			/>
			<TrimShortcutsOverlay />
		</AbsoluteFill>
	);
}

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
	segment: Segment;
	camX: number;
	camY: number;
	camWidth: number;
	camHeight: number;
	monitorX: number;
	monitorY: number;
	monitorWidth: number;
	monitorHeight: number;
}) {
	if (segment.broll) {
		return <Broll src={segment.broll} />;
	}

	const trimBefore = Math.floor((segment.startMs / 1000) * VIDEO_FPS);
	const trimAfter = Math.ceil((segment.endMs / 1000) * VIDEO_FPS);

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
					transform: "scaleX(-1)",
				}}
			/>
		</>
	);
}

export function TwoEight({ speechSegments, tweets }: TwoEightProps) {
	const frame = useCurrentFrame();
	const transitionStartFrame = FULL_CAM_DURATION_FRAMES;
	useTrimKeyboard(speechSegments as Segment[], "2-8/good-takes.json");

	const fullCamConfig = getLayoutConfig("full-cam");
	const splitConfig = getLayoutConfig("cam-bottom-right");

	const progress = interpolate(
		frame,
		[transitionStartFrame, transitionStartFrame + TRANSITION_DURATION_FRAMES],
		[0, 1],
		{
			extrapolateLeft: "clamp",
			extrapolateRight: "clamp",
			easing: Easing.out((t) => Easing.quad(t)),
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

	const firstSegment = speechSegments[0] as Segment | undefined;
	const firstSegmentDuration = firstSegment
		? Math.ceil(
				((firstSegment.endMs - firstSegment.startMs) / 1000) * VIDEO_FPS,
			)
		: 0;

	let accumulatedFrames = 0;

	return (
		<AbsoluteFill style={{ backgroundColor: "#000" }}>
			{(speechSegments as Segment[]).map((segment, index) => {
				const segmentDuration = Math.ceil(
					((segment.endMs - segment.startMs) / 1000) * VIDEO_FPS,
				);
				const sequenceFrom = accumulatedFrames;
				accumulatedFrames += segmentDuration;
				const sequenceName =
					segment.label ?? segment.text ?? `Segment ${index + 1}`;

				return (
					<Sequence
						key={index}
						from={sequenceFrom}
						durationInFrames={segmentDuration}
						name={sequenceName}
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
			{tweets.length > 0 && firstSegmentDuration > 0 && (
				<Sequence
					durationInFrames={firstSegmentDuration}
					name="Tweet Wall Overlay"
				>
					<TweetWall tweets={tweets} />
				</Sequence>
			)}
		</AbsoluteFill>
	);
}
