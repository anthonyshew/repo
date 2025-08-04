"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
var google_1 = require("next/font/google");
require("./globals.css");
require("@repo/ui/styles.css");
var sidebar_1 = require("@repo/ui/sidebar");
var link_1 = require("next/link");
var geistSans = (0, google_1.Geist)({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});
var geistMono = (0, google_1.Geist_Mono)({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});
exports.metadata = {
    title: "Team Shew",
    description: "We are the best.",
    appleWebApp: {
        title: "Team Shew",
        capable: true,
        statusBarStyle: "black-translucent",
    },
    icons: [
        { url: "/favicon.ico", rel: "shortcut icon" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { sizes: "48x48", url: "/icons/48.png", type: "image/png" },
        { sizes: "57x57", url: "/icons/57.png", rel: "apple-touch-icon" },
        { sizes: "60x60", url: "/icons/60.png", rel: "apple-touch-icon" },
        { sizes: "72x72", url: "/icons/72.png", rel: "apple-touch-icon" },
        { sizes: "76x76", url: "/icons/76.png", rel: "apple-touch-icon" },
        { sizes: "96x96", url: "/icons/96.png", rel: "apple-touch-icon" },
        { sizes: "114x114", url: "/icons/114.png", rel: "apple-touch-icon" },
        { sizes: "120x120", url: "/icons/120.png", rel: "apple-touch-icon" },
        { sizes: "152x152", url: "/icons/152.png", rel: "apple-touch-icon" },
        { sizes: "167x167", url: "/icons/167.png", rel: "apple-touch-icon" },
        { sizes: "180x180", url: "/icons/180.png", rel: "apple-touch-icon" },
        { sizes: "192x192", url: "/icons/192.png", rel: "apple-touch-icon" },
        { sizes: "512x512", url: "/icons/512.png", rel: "apple-touch-icon" },
    ],
};
function RootLayout(_a) {
    var children = _a.children;
    return (<html lang="en">
			<body className={"".concat(geistSans.variable, " ").concat(geistMono.variable, " antialiased")}>
				<sidebar_1.SidebarProvider>
					<sidebar_1.Sidebar>
						<sidebar_1.SidebarContent>
							<div className="p-4">
								<h2 className="text-lg font-semibold">Team Shew</h2>
							</div>
							<sidebar_1.SidebarMenu>
								<sidebar_1.SidebarMenuItem>
									<sidebar_1.SidebarMenuButton asChild>
										<link_1.default href="/">Home</link_1.default>
									</sidebar_1.SidebarMenuButton>
									<sidebar_1.SidebarMenuButton asChild>
										<link_1.default href="/meals">Meals</link_1.default>
									</sidebar_1.SidebarMenuButton>
								</sidebar_1.SidebarMenuItem>
							</sidebar_1.SidebarMenu>
						</sidebar_1.SidebarContent>
					</sidebar_1.Sidebar>
					<sidebar_1.SidebarInset>
						<header className="flex h-16 shrink-0 items-center gap-2 px-4">
							<sidebar_1.SidebarTrigger />
						</header>
						<div className="flex-1 overflow-auto">{children}</div>
					</sidebar_1.SidebarInset>
				</sidebar_1.SidebarProvider>
			</body>
		</html>);
}
