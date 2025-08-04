"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type Themes = "dark" | "light" | "system";

const themeIcons: Record<Themes, React.ReactElement> = {
	dark: <Moon />,
	light: <Sun />,
	system: <Laptop />,
};

export function ThemeController({ position }: { position?: "absolute" }) {
	const [mounted, setMounted] = useState(false);
	const { theme, setTheme } = useTheme() as {
		theme: Themes;
		setTheme: (theme: Themes) => void;
	};
	useEffect(() => setMounted(true), []);

	const switcher = () => {
		if (theme === "system") {
			setTheme("light");
		}

		if (theme === "light") {
			setTheme("dark");
		}

		if (theme === "dark") {
			setTheme("system");
		}
	};

	if (mounted) {
		return (
			<button
				className={
					position === "absolute" ? "absolute top-2 right-2" : undefined
				}
				onClick={() => switcher()}
				type="button"
			>
				{themeIcons[theme]}
			</button>
		);
	}

	return null;
}
