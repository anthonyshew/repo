import { ALL_FORMATS, Input, UrlSource } from "mediabunny";
import {
	AbsoluteFill,
	type CalculateMetadataFunction,
	OffthreadVideo,
	staticFile,
} from "remotion";
import { z } from "zod";
import { VIDEO_FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from "../constants";

export const twoEightSchema = z.object({
	title: z.string().default("2-8"),
});

type TwoEightProps = z.infer<typeof twoEightSchema>;

const getVideoDuration = async (src: string): Promise<number> => {
	const input = new Input({
		formats: ALL_FORMATS,
		source: new UrlSource(src, {
			getRetryDelay: () => null,
		}),
	});
	return input.computeDuration();
};

export const calculateTwoEightMetadata: CalculateMetadataFunction<
	TwoEightProps
> = async () => {
	const [screenDuration, camDuration] = await Promise.all([
		getVideoDuration(staticFile("2-8/screen-2.mov")),
		getVideoDuration(staticFile("2-8/cam-2.mov")),
	]);

	const maxDuration = Math.max(screenDuration, camDuration);

	return {
		durationInFrames: Math.ceil(maxDuration * VIDEO_FPS),
		fps: VIDEO_FPS,
		width: VIDEO_WIDTH,
		height: VIDEO_HEIGHT,
	};
};

export function TwoEight(_props: z.infer<typeof twoEightSchema>) {
	return (
		<AbsoluteFill style={{ backgroundColor: "#000" }}>
			<OffthreadVideo
				src={staticFile("2-8/screen-2.mov")}
				style={{ width: "100%", height: "100%" }}
			/>
			<OffthreadVideo
				src={staticFile("2-8/cam-2.mov")}
				style={{ width: "100%", height: "100%" }}
			/>
		</AbsoluteFill>
	);
}
