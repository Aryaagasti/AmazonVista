import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      className="ml-4 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700"
      onClick={() => setDark(d => !d)}
    >
      {dark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}