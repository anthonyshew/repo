import { Composition } from "remotion";
import { videoConf } from "../config/scenes";
import { calcMetadata } from "./calculate-metadata/calc-metadata";
import { HelloWorld, helloWorldSchema } from "./compositions/HelloWorld";
import {
	calculateTwoEightMetadata,
	TwoEight,
	twoEightSchema,
} from "./compositions/TwoEight";
import { VIDEO_FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from "./constants";
import { GoToRecorder } from "./GoToRecorder";
import { Main } from "./Main";

const LAYOUT_COUNT = 9;
const SECONDS_PER_LAYOUT = 5;

export const RemotionRoot = () => {
	return (
		<>
			<Composition
				component={Main}
				id="welcome"
				schema={videoConf}
				defaultProps={{
					theme: "light" as const,
					canvasLayout: "square" as const,
					scenes: [],
					scenesAndMetadata: [],
					platform: "x" as const,
				}}
				calculateMetadata={calcMetadata}
			/>
			<Composition
				component={GoToRecorder}
				id="record"
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={100}
			/>
			<Composition
				component={Main}
				id="empty"
				schema={videoConf}
				defaultProps={{
					theme: "light" as const,
					canvasLayout: "square" as const,
					platform: "youtube",
					scenes: [],
					scenesAndMetadata: [],
				}}
				calculateMetadata={calcMetadata}
			/>
			<Composition
				id="LayoutDemo"
				component={HelloWorld}
				durationInFrames={LAYOUT_COUNT * SECONDS_PER_LAYOUT * VIDEO_FPS}
				fps={VIDEO_FPS}
				width={VIDEO_WIDTH}
				height={VIDEO_HEIGHT}
				schema={helloWorldSchema}
				defaultProps={{}}
			/>
			<Composition
				id="2-8"
				component={TwoEight}
				schema={twoEightSchema}
				defaultProps={{
					title: "2-8",
				}}
				calculateMetadata={calculateTwoEightMetadata}
			/>
		</>
	);
};
