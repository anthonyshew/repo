import { Discord } from "@repo/ui/Discord";
import { GitHub, YouTube } from "@repo/ui/Icons";
import { Xitter } from "@repo/ui/Xitter";
import type { Metadata } from "next";
import { tagline } from "#/app/constants";
import { buildMeta } from "#/app/metadata";
import { LucideMail } from "lucide-react";

export const generateMetadata = (): Metadata => {
	return buildMeta({
		title: "Anthony Shew",
		description: tagline,
	});
};

export default function Home() {
	return (
		<div>
			<div className="max-w-2xl mx-auto mt-8 prose dark:prose-invert">
				<p>Hey, I&apos;m Anthony.</p>

				<p>
					I played pro baseball for six years. Now, I ship software. Today, I
					lead{" "}
					<a
						href="https://turborepo.com"
						rel="noopener noreferrer"
						target="_blank"
					>
						Turborepo
					</a>{" "}
					at{" "}
					<a
						href="https://vercel.com/home"
						rel="noopener noreferrer"
						target="_blank"
					>
						Vercel
					</a>
					.
				</p>
				<p>Some of my favorite things...</p>
				<ul>
					<li>People: My wife and sons</li>
					<li>Sport: Hockey</li>
					<li>Word: Volition</li>
					<li>Book: Relentless by Tim S. Grover</li>
					<li>Music: August Burns Red, Dance Gavin Dance, Protest the Hero</li>
				</ul>

				<div className="flex flex-col items-center justify-center sm:flex-row sm:gap-8">
					<a
						className="flex flex-row gap-2 my-4 hover:underline"
						href="https://twitter.com/anthonysheww"
						rel="noopener noreferrer"
						target="_blank"
					>
						<Xitter className="relative top-0.5 w-6 h-6" />
					</a>
					<a
						className="flex flex-row gap-2 my-4 hover:underline"
						href="https://www.youtube.com/channel/UCwfYq8O-1QtU1TlWsJVGRBg"
						rel="noopener noreferrer"
						target="_blank"
					>
						<YouTube className="relative top-0.5 w-6 h-6" />
					</a>
					<a
						className="flex flex-row gap-2 my-4 hover:underline"
						href="https://discord.gg/JMHERJGRkH"
						rel="noopener noreferrer"
						target="_blank"
					>
						<Discord className="relative top-0.5 w-6 h-6" />
					</a>
					<a
						className="flex flex-row gap-2 my-4 hover:underline"
						href="https://github.com/anthonyshew"
						rel="noopener noreferrer"
						target="_blank"
					>
						<GitHub className="relative top-0.5 w-6 h-6" />
					</a>
				</div>

				<div className="flex justify-center">
					<a
						className="flex flex-row gap-2 my-4 hover:underline"
						href="mailto:anthony@shew.dev?subject=Consulting"
					>
						<LucideMail className="relative top-0.5 w-6 h-6" /> Consulting
					</a>
				</div>
			</div>
		</div>
	);
}
