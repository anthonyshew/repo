import { LinkHeading } from "@repo/ui/LinkHeading";
import type { ImageProps } from "next/image";
import NextImage from "next/image";
import type { ReactNode } from "react";

interface CustomImageProps extends ImageProps {
	containerClassName: string;
	srcDark?: string;
	srcLight?: string;
}

export const mdxComponents = {
	Img: (props: CustomImageProps) => {
		const { containerClassName, srcDark, srcLight, src: _src, ...rest } = props;

		return (
			<div className={`relative block ${containerClassName}`}>
				<NextImage
					className="hidden object-contain w-full h-auto rounded-md dark:block"
					height={1}
					sizes="100vw"
					src={srcDark ?? _src}
					width={1}
					{...rest}
				/>
				<NextImage
					className="block object-contain w-full h-auto rounded-md dark:hidden"
					height={1}
					sizes="100vw"
					src={srcLight ?? _src}
					width={1}
					{...rest}
				/>
			</div>
		);
	},
	h1: ({ children }: { children: ReactNode }) => {
		return <h1 className="text-pretty">{children}</h1>;
	},
	h2: ({ children }: { children: ReactNode }) => {
		return <LinkHeading component="h2">{children}</LinkHeading>;
	},
	h3: ({ children }: { children: ReactNode }) => {
		return <LinkHeading component="h3">{children}</LinkHeading>;
	},
	h4: ({ children }: { children: ReactNode }) => {
		return <LinkHeading component="h4">{children}</LinkHeading>;
	},
	h5: ({ children }: { children: ReactNode }) => {
		return <LinkHeading component="h5">{children}</LinkHeading>;
	},
	h6: ({ children }: { children: ReactNode }) => {
		return <LinkHeading component="h6">{children}</LinkHeading>;
	},
};
