import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { z } from "zod";

export const { docs: blogs } = defineDocs({
	dir: "content/blog",
	docs: {
		schema: z.object({
			title: z.string(),
			date: z.string(),
			summary: z.string(),
		}),
	},
});

export default defineConfig({
	mdxOptions: {
		rehypePlugins: [],
		remarkPlugins: [],
	},
});
