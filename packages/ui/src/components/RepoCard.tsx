import { Box, ExternalLink, Globe } from "lucide-icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { IconBox } from "./IconBox";

const logos = {
	kittr:
		"https://pbs.twimg.com/profile_images/1419807359589699590/rpRA-bIC_400x400.jpg",
	turbo:
		"https://pbs.twimg.com/profile_images/1584620135490338816/tCCcROZD_400x400.png",
	trpc: "https://pbs.twimg.com/profile_images/1562943276142960640/8Fo_MxSb_400x400.jpg",
};

export interface PinnedRepos {
	owner: string;
	repo: keyof typeof logos;
	link: string;
	description: string;
	image: string;
	website: string;
	language: string;
	languageColor: string;
	stars: string;
	forks: string;
}

export function RepoCard(repo: PinnedRepos) {
	return (
		<div className="flex flex-row justify-center w-full lg:w-60">
			<div className="flex flex-col justify-around w-full gap-8 p-6 border rounded shadow-lg lg:justify-between ">
				<div className="flex flex-row justify-center gap-4 lg:justify-between">
					<Avatar className="shadow-xl" key={repo.repo}>
						<AvatarImage src={logos[repo.repo]} />
						<AvatarFallback />
					</Avatar>
					<p className="my-auto text-slate-800 dark:text-slate-200 tracking-wider">
						{repo.owner}/{repo.repo}
					</p>
				</div>
				<div className="flex flex-col justify-around gap-8 lg:flex-col sm:flex-row">
					<div className="flex flex-row justify-around w-full gap-4">
						<a href={repo.link} rel="noreferrer" target="_blank">
							<IconBox className="relative">
								<Box className="inline w-5 h-5 text-white" strokeWidth="1.4" />
								<span className="absolute text-white rounded-full bg-slate-500 -top-3 -right-3">
									<ExternalLink className="inline h-3 my-auto" />
								</span>
							</IconBox>
						</a>

						<div>
							<a href={repo.website} rel="noreferrer" target="_blank">
								<IconBox className="relative">
									<Globe
										className="inline w-5 h-5 text-white"
										strokeWidth="1.4"
									/>
									<span className="absolute text-white rounded-full bg-slate-500 -top-3 -right-3">
										<ExternalLink className="inline h-3 my-auto" />
									</span>
								</IconBox>
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
