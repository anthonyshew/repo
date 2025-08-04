import type Link from "next/link";
import type { ElementType } from "react";

type NextLinkType = typeof Link;

interface NavbarProps {
	links: {
		label: string;
		href: string;
	}[];
	linkComponent: NextLinkType;
	themeControllerComponent: ElementType;
}

export function Navbar({
	links,
	linkComponent,
	themeControllerComponent,
}: NavbarProps) {
	const Link = linkComponent;

	const ThemeController = themeControllerComponent;

	return (
		<nav className="ui:flex ui:flex-row ui:justify-center ui:w-full ui:gap-4 ui:py-8 md:ui:mx-10 md:ui:mr-20 md:ui:mt-24 md:ui:flex-col md:ui:w-16 md:ui:justify-start">
			{links.map((link) => {
				return (
					<Link
						className="ui:tracking-wider ui:group"
						href={link.href}
						key={link.label}
					>
						{link.label}
						<span className="ui:block ui:max-w-0 group-hover:ui:max-w-full ui:transition-all ui:duration-300 ui:h-px ui:bg-slate-800 dark:ui:bg-white" />
					</Link>
				);
			})}
			<div className="ui:hidden md:ui:inline">
				<ThemeController />
			</div>
		</nav>
	);
}
