import {
	AbsoluteFill,
	Easing,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from "remotion";
import { z } from "zod";
import { PlaceholderCam } from "../components/PlaceholderCam";
import { PlaceholderMonitor } from "../components/PlaceholderMonitor";
import { getLayoutConfig, type Layout } from "../layouts";

export const helloWorldSchema = z.object({});

const LAYOUTS: Layout[] = [
	"full-cam",
	"full-monitor",
	"half-cam-left",
	"half-cam-right",
	"cam-left-5/12",
	"cam-right-5/12",
	"cam-top-right",
	"cam-bottom-right",
	"zoom-in",
];

const SECONDS_PER_LAYOUT = 5;
const TRANSITION_FRAMES = 20;

function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

export function HelloWorld(_props: z.infer<typeof helloWorldSchema>) {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const framesPerLayout = SECONDS_PER_LAYOUT * fps;
	const layoutIndex = Math.min(
		Math.floor(frame / framesPerLayout),
		LAYOUTS.length - 1,
	);
	const frameInLayout = frame % framesPerLayout;

	const currentLayout = LAYOUTS[layoutIndex] as Layout;
	const nextLayout = LAYOUTS[
		Math.min(layoutIndex + 1, LAYOUTS.length - 1)
	] as Layout;

	const currentConfig = getLayoutConfig(currentLayout);
	const nextConfig = getLayoutConfig(nextLayout);

	const isTransitioning =
		frameInLayout >= framesPerLayout - TRANSITION_FRAMES &&
		layoutIndex < LAYOUTS.length - 1;

	const progress = isTransitioning
		? interpolate(
				frameInLayout,
				[framesPerLayout - TRANSITION_FRAMES, framesPerLayout],
				[0, 1],
				{ easing: Easing.inOut(Easing.cubic) },
			)
		: 0;

	const camRect = (() => {
		if (!isTransitioning) return currentConfig.cam;
		if (!currentConfig.cam && !nextConfig.cam) return null;
		if (!currentConfig.cam) return nextConfig.cam;
		if (!nextConfig.cam) return currentConfig.cam;

		return {
			x: lerp(currentConfig.cam.x, nextConfig.cam.x, progress),
			y: lerp(currentConfig.cam.y, nextConfig.cam.y, progress),
			width: lerp(currentConfig.cam.width, nextConfig.cam.width, progress),
			height: lerp(currentConfig.cam.height, nextConfig.cam.height, progress),
		};
	})();

	const monitorRect = (() => {
		if (!isTransitioning) return currentConfig.monitor;
		if (!currentConfig.monitor && !nextConfig.monitor) return null;
		if (!currentConfig.monitor) return nextConfig.monitor;
		if (!nextConfig.monitor) return currentConfig.monitor;

		return {
			x: lerp(currentConfig.monitor.x, nextConfig.monitor.x, progress),
			y: lerp(currentConfig.monitor.y, nextConfig.monitor.y, progress),
			width: lerp(
				currentConfig.monitor.width,
				nextConfig.monitor.width,
				progress,
			),
			height: lerp(
				currentConfig.monitor.height,
				nextConfig.monitor.height,
				progress,
			),
		};
	})();

	const camOpacity = (() => {
		if (!isTransitioning) return currentConfig.cam ? 1 : 0;
		if (currentConfig.cam && nextConfig.cam) return 1;
		if (!currentConfig.cam && nextConfig.cam) return progress;
		if (currentConfig.cam && !nextConfig.cam) return 1 - progress;
		return 0;
	})();

	const monitorOpacity = (() => {
		if (!isTransitioning) return currentConfig.monitor ? 1 : 0;
		if (currentConfig.monitor && nextConfig.monitor) return 1;
		if (!currentConfig.monitor && nextConfig.monitor) return progress;
		if (currentConfig.monitor && !nextConfig.monitor) return 1 - progress;
		return 0;
	})();

	return (
		<AbsoluteFill style={{ backgroundColor: "#000" }}>
			{monitorRect && monitorOpacity > 0 && (
				<AbsoluteFill
					style={{
						left: monitorRect.x,
						top: monitorRect.y,
						width: monitorRect.width,
						height: monitorRect.height,
						right: "auto",
						bottom: "auto",
						opacity: monitorOpacity,
					}}
				>
					<PlaceholderMonitor />
				</AbsoluteFill>
			)}
			{camRect && camOpacity > 0 && (
				<AbsoluteFill
					style={{
						left: camRect.x,
						top: camRect.y,
						width: camRect.width,
						height: camRect.height,
						right: "auto",
						bottom: "auto",
						opacity: camOpacity,
					}}
				>
					<PlaceholderCam />
				</AbsoluteFill>
			)}
			<div
				style={{
					position: "absolute",
					top: 60,
					left: 60,
					color: "white",
					fontSize: 72,
					fontFamily: "monospace",
					fontWeight: 700,
					textShadow: "0 4px 20px rgba(0,0,0,0.8)",
				}}
			>
				{currentLayout}
			</div>
		</AbsoluteFill>
	);
}
