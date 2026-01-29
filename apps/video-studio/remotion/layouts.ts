import { VIDEO_HEIGHT, VIDEO_WIDTH } from "./constants";

export type Layout =
	| "full-cam"
	| "full-monitor"
	| "half-cam-left"
	| "half-cam-right"
	| "cam-left-5/12"
	| "cam-right-5/12"
	| "cam-top-right"
	| "cam-bottom-right"
	| "zoom-in";

type Rect = {
	x: number;
	y: number;
	width: number;
	height: number;
};

type LayoutConfig = {
	cam: Rect | null;
	monitor: Rect | null;
};

const OVERLAY_SIZE = Math.round(VIDEO_HEIGHT / 4);
const PADDING = 40;

export function getLayoutConfig(layout: Layout): LayoutConfig {
	switch (layout) {
		case "full-cam":
			return {
				cam: { x: 0, y: 0, width: VIDEO_WIDTH, height: VIDEO_HEIGHT },
				monitor: null,
			};

		case "full-monitor":
			return {
				cam: null,
				monitor: { x: 0, y: 0, width: VIDEO_WIDTH, height: VIDEO_HEIGHT },
			};

		case "half-cam-left":
			return {
				cam: { x: 0, y: 0, width: VIDEO_WIDTH / 2, height: VIDEO_HEIGHT },
				monitor: {
					x: VIDEO_WIDTH / 2,
					y: 0,
					width: VIDEO_WIDTH / 2,
					height: VIDEO_HEIGHT,
				},
			};

		case "half-cam-right":
			return {
				cam: {
					x: VIDEO_WIDTH / 2,
					y: 0,
					width: VIDEO_WIDTH / 2,
					height: VIDEO_HEIGHT,
				},
				monitor: { x: 0, y: 0, width: VIDEO_WIDTH / 2, height: VIDEO_HEIGHT },
			};

		case "cam-left-5/12": {
			const camWidth = Math.round((VIDEO_WIDTH * 5) / 12);
			return {
				cam: { x: 0, y: 0, width: camWidth, height: VIDEO_HEIGHT },
				monitor: {
					x: camWidth,
					y: 0,
					width: VIDEO_WIDTH - camWidth,
					height: VIDEO_HEIGHT,
				},
			};
		}

		case "cam-right-5/12": {
			const camWidth = Math.round((VIDEO_WIDTH * 5) / 12);
			return {
				cam: {
					x: VIDEO_WIDTH - camWidth,
					y: 0,
					width: camWidth,
					height: VIDEO_HEIGHT,
				},
				monitor: {
					x: 0,
					y: 0,
					width: VIDEO_WIDTH - camWidth,
					height: VIDEO_HEIGHT,
				},
			};
		}

		case "cam-top-right":
			return {
				cam: {
					x: VIDEO_WIDTH - OVERLAY_SIZE - PADDING,
					y: PADDING,
					width: OVERLAY_SIZE,
					height: OVERLAY_SIZE,
				},
				monitor: { x: 0, y: 0, width: VIDEO_WIDTH, height: VIDEO_HEIGHT },
			};

		case "cam-bottom-right":
			return {
				cam: {
					x: VIDEO_WIDTH - OVERLAY_SIZE - PADDING,
					y: VIDEO_HEIGHT - OVERLAY_SIZE - PADDING,
					width: OVERLAY_SIZE,
					height: OVERLAY_SIZE,
				},
				monitor: { x: 0, y: 0, width: VIDEO_WIDTH, height: VIDEO_HEIGHT },
			};

		case "zoom-in":
			return {
				cam: null,
				monitor: { x: 0, y: 0, width: VIDEO_WIDTH, height: VIDEO_HEIGHT },
			};
	}
}
