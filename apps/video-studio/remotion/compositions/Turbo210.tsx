import { Audio } from "@remotion/media";
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
import { TurboTitleReveal } from "../components/TurboTitleReveal";
import { VIDEO_FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from "../constants";
import { useTrimKeyboard } from "../helpers/use-trim-keyboard";
import { getLayoutConfig } from "../layouts";

const GOOD_TAKES_PATH = "2-10/good-takes.json";
const audioVariantSchema = z.enum([
	"embedded",
	"audio-variants/subtle.wav",
	"audio-variants/presence.wav",
	"audio-variants/balanced.wav",
	"audio-variants/quiet.wav",
	"audio-variants/clean.wav",
	"audio-variants/clean-presence.wav",
	"audio-variants/denoise.wav",
]);

// screen.mov shipped with its audio track ~3.7s shorter than its video, so the
// audio drifted progressively ahead of the picture. screen-synced.mov is the
// same video with the audio time-stretched to match. To revert, set this back
// to "screen.mov" (the original is untouched).
const SCREEN_SRC = "2-10/screen-synced.mov";
const PROCESSED_AUDIO_VOLUME = 0.5625;

const segmentSchema = z.object({
	startMs: z.number(),
	endMs: z.number(),
	text: z.string().optional(),
});

export const turbo210Schema = z.object({
	mirrorCam: z.boolean().default(true),
	showShortcuts: z.boolean().default(true),
	audioVariant: audioVariantSchema.default("embedded"),
	speechSegments: z.array(segmentSchema).default([]),
	// Title reveal timings, in absolute frames on the composition timeline.
	// Set titleRevealFrom to -1 to hide the reveal entirely.
	titleRevealFrom: z.number().default(0),
	titleRevealDurationInFrames: z.number().default(90),
	logoAppearAt: z.number().default(0),
	majorAppearAt: z.number().default(15),
	minorAppearAt: z.number().default(30),
});

type Turbo210Props = z.infer<typeof turbo210Schema>;

const CAM_INTRO_FRAMES = 100;
const CAM_TRANSITION_FRAMES = 15;

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

export const calculateTurbo210Metadata: CalculateMetadataFunction<
	Turbo210Props
> = async ({ props }) => {
	const goodTakes = await loadGoodTakes();

	const speechSegments = goodTakes.map((take) => ({
		startMs: take.startSec * 1000,
		endMs: take.endSec * 1000,
		text: take.text,
	}));

	const totalFrames = speechSegments.reduce(
		(total, seg) =>
			total +
			Math.max(1, Math.round(((seg.endMs - seg.startMs) / 1000) * VIDEO_FPS)),
		0,
	);

	return {
		durationInFrames: Math.max(1, totalFrames),
		fps: VIDEO_FPS,
		width: VIDEO_WIDTH,
		height: VIDEO_HEIGHT,
		props: {
			...props,
			speechSegments,
		},
	};
};

export function Turbo210({
	mirrorCam,
	showShortcuts,
	audioVariant,
	speechSegments,
	titleRevealFrom,
	titleRevealDurationInFrames,
	logoAppearAt,
	majorAppearAt,
	minorAppearAt,
}: Turbo210Props) {
	useTrimKeyboard(speechSegments, GOOD_TAKES_PATH);

	const frame = useCurrentFrame();

	const camSrc = staticFile("2-10/cam.mov");
	const screenSrc = staticFile(SCREEN_SRC);
	const audioSrc =
		audioVariant === "embedded" ? null : staticFile(`2-10/${audioVariant}`);
	const layout = getLayoutConfig("cam-bottom-right");
	const fullCam = getLayoutConfig("full-cam");

	// Hold the cam full screen until frame CAM_INTRO_FRAMES, then transition it
	// to its bottom-right corner over CAM_TRANSITION_FRAMES frames.
	const progress = interpolate(
		frame,
		[CAM_INTRO_FRAMES, CAM_INTRO_FRAMES + CAM_TRANSITION_FRAMES],
		[0, 1],
		{
			extrapolateLeft: "clamp",
			extrapolateRight: "clamp",
			easing: Easing.out(Easing.quad),
		},
	);
	const camStyle = {
		position: "absolute" as const,
		left: interpolate(progress, [0, 1], [fullCam.cam!.x, layout.cam!.x]),
		top: interpolate(progress, [0, 1], [fullCam.cam!.y, layout.cam!.y]),
		width: interpolate(
			progress,
			[0, 1],
			[fullCam.cam!.width, layout.cam!.width],
		),
		height: interpolate(
			progress,
			[0, 1],
			[fullCam.cam!.height, layout.cam!.height],
		),
		objectFit: "cover" as const,
		borderRadius: 28,
		transform: mirrorCam ? "scaleX(-1)" : undefined,
	};

	let accumulatedFrames = 0;

	return (
		<AbsoluteFill style={{ backgroundColor: "#000" }}>
			{speechSegments.length === 0 ? (
				<>
					{audioSrc ? (
						<Audio src={audioSrc} volume={PROCESSED_AUDIO_VOLUME} />
					) : null}
					<OffthreadVideo
						src={screenSrc}
						muted={audioSrc !== null}
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
						muted={audioSrc !== null}
						style={camStyle}
					/>
				</>
			) : (
				speechSegments.map((segment, index) => {
					const segmentDuration = Math.max(
						1,
						Math.round(
							((segment.endMs - segment.startMs) / 1000) * VIDEO_FPS,
						),
					);
					const trimBefore = Math.round((segment.startMs / 1000) * VIDEO_FPS);
					const trimAfter = trimBefore + segmentDuration;
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
							{audioSrc ? (
								<Audio
									src={audioSrc}
									volume={PROCESSED_AUDIO_VOLUME}
									trimBefore={trimBefore}
									trimAfter={trimAfter}
								/>
							) : null}
							<OffthreadVideo
								src={screenSrc}
								muted={audioSrc !== null}
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
								muted={audioSrc !== null}
								trimBefore={trimBefore}
								trimAfter={trimAfter}
								style={camStyle}
							/>
						</Sequence>
					);
				})
			)}
			{titleRevealFrom >= 0 && (
				<Sequence
					from={titleRevealFrom}
					durationInFrames={titleRevealDurationInFrames}
					name="Turbo Title Reveal"
				>
					<TurboTitleReveal
						logoAppearAt={logoAppearAt}
						majorAppearAt={majorAppearAt}
						minorAppearAt={minorAppearAt}
					/>
				</Sequence>
			)}
			{showShortcuts && <TrimShortcutsOverlay />}
		</AbsoluteFill>
	);
}
