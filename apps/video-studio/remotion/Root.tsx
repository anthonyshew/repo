import { Composition } from "remotion";
import { videoConf } from "../config/scenes";
import { calcMetadata } from "./calculate-metadata/calc-metadata";
import { HelloWorld, helloWorldSchema } from "./compositions/HelloWorld";
import {
	calculateRemotionOnVercelMetadata,
	RemotionOnVercel,
	remotionOnVercelSchema,
} from "./compositions/RemotionOnVercel";
import {
	calculateRemotionOnVercel2Metadata,
	RemotionOnVercel2,
	remotionOnVercel2Schema,
} from "./compositions/RemotionOnVercel2";
import {
	calculateTurbo210Metadata,
	Turbo210,
	turbo210Schema,
} from "./compositions/Turbo210";
import {
	calculateTurbo29Metadata,
	Turbo29,
	turbo29Schema,
} from "./compositions/Turbo29";
import {
	calculateTurboIgnoreDedMetadata,
	TurboIgnoreDed,
	turboIgnoreDedSchema,
} from "./compositions/TurboIgnoreDed";
import {
	calculateTwoEightMetadata,
	TwoEight,
	twoEightSchema,
} from "./compositions/TwoEight";
import {
	calculateWatchFutureFlagMetadata,
	WatchFutureFlag,
	watchFutureFlagSchema,
} from "./compositions/WatchFutureFlag";
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
				id="remotion-on-vercel"
				component={RemotionOnVercel}
				schema={remotionOnVercelSchema}
				defaultProps={{
					layout: "cam-bottom-right",
					mirrorCam: true,
					showShortcuts: true,
					speechSegments: [],
				}}
				calculateMetadata={calculateRemotionOnVercelMetadata}
			/>
			<Composition
				id="remotion-on-vercel-2"
				component={RemotionOnVercel2}
				schema={remotionOnVercel2Schema}
				defaultProps={{
					mirrorCam: true,
					showShortcuts: true,
					speechSegments: [],
				}}
				calculateMetadata={calculateRemotionOnVercel2Metadata}
			/>
			<Composition
				id="2-8"
				component={TwoEight}
				schema={twoEightSchema}
				defaultProps={{
					title: "2-8",
					speechSegments: [],
					tweets: [],
				}}
				calculateMetadata={calculateTwoEightMetadata}
			/>
			<Composition
				id="watch-future-flag"
				component={WatchFutureFlag}
				schema={watchFutureFlagSchema}
				defaultProps={{
					mirrorCam: true,
					showShortcuts: true,
					speechSegments: [],
				}}
				calculateMetadata={calculateWatchFutureFlagMetadata}
			/>
			<Composition
				id="turbo-ignore-ded"
				component={TurboIgnoreDed}
				schema={turboIgnoreDedSchema}
				defaultProps={{
					mirrorCam: true,
					showShortcuts: true,
					speechSegments: [],
				}}
				calculateMetadata={calculateTurboIgnoreDedMetadata}
			/>
			<Composition
				id="turbo-2-9"
				component={Turbo29}
				schema={turbo29Schema}
				defaultProps={{
					mirrorCam: true,
					showShortcuts: true,
					speechSegments: [],
				}}
				calculateMetadata={calculateTurbo29Metadata}
			/>
			<Composition
				id="turbo-2-10"
				component={Turbo210}
				schema={turbo210Schema}
				defaultProps={{
					mirrorCam: true,
					showShortcuts: true,
					speechSegments: [],
					titleRevealFrom: 0,
					titleRevealDurationInFrames: 90,
					logoAppearAt: 0,
					majorAppearAt: 15,
					minorAppearAt: 25,
				}}
				calculateMetadata={calculateTurbo210Metadata}
			/>
		</>
	);
};
