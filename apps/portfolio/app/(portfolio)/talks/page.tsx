import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { buildMeta } from "#/app/metadata";

const talks: { confName: string; title: string; link: string }[] = [
	{
		confName: "React Miami 2023",
		link: "https://www.youtube.com/watch?v=S_CHo6A0bAs",
		title: "On-demand Flow State: A Framework for Mental Performance",
	},
];

export function generateMetadata(): Metadata {
	return buildMeta({
		title: "Talks",
		description: "Conference and other talks that I've done.",
	});
}

export default function Home() {
	return (
		<div className="w-full py-8">
			<h1 className="mb-8 text-3xl font-bold text-center">Talks</h1>
			<p>
				Sometimes, I am lucky enough to do talks at conferences. You can find
				recordings here.
			</p>
			<div className="flex flex-col gap-4 mt-8">
				{talks.map((conference) => (
					<a
						className="flex flex-row justify-between p-4 text-white transition-all rounded-lg bg-neutral-800 dark:hover:bg-neutral-900"
						href={conference.link}
						key={conference.confName}
						rel="nooopener noreferrer"
						target="_blank"
					>
						<span className="flex flex-col gap-4">
							<span className="font-bold">{conference.title}</span>
							<span>{conference.confName}</span>
						</span>
						<span className="flex flex-col items-center justify-center">
							<ArrowRight />
						</span>
					</a>
				))}
			</div>
		</div>
	);
}
