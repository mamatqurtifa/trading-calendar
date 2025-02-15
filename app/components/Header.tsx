"use client";

import { useTheme } from "./ThemeProvider";

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-2">
        <i className="fas fa-chart-line text-2xl text-primary"></i>
        <h1 className="text-2xl font-bold">Trading Calendar</h1>
      </div>
      <button
        onClick={toggleTheme}
        className="btn flex items-center gap-2"
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <i className="fas fa-moon"></i>
        ) : (
          <i className="fas fa-sun"></i>
        )}
        {theme === "light" ? "Dark Mode" : "Light Mode"}
      </button>
    </header>
  );
}
