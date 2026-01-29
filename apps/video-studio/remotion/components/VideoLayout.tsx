import { AbsoluteFill, OffthreadVideo } from "remotion";
import { getLayoutConfig, type Layout } from "../layouts";

type VideoLayoutProps = {
	layout: Layout;
	camSrc: string;
	monitorSrc: string;
};

export function VideoLayout({ layout, camSrc, monitorSrc }: VideoLayoutProps) {
	const config = getLayoutConfig(layout);

	return (
		<AbsoluteFill style={{ backgroundColor: "#000" }}>
			{config.monitor && (
				<OffthreadVideo
					src={monitorSrc}
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
					}}
				/>
			)}
		</AbsoluteFill>
	);
}
