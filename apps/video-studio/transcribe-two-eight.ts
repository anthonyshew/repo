import { existsSync } from "node:fs";
import path from "path";
import { captionFile } from "./scripts/captions/caption-file";
import { ensureWhisper } from "./scripts/captions/install-whisper";

const publicFolder = path.join(process.cwd(), "public");
const twoEightFolder = path.join(publicFolder, "2-8");

await ensureWhisper({
	onInstall: () => console.log("Installing Whisper..."),
	onModelProgressInPercent: (p) => console.log(`Downloading model: ${p}%`),
	signal: new AbortController().signal,
});

const camFile = "cam-2.mov";
const fileToTranscribe = path.join(twoEightFolder, camFile);
const outPath = path.join(twoEightFolder, "captions.json");

if (existsSync(outPath)) {
	console.log("Already transcribed:", outPath);
} else {
	console.log("Transcribing:", fileToTranscribe);
	await captionFile({
		file: camFile,
		outPath,
		fileToTranscribe,
		onProgress(progress) {
			console.log(`${progress.progressInPercent}%`);
		},
		signal: new AbortController().signal,
	});
	console.log("Transcribed to:", outPath);
}
