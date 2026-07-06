import { ALL_FORMATS, Input, UrlSource } from "mediabunny";
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
import { getLayoutConfig, type Layout } from "../layouts";

const GOOD_TAKES_PATH = "remotion-on-vercel/good-takes.json";

const layoutEnum = z.enum([
	"full-cam",
	"full-monitor",
	"half-cam-left",
	"half-cam-right",
	"cam-left-5/12",
	"cam-right-5/12",
	"cam-top-right",
	"cam-bottom-right",
]);

const segmentSchema = z.object({
	startMs: z.number(),
	endMs: z.number(),
	text: z.string().optional(),
});

export const remotionOnVercelSchema = z.object({
	layout: layoutEnum.default("cam-bottom-right"),
	mirrorCam: z.boolean().default(true),
	showShortcuts: z.boolean().default(true),
	speechSegments: z.array(segmentSchema).default([]),
});

type RemotionOnVercelProps = z.infer<typeof remotionOnVercelSchema>;

type GoodTakeJson = {
	startSec: number;
	endSec: number;
	text: string;
};

async function getVideoDuration(src: string): Promise<number> {
	const input = new Input({
		formats: ALL_FORMATS,
		source: new UrlSource(src, {
			getRetryDelay: () => null,
		}),
	});

	return input.computeDuration();
}

async function loadGoodTakes(): Promise<GoodTakeJson[]> {
	const response = await fetch(staticFile(GOOD_TAKES_PATH));
	if (!response.ok) return [];
	return response.json();
}

function getTotalDuration(takes: GoodTakeJson[]): number {
	return takes.reduce(
		(total, take) => total + (take.endSec - take.startSec),
		0,
	);
}

export const calculateRemotionOnVercelMetadata: CalculateMetadataFunction<
	RemotionOnVercelProps
> = async ({ props }) => {
	const camSrc = staticFile("remotion-on-vercel/cam.mov");
	const screenSrc = staticFile("remotion-on-vercel/screen.mov");

	const [camDuration, screenDuration, goodTakes] = await Promise.all([
		getVideoDuration(camSrc),
		getVideoDuration(screenSrc),
		loadGoodTakes(),
	]);

	const speechSegments = goodTakes.map((take) => ({
		startMs: take.startSec * 1000,
		endMs: take.endSec * 1000,
		text: take.text,
	}));

	const totalTakeDuration = getTotalDuration(goodTakes);
	const videoDuration = Math.min(camDuration, screenDuration);
	const duration = totalTakeDuration > 0 ? totalTakeDuration : videoDuration;

	return {
		durationInFrames: Math.ceil(duration * VIDEO_FPS),
		fps: VIDEO_FPS,
		width: VIDEO_WIDTH,
		height: VIDEO_HEIGHT,
		props: {
			...props,
			speechSegments,
		},
	};
};

export function RemotionOnVercel({
	layout,
	mirrorCam,
	showShortcuts,
	speechSegments,
}: RemotionOnVercelProps) {
	const config = getLayoutConfig(layout as Layout);
	useTrimKeyboard(speechSegments, GOOD_TAKES_PATH);

	const camSrc = staticFile("remotion-on-vercel/cam.mov");
	const screenSrc = staticFile("remotion-on-vercel/screen.mov");

	let accumulatedFrames = 0;

	return (
		<AbsoluteFill style={{ backgroundColor: "#000" }}>
			{speechSegments.length === 0 ? (
				<>
					{config.monitor && (
						<OffthreadVideo
							src={screenSrc}
							style={{
								position: "absolute",
								left: config.monitor.x,
								top: config.monitor.y,
								width: config.monitor.width,
								height: config.monitor.height,
								objectFit: "cover",
							}}
						/>
					)}
					{config.cam && (
						<OffthreadVideo
							src={camSrc}
							style={{
								position: "absolute",
								left: config.cam.x,
								top: config.cam.y,
								width: config.cam.width,
								height: config.cam.height,
								objectFit: "cover",
								borderRadius: 28,
								transform: mirrorCam ? "scaleX(-1)" : undefined,
							}}
						/>
					)}
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
							{config.monitor && (
								<OffthreadVideo
									src={screenSrc}
									trimBefore={trimBefore}
									trimAfter={trimAfter}
									style={{
										position: "absolute",
										left: config.monitor.x,
										top: config.monitor.y,
										width: config.monitor.width,
										height: config.monitor.height,
										objectFit: "cover",
									}}
								/>
							)}
							{config.cam && (
								<OffthreadVideo
									src={camSrc}
									trimBefore={trimBefore}
									trimAfter={trimAfter}
									style={{
										position: "absolute",
										left: config.cam.x,
										top: config.cam.y,
										width: config.cam.width,
										height: config.cam.height,
										objectFit: "cover",
										borderRadius: 28,
										transform: mirrorCam ? "scaleX(-1)" : undefined,
									}}
								/>
							)}
						</Sequence>
					);
				})
			)}
			{showShortcuts && <TrimShortcutsOverlay />}
		</AbsoluteFill>
	);
}
