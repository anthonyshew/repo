import { Img, staticFile, useCurrentFrame } from "remotion";
import { TITLE_FONT } from "../../config/fonts";

const TURBO_LOGO_PATH = "2-10/turbo-logo.svg";

const LOGO_SIZE = 1080;
const FONT_SIZE = 1140;
const GAP = 90;

const TEXT_STYLE: React.CSSProperties = {
	...TITLE_FONT,
	fontSize: FONT_SIZE,
	lineHeight: 1,
	color: "#fff",
	whiteSpace: "nowrap",
};

export type TurboTitleRevealProps = {
	/** Frame the Turborepo logo appears. */
	logoAppearAt?: number;
	/** Frame the "2" appears. */
	majorAppearAt?: number;
	/** Frame the ".10" appears. */
	minorAppearAt?: number;
};

/**
 * Progressively reveals the Turborepo logo, then "2", then ".10" as each is
 * spoken. The full "logo 2 .10" group is laid out and centered as one unit, so
 * the final composition sits in the middle of the frame. Each element reserves
 * its slot from the start and only toggles visibility at its *AppearAt frame —
 * so nothing ever reflows or moves as pieces appear. Timings are relative to
 * the frame this overlay is mounted, so the caller controls the pacing.
 */
export function TurboTitleReveal({
	logoAppearAt = 0,
	majorAppearAt = 15,
	minorAppearAt = 30,
}: TurboTitleRevealProps) {
	const frame = useCurrentFrame();

	return (
		<div
			style={{
				position: "absolute",
				inset: 0,
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				gap: GAP,
			}}
		>
			<Img
				src={staticFile(TURBO_LOGO_PATH)}
				style={{
					width: LOGO_SIZE,
					height: LOGO_SIZE,
					display: "block",
					visibility: frame >= logoAppearAt ? "visible" : "hidden",
				}}
			/>
			<span
				style={{
					...TEXT_STYLE,
					visibility: frame >= majorAppearAt ? "visible" : "hidden",
				}}
			>
				2
			</span>
			<span
				style={{
					...TEXT_STYLE,
					visibility: frame >= minorAppearAt ? "visible" : "hidden",
				}}
			>
				.10
			</span>
		</div>
	);
}
