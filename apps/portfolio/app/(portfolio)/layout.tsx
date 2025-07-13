import { Navbar } from "@repo/ui/Navbar";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import Link from "next/link";
import { inter } from "#/app/fonts";
import { buildMeta } from "#/app/metadata";
import "#/app/globals.css";
import { ThemeWrapper } from "#/app/providers";
import { ThemeController } from "#/components/ThemeController";

export const generateMetadata = (): Metadata => {
	return buildMeta({
		title: "Anthony Shew",
	});
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			className={`min-h-screen ${inter.className} antialiased`}
			lang="en"
			suppressHydrationWarning
		>
			<body>
				<ThemeWrapper>
					<main className="relative flex flex-col flex-auto max-w-5xl min-h-screen px-6 pb-4 mx-auto sm:py-8 lg:py-20">
						<div className="absolute right-4 top-8 md:hidden">
							<ThemeController />
						</div>
						<Navbar
							linkComponent={Link}
							links={[
								{ label: "Home", href: "/" },
								{ label: "Blog", href: "/blog" },
								{ label: "Talks", href: "/talks" },
							]}
							themeControllerComponent={ThemeController}
						/>
						{children}
					</main>
				</ThemeWrapper>
				<Analytics />
			</body>
		</html>
	);
}
