import { AbsoluteFill } from "remotion";
import { VIDEO_HEIGHT, VIDEO_WIDTH } from "../../constants";
import { type Tweet, TweetCard } from "./TweetCard";

type TweetWallProps = {
	tweets: Tweet[];
};

type TweetPosition = {
	x: number;
	y: number;
	rotation: number;
	scale: number;
	phase: 1 | 2 | 3 | 4;
};

function seededRandom(seed: number) {
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
}

type Corner = "top-right" | "bottom-left" | "top-left" | "bottom-right";

const CORNER_REGIONS: Record<
	Corner,
	{ xMin: number; xMax: number; yMin: number; yMax: number }
> = {
	"top-right": {
		xMin: VIDEO_WIDTH * 0.6,
		xMax: VIDEO_WIDTH - 100,
		yMin: 100,
		yMax: VIDEO_HEIGHT * 0.45,
	},
	"bottom-left": {
		xMin: 100,
		xMax: VIDEO_WIDTH * 0.45,
		yMin: VIDEO_HEIGHT * 0.65,
		yMax: VIDEO_HEIGHT - 100,
	},
	"top-left": {
		xMin: 100,
		xMax: VIDEO_WIDTH * 0.2,
		yMin: 0,
		yMax: VIDEO_HEIGHT * 0.55,
	},
	"bottom-right": {
		xMin: VIDEO_WIDTH * 0.55,
		xMax: VIDEO_WIDTH - 100,
		yMin: VIDEO_HEIGHT * 0.55,
		yMax: VIDEO_HEIGHT - 100,
	},
};

function generateCollagePositions(
	count: number,
	seed: number,
): TweetPosition[] {
	const positions: TweetPosition[] = [];
	const cardWidth = 480;
	const cardHeight = 280;

	for (let i = 0; i < count; i++) {
		let phase: 1 | 2 | 3 | 4;
		let corner: Corner;

		if (i < 3) {
			phase = 1;
			corner = "top-left";
		} else if (i < 6) {
			phase = 2;
			corner = "bottom-right";
		} else if (i < 9) {
			phase = 3;
			corner = "top-right";
		} else {
			phase = 4;
			corner = "bottom-left";
		}

		const region = CORNER_REGIONS[corner];
		const indexInCorner = i < 3 ? i : i < 6 ? i - 3 : i < 9 ? i - 6 : i - 9;
		const countInCorner = i < 9 ? 3 : count - 9;

		const baseSeed = seed + i * 1000;

		const regionWidth = region.xMax - region.xMin - cardWidth;
		const regionHeight = region.yMax - region.yMin - cardHeight;

		const cols = Math.min(countInCorner, 2);
		const rows = Math.ceil(countInCorner / cols);
		const col = indexInCorner % cols;
		const row = Math.floor(indexInCorner / cols);

		const cellWidth = regionWidth / cols;
		const cellHeight = regionHeight / Math.max(rows, 1);

		const baseX = region.xMin + col * cellWidth + cellWidth / 2;
		const baseY = region.yMin + row * cellHeight + cellHeight / 2;

		const randomOffsetX = (seededRandom(baseSeed) - 0.5) * 80;
		const randomOffsetY = (seededRandom(baseSeed + 1) - 0.5) * 60;
		const rotation = (seededRandom(baseSeed + 2) - 0.5) * 10;
		const scale = 1.35 + seededRandom(baseSeed + 3) * 0.3;

		positions.push({
			x: baseX + randomOffsetX,
			y: baseY + randomOffsetY,
			rotation,
			scale,
			phase: phase > 3 ? 3 : phase,
		});
	}

	return positions;
}

const PHASE_1_START = 230;
const PHASE_2_START = 250;
const PHASE_3_START = 270;
const STAGGER_DELAY = 4;

const PHASE_4_START = 300;

function getEnterDelay(index: number, phase: 1 | 2 | 3 | 4): number {
	const phaseStarts = {
		1: PHASE_1_START,
		2: PHASE_2_START,
		3: PHASE_3_START,
		4: PHASE_4_START,
	};

	let indexInPhase: number;
	if (phase === 1) {
		indexInPhase = index;
	} else if (phase === 2) {
		indexInPhase = index - 3;
	} else if (phase === 3) {
		indexInPhase = index - 6;
	} else {
		indexInPhase = index - 9;
	}

	return phaseStarts[phase] + indexInPhase * STAGGER_DELAY;
}

export function TweetWall({ tweets }: TweetWallProps) {
	const positions = generateCollagePositions(tweets.length, 42);

	const sortedByZIndex = positions
		.map((pos, index) => ({ ...pos, index }))
		.toSorted((a, b) => {
			if (a.phase !== b.phase) return a.phase - b.phase;
			return a.index - b.index;
		});

	return (
		<AbsoluteFill>
			{sortedByZIndex.map(({ x, y, rotation, scale, phase, index }) => {
				const tweet = tweets[index];
				if (!tweet) return null;

				const enterDelay = getEnterDelay(index, phase);

				return (
					<TweetCard
						key={tweet.id}
						tweet={tweet}
						x={x}
						y={y}
						rotation={rotation}
						scale={scale}
						enterDelay={enterDelay}
					/>
				);
			})}
		</AbsoluteFill>
	);
}
