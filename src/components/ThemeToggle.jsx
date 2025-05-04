import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle animation when theme changes
  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleDarkMode();
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative flex items-center justify-center w-8 h-8 rounded-full border border-transparent hover:border-white transition-all duration-300 overflow-hidden ${
        darkMode
          ? "bg-gray-800 hover:bg-gray-700"
          : "bg-yellow-400 hover:bg-yellow-300"
      } ${isAnimating ? "animate-pulse" : ""}`}
      title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle dark mode"
    >
      {/* Sun/Moon icon with animation */}
      <span
        className={`material-icons transition-all duration-300 transform ${
          isAnimating ? "scale-125" : ""
        } ${darkMode ? "text-white" : "text-yellow-800"}`}
        style={{ fontSize: "1.25rem" }}
      >
        {darkMode ? "dark_mode" : "light_mode"}
      </span>

      {/* Visual indicator for current mode */}
      <span className="sr-only">{darkMode ? "Dark Mode" : "Light Mode"}</span>

      {/* Animated background effect */}
      {isAnimating && (
        <span
          className={`absolute inset-0 rounded-full ${
            darkMode ? "bg-yellow-400" : "bg-gray-800"
          } animate-ping opacity-30`}
        ></span>
      )}
    </button>
  );
}
