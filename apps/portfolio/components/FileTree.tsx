import type { ReactElement, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface FolderProps {
	name: string;
	label?: ReactElement;
	open?: boolean;
	children: ReactNode;
}

interface FileProps {
	name: string;
	label?: ReactElement;
	active?: boolean;
}

function Tree({ children }: { children: ReactNode }): ReactElement {
	return (
		<div
			className={twMerge(
				"nextra-filetree mt-6 select-none text-sm text-gray-800 dark:text-gray-300",
			)}
		>
			<div className="inline-block px-4 py-2 border rounded-lg dark:border-neutral-800">
				{children}
			</div>
		</div>
	);
}

function Folder({ label, name, children, open }: FolderProps) {
	return (
		<li className="flex flex-col list-none">
			<span className="inline-flex items-center cursor-default" title={name}>
				{/** biome-ignore lint/a11y/noSvgWithoutTitle: Ignored when migrating */}
				<svg height="1em" viewBox="0 0 24 24" width="1em">
					<path
						d={
							open
								? "M5 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2 2h4a2 2 0 0 1 2 2v1M5 19h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2Z"
								: "M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2Z"
						}
						fill="none"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
					/>
				</svg>
				<span className="ml-1">{label ?? name}</span>
			</span>
			{open ? <ul className="my-0!">{children}</ul> : null}
		</li>
	);
}
Folder.displayName = "Folder";

function File({ label, name, active }: FileProps) {
	return (
		<li
			className={twMerge(
				"flex list-none",
				active && "text-primary-600 contrast-more:underline",
			)}
		>
			<span className="inline-flex items-center cursor-default">
				{/** biome-ignore lint/a11y/noSvgWithoutTitle: Ignored when migrating */}
				<svg height="1em" viewBox="0 0 24 24" width="1em">
					<path
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z"
						fill="none"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
					/>
				</svg>
				<span className="ml-1">{label ?? name}</span>
			</span>
		</li>
	);
}
File.displayName = "File";

export const FileTree = Object.assign(Tree, { Folder, File });
