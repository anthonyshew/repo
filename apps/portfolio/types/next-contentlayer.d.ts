declare module "next-contentlayer" {
	// oxlint-disable-next-line typescript/no-explicit-any -- Ignored when migrating
	export function withContentlayer(config: any): any;
}

declare module "next-contentlayer/hooks" {
	// oxlint-disable-next-line typescript/no-explicit-any -- Ignored when migrating
	export function useMDXComponent(code: string): React.ComponentType<any>;
}
