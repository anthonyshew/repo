import { spawn } from "node:child_process";

type SilenceInterval = {
	startSec: number;
	endSec: number;
	durationSec: number;
};

/**
 * Uses ffmpeg's silencedetect filter to find silent intervals in an audio/video file.
 * Returns an array of silence intervals with start, end, and duration in seconds.
 */
export async function detectSilence(
	filePath: string,
	options?: {
		/** Minimum silence duration in seconds to detect (default: 0.5) */
		minDuration?: number;
		/** Silence threshold in dB (default: -30) */
		thresholdDb?: number;
	},
): Promise<SilenceInterval[]> {
	const minDuration = options?.minDuration ?? 0.5;
	const thresholdDb = options?.thresholdDb ?? -30;

	const args = [
		"remotion",
		"ffmpeg",
		"-hide_banner",
		"-i",
		filePath,
		"-vn",
		"-af",
		`silencedetect=noise=${thresholdDb}dB:d=${minDuration}`,
		"-f",
		"null",
		"-",
	];

	const stderr = await new Promise<string>((resolve, reject) => {
		const child = spawn("bunx", args, { stdio: ["ignore", "ignore", "pipe"] });
		const chunks: Buffer[] = [];

		child.stderr.on("data", (d) => chunks.push(d));
		child.on("error", reject);
		child.on("close", (code) => {
			if (code !== 0) {
				reject(
					new Error(
						`ffmpeg silencedetect exited with code ${code}: ${Buffer.concat(chunks).toString()}`,
					),
				);
				return;
			}
			resolve(Buffer.concat(chunks).toString());
		});
	});

	const silences: SilenceInterval[] = [];
	const lines = stderr.split("\n");

	let pendingStart: number | null = null;

	for (const line of lines) {
		const startMatch = line.match(/silence_start:\s*([\d.]+)/);
		if (startMatch) {
			pendingStart = Number.parseFloat(startMatch[1]!);
			continue;
		}

		const endMatch = line.match(
			/silence_end:\s*([\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)/,
		);
		if (endMatch && pendingStart !== null) {
			silences.push({
				startSec: pendingStart,
				endSec: Number.parseFloat(endMatch[1]!),
				durationSec: Number.parseFloat(endMatch[2]!),
			});
			pendingStart = null;
		}
	}

	return silences;
}
