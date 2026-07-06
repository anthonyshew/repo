import {
	AbsoluteFill,
	type CalculateMetadataFunction,
	OffthreadVideo,
	Sequence,
	staticFile,
} from "remotion";
import { z } from "zod";
import { TrimShortcutsOverlay } from "../components/TrimShortcutsOverlay";
import { VIDEO_FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from "../constants";
import { useTrimKeyboard } from "../helpers/use-trim-keyboard";
import { getLayoutConfig } from "../layouts";

const GOOD_TAKES_PATH = "watch-future-flag/good-takes.json";

const segmentSchema = z.object({
	startMs: z.number(),
	endMs: z.number(),
	text: z.string().optional(),
});

export const watchFutureFlagSchema = z.object({
	mirrorCam: z.boolean().default(true),
	showShortcuts: z.boolean().default(true),
	speechSegments: z.array(segmentSchema).default([]),
});

type WatchFutureFlagProps = z.infer<typeof watchFutureFlagSchema>;

type GoodTakeJson = {
	startSec: number;
	endSec: number;
	text: string;
};

async function loadGoodTakes(): Promise<GoodTakeJson[]> {
	const response = await fetch(staticFile(GOOD_TAKES_PATH));
	if (!response.ok) return [];
	return response.json();
}

export const calculateWatchFutureFlagMetadata: CalculateMetadataFunction<
	WatchFutureFlagProps
> = async ({ props }) => {
	const goodTakes = await loadGoodTakes();

	const speechSegments = goodTakes.map((take) => ({
		startMs: take.startSec * 1000,
		endMs: take.endSec * 1000,
		text: take.text,
	}));

	const totalDuration = speechSegments.reduce(
		(total, seg) => total + (seg.endMs - seg.startMs) / 1000,
		0,
	);

	return {
		durationInFrames: Math.max(1, Math.ceil(totalDuration * VIDEO_FPS)),
		fps: VIDEO_FPS,
		width: VIDEO_WIDTH,
		height: VIDEO_HEIGHT,
		props: {
			...props,
			speechSegments,
		},
	};
};

export function WatchFutureFlag({
	mirrorCam,
	showShortcuts,
	speechSegments,
}: WatchFutureFlagProps) {
	useTrimKeyboard(speechSegments, GOOD_TAKES_PATH);

	const camSrc = staticFile("watch-future-flag/cam.mov");
	const screenSrc = staticFile("watch-future-flag/screen.mov");
	const layout = getLayoutConfig("cam-bottom-right");

	let accumulatedFrames = 0;

	return (
		<AbsoluteFill style={{ backgroundColor: "#000" }}>
			{speechSegments.length === 0 ? (
				<>
					<OffthreadVideo
						src={screenSrc}
						style={{
							position: "absolute",
							left: layout.monitor!.x,
							top: layout.monitor!.y,
							width: layout.monitor!.width,
							height: layout.monitor!.height,
							objectFit: "cover",
						}}
					/>
					<OffthreadVideo
						src={camSrc}
						style={{
							position: "absolute",
							left: layout.cam!.x,
							top: layout.cam!.y,
							width: layout.cam!.width,
							height: layout.cam!.height,
							objectFit: "cover",
							borderRadius: 28,
							transform: mirrorCam ? "scaleX(-1)" : undefined,
						}}
					/>
				</>
			) : (
				speechSegments.map((segment, index) => {
					const segmentDuration = Math.ceil(
						((segment.endMs - segment.startMs) / 1000) * VIDEO_FPS,
					);
					const trimBefore = Math.floor((segment.startMs / 1000) * VIDEO_FPS);
					const trimAfter = Math.ceil((segment.endMs / 1000) * VIDEO_FPS);
					const sequenceFrom = accumulatedFrames;
					accumulatedFrames += segmentDuration;

					return (
						<Sequence
							key={index}
							from={sequenceFrom}
							durationInFrames={segmentDuration}
							name={
								segment.text
									? segment.text.slice(0, 40) + "..."
									: `Segment ${index + 1}`
							}
						>
							<OffthreadVideo
								src={screenSrc}
								trimBefore={trimBefore}
								trimAfter={trimAfter}
								style={{
									position: "absolute",
									left: layout.monitor!.x,
									top: layout.monitor!.y,
									width: layout.monitor!.width,
									height: layout.monitor!.height,
									objectFit: "cover",
								}}
							/>
							<OffthreadVideo
								src={camSrc}
								trimBefore={trimBefore}
								trimAfter={trimAfter}
								style={{
									position: "absolute",
									left: layout.cam!.x,
									top: layout.cam!.y,
									width: layout.cam!.width,
									height: layout.cam!.height,
									objectFit: "cover",
									borderRadius: 28,
									transform: mirrorCam ? "scaleX(-1)" : undefined,
								}}
							/>
						</Sequence>
					);
				})
			)}
			{showShortcuts && <TrimShortcutsOverlay />}
		</AbsoluteFill>
	);
}
