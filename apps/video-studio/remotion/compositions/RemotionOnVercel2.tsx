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

const GOOD_TAKES_PATH = "remotion-on-vercel-2/good-takes.json";

const segmentSchema = z.object({
	startMs: z.number(),
	endMs: z.number(),
	text: z.string().optional(),
});

export const remotionOnVercel2Schema = z.object({
	mirrorCam: z.boolean().default(true),
	showShortcuts: z.boolean().default(true),
	speechSegments: z.array(segmentSchema).default([]),
});

type RemotionOnVercel2Props = z.infer<typeof remotionOnVercel2Schema>;

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

export const calculateRemotionOnVercel2Metadata: CalculateMetadataFunction<
	RemotionOnVercel2Props
> = async ({ props }) => {
	const camSrc = staticFile("remotion-on-vercel-2/cam.mov");

	const [camDuration, goodTakes] = await Promise.all([
		getVideoDuration(camSrc),
		loadGoodTakes(),
	]);

	const camDurationMs = camDuration * 1000;
	const speechSegments = goodTakes.map((take) => ({
		startMs: take.startSec * 1000,
		endMs: Math.min(take.endSec * 1000, camDurationMs),
		text: take.text,
	}));

	const totalTakeDuration = speechSegments.reduce(
		(total, seg) => total + (seg.endMs - seg.startMs) / 1000,
		0,
	);
	const duration = totalTakeDuration > 0 ? totalTakeDuration : camDuration;

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

export function RemotionOnVercel2({
	mirrorCam,
	showShortcuts,
	speechSegments,
}: RemotionOnVercel2Props) {
	useTrimKeyboard(speechSegments, GOOD_TAKES_PATH);

	const camSrc = staticFile("remotion-on-vercel-2/cam.mov");

	let accumulatedFrames = 0;

	return (
		<AbsoluteFill style={{ backgroundColor: "#000" }}>
			{speechSegments.length === 0 ? (
				<OffthreadVideo
					src={camSrc}
					style={{
						width: VIDEO_WIDTH,
						height: VIDEO_HEIGHT,
						objectFit: "cover",
						transform: mirrorCam ? "scaleX(-1)" : undefined,
					}}
				/>
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
								src={camSrc}
								trimBefore={trimBefore}
								trimAfter={trimAfter}
								style={{
									width: VIDEO_WIDTH,
									height: VIDEO_HEIGHT,
									objectFit: "cover",
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
