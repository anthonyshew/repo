import {
	AbsoluteFill,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from "remotion";

export function PlaceholderMonitor() {
	const frame = useCurrentFrame();
	const { width, height } = useVideoConfig();

	const gridSize = 80;
	const cols = Math.ceil(width / gridSize);
	const rows = Math.ceil(height / gridSize);

	return (
		<AbsoluteFill style={{ backgroundColor: "#1a1a2e" }}>
			<svg width={width} height={height}>
				{Array.from({ length: rows }).map((_, row) =>
					Array.from({ length: cols }).map((_, col) => {
						const delay = (row + col) * 2;
						const pulse = interpolate(
							(frame + delay) % 60,
							[0, 30, 60],
							[0.1, 0.4, 0.1],
						);

						return (
							<rect
								key={`${row}-${col}`}
								x={col * gridSize + 4}
								y={row * gridSize + 4}
								width={gridSize - 8}
								height={gridSize - 8}
								rx={8}
								fill={`rgba(99, 102, 241, ${pulse})`}
							/>
						);
					}),
				)}
			</svg>
			<div
				style={{
					position: "absolute",
					bottom: 60,
					left: 60,
					color: "rgba(255,255,255,0.5)",
					fontSize: 48,
					fontFamily: "monospace",
				}}
			>
				MONITOR
			</div>
		</AbsoluteFill>
	);
}
