import { compareDesc } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Balancer from "react-wrap-balancer";
import { blogs as allBlogs } from "#/.source";
import { metadataBaseURI } from "#/app/metadata";
import { mdxComponents } from "#/components/mdxComponents";
import { getPost, getSlug } from "./getPost";

export const dynamic = "force-dynamic";

export const generateStaticParams = () =>
	allBlogs.map((post) => ({ slug: getSlug(post) }));

export async function generateMetadata({
	params,
}: {
	params: { slug: string };
}): Promise<Metadata | undefined> {
	const post = getPost((await params).slug);
	if (!post) {
		return;
	}

	const { title, date: publishedTime, summary } = post;

	const ogUrl = new URL("/api/og", metadataBaseURI);
	ogUrl.searchParams.set("title", title);
	ogUrl.searchParams.set("subtitle", summary);

	return {
		title,
		description: summary,
		openGraph: {
			title,
			description: summary,
			type: "article",
			publishedTime,
			url: `https://shew.dev/blog/${getSlug(post)}`,
			images: [
				{
					url: ogUrl,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description: summary,
			images: [ogUrl],
		},
	};
}

async function PostLayout(props: { params: Promise<{ slug: string }> }) {
	const params = await props.params;
	const getAdjacentPosts = () => {
		const foundIndex = allBlogs
			.sort((a, b) => {
				return compareDesc(new Date(a.date), new Date(b.date));
			})
			.findIndex((post) => getSlug(post) === params.slug);

		if (foundIndex < 0) return notFound();

		return {
			prevPost: allBlogs[foundIndex - 1],
			nextPost: allBlogs[foundIndex + 1],
		};
	};

	const prevPost = getAdjacentPosts().prevPost;
	const nextPost = getAdjacentPosts().nextPost;

	const post = getPost(params.slug);

	if (!post) return notFound();

	const Mdx = post.body;

	return (
		<div className="flex flex-col w-full mx-auto prose md:pr-8 lg:prose-lg dark:prose-invert">
			<header className="w-full pb-4">
				<div className="text-center">
					<h1 className="mb-4">
						<Balancer>{post.title}</Balancer>
					</h1>
					<div className="flex flex-row gap-4 align-center">
						<time
							className="text-xs text-gray-600 dark:text-gray-400"
							dateTime={post.date}
						>
							{post.date}
						</time>
						<hr className="grow border my-auto! text-slate-900" />
					</div>
				</div>
			</header>

			<article>
				<Mdx components={mdxComponents} />
			</article>

			<footer className="pt-4 mt-4 border-t-2 border-t-slate-600">
				<p className="text-xl font-medium">More Reading</p>

				<div className="flex flex-col justify-center gap-4 sm:flex-row sm:justify-between">
					{prevPost ? (
						<Link
							className="mx-auto font-medium md:text-lg"
							href={`/blog/${getSlug(prevPost)}`}
						>
							<span className="mr-4">👈</span>
							{prevPost.title}
						</Link>
					) : null}
					{nextPost ? (
						<Link
							className="mx-auto font-medium md:text-lg"
							href={`/blog/${getSlug(nextPost)}`}
						>
							{nextPost.title}
							<span className="ml-4">👉</span>
						</Link>
					) : null}
				</div>
			</footer>
		</div>
	);
}

export default PostLayout;
