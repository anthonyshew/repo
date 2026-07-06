import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";

export type Tweet = {
	id: string;
	image: string;
};

type TweetCardProps = {
	tweet: Tweet;
	x: number;
	y: number;
	rotation: number;
	scale?: number;
	enterDelay?: number;
};

const CARD_ENTER_DURATION = 12;

export function TweetCard({
	tweet,
	x,
	y,
	rotation,
	scale = 2,
	enterDelay = 0,
}: TweetCardProps) {
	const frame = useCurrentFrame();

	const localFrame = frame - enterDelay;
	const progress = interpolate(localFrame, [0, CARD_ENTER_DURATION], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	const entryScale = interpolate(progress, [0, 1], [0.5, 1]);
	const opacity = interpolate(progress, [0, 0.5], [0, 1], {
		extrapolateRight: "clamp",
	});

	if (localFrame < 0) return null;

	return (
		<div
			style={{
				position: "absolute",
				left: x,
				top: y,
				transform: `rotate(${rotation}deg) scale(${scale * entryScale})`,
				transformOrigin: "center center",
				opacity,
				borderRadius: 24,
				overflow: "hidden",
				boxShadow: "0 12px 48px rgba(0, 0, 0, 0.5)",
			}}
		>
			<Img
				src={staticFile(tweet.image)}
				style={{
					display: "block",
					maxWidth: 800,
				}}
			/>
		</div>
	);
}
