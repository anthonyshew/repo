import { getRemotionEnvironment } from "remotion";

type ShortcutEntry = {
	key: string;
	label: string;
};

const DEFAULT_SHORTCUTS: ShortcutEntry[] = [
	{ key: "[", label: "Trim start" },
	{ key: "]", label: "Trim end" },
	{ key: "S", label: "Split" },
	{ key: "D", label: "Delete clip" },
	{ key: "\u2318Z", label: "Undo" },
];

type TrimShortcutsOverlayProps = {
	shortcuts?: ShortcutEntry[];
};

export function TrimShortcutsOverlay({
	shortcuts = DEFAULT_SHORTCUTS,
}: TrimShortcutsOverlayProps) {
	if (!getRemotionEnvironment().isStudio) {
		return null;
	}

	return (
		<div
			style={{
				position: "absolute",
				bottom: 80,
				left: 80,
				display: "flex",
				flexDirection: "column",
				gap: 24,
				padding: "40px 48px",
				borderRadius: 28,
				backgroundColor: "rgba(0, 0, 0, 0.7)",
				backdropFilter: "blur(8px)",
				fontFamily: "system-ui, sans-serif",
				fontSize: 42,
				color: "#ccc",
				pointerEvents: "none",
				zIndex: 1000,
			}}
		>
			{shortcuts.map(({ key, label }) => (
				<div
					key={key}
					style={{ display: "flex", alignItems: "center", gap: 28 }}
				>
					<kbd
						style={{
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
							minWidth: 80,
							height: 72,
							padding: "0 20px",
							borderRadius: 14,
							backgroundColor: "rgba(255, 255, 255, 0.12)",
							border: "3px solid rgba(255, 255, 255, 0.2)",
							color: "#fff",
							fontSize: 38,
							fontFamily: "system-ui, sans-serif",
							fontWeight: 600,
						}}
					>
						{key}
					</kbd>
					<span>{label}</span>
				</div>
			))}
		</div>
	);
}
