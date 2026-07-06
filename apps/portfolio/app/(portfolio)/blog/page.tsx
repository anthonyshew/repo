import { compareDesc, format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { blogs as allBlogs } from "#/.source/server";
import { buildMeta } from "#/app/metadata";

type Blog = (typeof allBlogs)[number];

export function generateMetadata(): Metadata {
	return buildMeta({
		title: "Blog",
		description: "Education, ideas, and semi-random musings.",
	});
}

function PostCard(post: Blog) {
	return (
		<Link href={`/blog/${post.info.path.replace(".mdx", "")}`}>
			<div className="p-4 mb-4 transition-all rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 md:p-6">
				<h2 className="text-xl font-bold">{post.title}</h2>
				<time
					className="block mb-2 text-xs text-neutral-600 dark:text-neutral-500"
					dateTime={post.date}
				>
					{format(new Date(post.date), "LLLL d, yyyy")}
				</time>
				<p className="mb-0">{post.summary}</p>
			</div>
		</Link>
	);
}

export default function Home() {
	const posts: Blog[] = allBlogs.toSorted((a, b) => {
		return compareDesc(new Date(a.date), new Date(b.date));
	});

	return (
		<div className="py-8">
			<h1 className="mb-8 text-3xl font-bold text-center">Blog</h1>
			{posts.map((post) => (
				<PostCard key={post.info.path} {...post} />
			))}
		</div>
	);
}
