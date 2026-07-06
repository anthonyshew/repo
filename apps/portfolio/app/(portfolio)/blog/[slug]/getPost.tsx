import { blogs as allBlogs } from "#/.source/server";

export const getPost = (slug?: string) => {
	const post = allBlogs.find((blogPost) => {
		return blogPost.info.path.replace(".mdx", "") === slug;
	});

	return post;
};

export const getSlug = (blogPost: (typeof allBlogs)[number]) => {
	return blogPost.info.path.replace(".mdx", "");
};
