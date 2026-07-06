import {
	AbsoluteFill,
	type CalculateMetadataFunction,
	interpolate,
	OffthreadVideo,
	Sequence,
	staticFile,
	useCurrentFrame,
} from "remotion";
import { z } from "zod";
import { TITLE_FONT } from "../../config/fonts";
import { TrimShortcutsOverlay } from "../components/TrimShortcutsOverlay";
import { VIDEO_FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from "../constants";
import { useTrimKeyboard } from "../helpers/use-trim-keyboard";
import { getLayoutConfig } from "../layouts";

const GOOD_TAKES_PATH = "turbo-ignore-ded/good-takes.json";

const segmentSchema = z.object({
	startMs: z.number(),
	endMs: z.number(),
	text: z.string().optional(),
});

export const turboIgnoreDedSchema = z.object({
	mirrorCam: z.boolean().default(true),
	showShortcuts: z.boolean().default(true),
	speechSegments: z.array(segmentSchema).default([]),
});

type TurboIgnoreDedProps = z.infer<typeof turboIgnoreDedSchema>;

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

export const calculateTurboIgnoreDedMetadata: CalculateMetadataFunction<
	TurboIgnoreDedProps
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

export function TurboIgnoreDed({
	mirrorCam,
	showShortcuts,
	speechSegments,
}: TurboIgnoreDedProps) {
	useTrimKeyboard(speechSegments, GOOD_TAKES_PATH);
	const frame = useCurrentFrame();

	const CAM_FADE_OUT = 12111;
	const CAM_FADE_IN = 12400;
	const FADE_DURATION = 15;

	const camOpacity = interpolate(
		frame,
		[
			CAM_FADE_OUT,
			CAM_FADE_OUT + FADE_DURATION,
			CAM_FADE_IN,
			CAM_FADE_IN + FADE_DURATION,
		],
		[1, 0, 0, 1],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" },
	);

	const camSrc = staticFile("turbo-ignore-ded/cam.mov");
	const screenSrc = staticFile("turbo-ignore-ded/screen.mov");
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
							opacity: camOpacity,
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
									opacity: camOpacity,
									transform: mirrorCam ? "scaleX(-1)" : undefined,
								}}
							/>
						</Sequence>
					);
				})
			)}
			{speechSegments.length > 0 &&
				(() => {
					const first = speechSegments[0]!;
					const dur = Math.ceil(
						((first.endMs - first.startMs) / 1000) * VIDEO_FPS,
					);
					return (
						<Sequence durationInFrames={dur} name="Title Graphic">
							<AbsoluteFill
								style={{
									justifyContent: "center",
									alignItems: "center",
								}}
							>
								<svg
									width={400}
									height={600}
									viewBox="0 0 400 600"
									style={{
										position: "absolute",
										top: 500,
										left: "40%",
										transform: "rotate(-30deg) scale(1.3)",
									}}
								>
									<title>Arrow</title>
									<polygon
										points="200,0 50,250 150,250 150,600 250,600 250,250 350,250"
										fill="#e51c23"
									/>
								</svg>
								<div
									style={{
										position: "absolute",
										bottom: 100,
										left: -50,
										right: 0,
										...TITLE_FONT,
										fontSize: 350,
										color: "#fff",
										lineHeight: 1.1,
										padding: "0 120px",
									}}
								>
									THE WORST API
									<br />
									IN TURBOREPO
								</div>
							</AbsoluteFill>
						</Sequence>
					);
				})()}
			{showShortcuts && <TrimShortcutsOverlay />}
		</AbsoluteFill>
	);
}
