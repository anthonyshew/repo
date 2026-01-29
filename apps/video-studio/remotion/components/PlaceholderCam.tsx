import {
	AbsoluteFill,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from "remotion";

export function PlaceholderCam() {
	const frame = useCurrentFrame();
	const { width, height } = useVideoConfig();

	const breathe = interpolate(frame % 90, [0, 45, 90], [1, 1.05, 1]);
	const circleSize = Math.min(width, height) * 0.3;

	return (
		<AbsoluteFill
			style={{
				backgroundColor: "#2d2d44",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<div
				style={{
					width: circleSize,
					height: circleSize,
					borderRadius: "50%",
					backgroundColor: "#4a4a6a",
					transform: `scale(${breathe})`,
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<div
					style={{
						color: "rgba(255,255,255,0.6)",
						fontSize: circleSize * 0.15,
						fontFamily: "system-ui",
					}}
				>
					CAM
				</div>
			</div>
		</AbsoluteFill>
	);
}
