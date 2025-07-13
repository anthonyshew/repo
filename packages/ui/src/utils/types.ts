/** This type is taken from the Next.js Link type so we can use it in our UI lib. */
export type NextLinkType = React.ForwardRefExoticComponent<
	// biome-ignore lint/suspicious/noExplicitAny: Ignored when migrating
	Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, any> &
		React.RefAttributes<HTMLAnchorElement> & {
			children?: React.ReactNode;
		} & {
			// biome-ignore lint/suspicious/noExplicitAny: Ignored when migrating
			href: any;
			className?: string;
			prefetch?: boolean | null;
		}
>;
