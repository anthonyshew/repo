import type { ReactNode } from "react";

const replaceNonAlphanumericsWithDash = (str?: string | null) => {
	if (!str || typeof str !== "string") return "";
	return str.toLowerCase().replace(/[^a-z0-9]/gi, "-");
};
interface LinkHeadingProps {
	component: React.ElementType;
	children: ReactNode;
}

export function LinkHeading({
	component,
	children,
	...props
}: LinkHeadingProps) {
	const Comp = component;

	// The MDX can come back with an object for certain strings. (e.g. "`apps`")
	// This ensures we handle those correctly.
	const getChildren = (nodeChildren: ReactNode): ReactNode => {
		// @ts-expect-error Don't care at the moment!
		if (nodeChildren.props) {
			// @ts-expect-error Don't care at the moment!
			return nodeChildren.props.children;
		}
		return nodeChildren;
	};

	const handledChildren = getChildren(children);
	const childrenString =
		typeof handledChildren === "string"
			? handledChildren
			: typeof handledChildren === "object" && handledChildren !== null
				? String(handledChildren)
				: "";

	return (
		<Comp
			className="mt-0!"
			id={replaceNonAlphanumericsWithDash(childrenString)}
		>
			<span className="block pt-8" />
			<a
				className="font-bold no-underline hover:underline"
				href={`#${replaceNonAlphanumericsWithDash(childrenString)}`}
				{...props}
			>
				{children}
			</a>
		</Comp>
	);
}
