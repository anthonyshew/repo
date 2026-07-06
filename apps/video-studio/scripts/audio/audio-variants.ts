import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

export type AudioVariant = {
	name: string;
	description: string;
	filter: string;
};

export const speechCleanupAudioVariants: AudioVariant[] = [
	{
		name: "subtle",
		description: "Light hiss cleanup, small low-mid cut, small presence lift.",
		filter: [
			"highpass=f=80",
			"lowpass=f=14500",
			"equalizer=f=350:t=q:w=1.1:g=-1.8",
			"equalizer=f=3800:t=q:w=1.2:g=1.8",
			"afftdn=nr=6:nf=-35",
			"loudnorm=I=-16:TP=-1.5:LRA=11",
		].join(","),
	},
	{
		name: "presence",
		description: "More forward voice, stronger hollow low-mid cut.",
		filter: [
			"highpass=f=90",
			"lowpass=f=13500",
			"equalizer=f=280:t=q:w=1.0:g=-2.5",
			"equalizer=f=650:t=q:w=1.2:g=-1.5",
			"equalizer=f=4200:t=q:w=1.1:g=3",
			"afftdn=nr=7:nf=-35",
			"loudnorm=I=-16:TP=-1.5:LRA=11",
		].join(","),
	},
	{
		name: "balanced",
		description: "Between presence and denoise: controlled hiss, still fairly open.",
		filter: [
			"highpass=f=88",
			"lowpass=f=12500",
			"equalizer=f=320:t=q:w=1.05:g=-2.2",
			"equalizer=f=620:t=q:w=1.2:g=-1",
			"equalizer=f=3900:t=q:w=1.15:g=2.4",
			"afftdn=nr=8:nf=-36",
			"loudnorm=I=-16:TP=-1.5:LRA=11",
		].join(","),
	},
	{
		name: "quiet",
		description: "More hiss control than balanced without going as dark as denoise.",
		filter: [
			"highpass=f=88",
			"lowpass=f=12000",
			"equalizer=f=330:t=q:w=1.05:g=-2.2",
			"equalizer=f=620:t=q:w=1.2:g=-0.8",
			"equalizer=f=3800:t=q:w=1.15:g=2.1",
			"afftdn=nr=9:nf=-37",
			"loudnorm=I=-16:TP=-1.5:LRA=11",
		].join(","),
	},
	{
		name: "clean",
		description: "Strong hiss reduction; prioritizes clean speech over top-end air.",
		filter: [
			"highpass=f=95",
			"lowpass=f=10000",
			"equalizer=f=330:t=q:w=1.05:g=-2.5",
			"equalizer=f=700:t=q:w=1.2:g=-1",
			"equalizer=f=3400:t=q:w=1.2:g=1.5",
			"afftdn=nr=13:nf=-42",
			"loudnorm=I=-16:TP=-1.5:LRA=11",
		].join(","),
	},
	{
		name: "clean-presence",
		description: "Clean-level hiss reduction with more forward speech presence.",
		filter: [
			"highpass=f=90",
			"lowpass=f=11500",
			"equalizer=f=330:t=q:w=1.05:g=-2.3",
			"equalizer=f=700:t=q:w=1.2:g=-0.7",
			"equalizer=f=3600:t=q:w=1.15:g=2.4",
			"equalizer=f=5200:t=q:w=1.4:g=0.8",
			"afftdn=nr=13:nf=-42",
			"loudnorm=I=-16:TP=-1.5:LRA=11",
		].join(","),
	},
	{
		name: "denoise",
		description: "More hiss reduction, less air on the top end.",
		filter: [
			"highpass=f=85",
			"lowpass=f=11500",
			"equalizer=f=350:t=q:w=1.1:g=-2",
			"equalizer=f=3600:t=q:w=1.2:g=2",
			"afftdn=nr=10:nf=-38",
			"loudnorm=I=-16:TP=-1.5:LRA=11",
		].join(","),
	},
];

export const runAudioVariants = ({
	source,
	outputFolder,
	variants,
	selectedVariant,
	overwrite,
}: {
	source: string;
	outputFolder: string;
	variants: AudioVariant[];
	selectedVariant: string | null;
	overwrite: boolean;
}) => {
	if (!existsSync(source)) {
		throw new Error(`Missing source: ${source}`);
	}

	mkdirSync(outputFolder, { recursive: true });

	const variantsToRun = selectedVariant
		? variants.filter((variant) => variant.name === selectedVariant)
		: variants;

	if (variantsToRun.length === 0) {
		throw new Error(
			`Unknown variant: ${selectedVariant}. Available variants: ${variants
				.map((variant) => variant.name)
				.join(", ")}`,
		);
	}

	for (const variant of variantsToRun) {
		const output = path.join(outputFolder, `${variant.name}.wav`);

		if (existsSync(output) && !overwrite) {
			console.log(`Skipping existing: ${output}`);
			console.log("Pass --overwrite to regenerate it.");
			continue;
		}

		console.log(`Generating ${variant.name}: ${variant.description}`);

		const result = spawnSync(
			"ffmpeg",
			[
				...(overwrite ? ["-y"] : ["-n"]),
				"-i",
				source,
				"-vn",
				"-af",
				variant.filter,
				"-ar",
				"48000",
				"-ac",
				"2",
				output,
			],
			{ stdio: "inherit" },
		);

		if (result.status !== 0) {
			throw new Error(`ffmpeg failed while generating ${variant.name}`);
		}
	}
};
