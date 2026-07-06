import path from "node:path";
import {
	runAudioVariants,
	speechCleanupAudioVariants,
} from "./audio/audio-variants";

const publicFolder = path.join(process.cwd(), "public");
const folder = path.join(publicFolder, "2-10");
const defaultSource = path.join(folder, "screen-synced.mov");
const outputFolder = path.join(folder, "audio-variants");

const args = process.argv.slice(2);
const sourceArg = args.find((arg) => arg.startsWith("--source="));
const selectedVariantArg = args.find((arg) => arg.startsWith("--variant="));
const overwrite = args.includes("--overwrite");
const source = sourceArg
	? path.resolve(process.cwd(), sourceArg.replace("--source=", ""))
	: defaultSource;
const selectedVariant = selectedVariantArg?.replace("--variant=", "");

try {
	runAudioVariants({
		source,
		outputFolder,
		variants: speechCleanupAudioVariants,
		selectedVariant: selectedVariant ?? null,
		overwrite,
	});
} catch (err) {
	console.error(err instanceof Error ? err.message : err);
	console.error("Pass --source=public/2-10/<file> if you want a different input.");
	process.exit(1);
}

console.log(`Wrote variants to: ${outputFolder}`);
