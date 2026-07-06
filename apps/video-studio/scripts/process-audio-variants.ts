import path from "node:path";
import {
	runAudioVariants,
	speechCleanupAudioVariants,
} from "./audio/audio-variants";

const args = process.argv.slice(2);
const sourceArg = args.find((arg) => arg.startsWith("--source="));
const outputArg = args.find((arg) => arg.startsWith("--output="));
const selectedVariantArg = args.find((arg) => arg.startsWith("--variant="));
const overwrite = args.includes("--overwrite");

if (!sourceArg) {
	console.error(
		"Usage: bun scripts/process-audio-variants.ts --source=<media> [--output=<folder>] [--variant=<name>] [--overwrite]",
	);
	process.exit(1);
}

const source = path.resolve(process.cwd(), sourceArg.replace("--source=", ""));
const outputFolder = outputArg
	? path.resolve(process.cwd(), outputArg.replace("--output=", ""))
	: path.join(path.dirname(source), "audio-variants");
const selectedVariant = selectedVariantArg?.replace("--variant=", "") ?? null;

try {
	runAudioVariants({
		source,
		outputFolder,
		variants: speechCleanupAudioVariants,
		selectedVariant,
		overwrite,
	});
} catch (err) {
	console.error(err instanceof Error ? err.message : err);
	process.exit(1);
}

console.log(`Wrote variants to: ${outputFolder}`);
