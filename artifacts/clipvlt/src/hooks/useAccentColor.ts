import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "clipvlt.accentColor";

export const ACCENT_PRESETS = [
  { label: "Red",    value: "#D23535" },
  { label: "Rose",   value: "#E11D48" },
  { label: "Blue",   value: "#3B82F6" },
  { label: "Violet", value: "#7C3AED" },
  { label: "Green",  value: "#10B981" },
  { label: "Orange", value: "#F97316" },
] as const;

/** Convert a hex color (#RRGGBB) to an HSL string ("H S% L%") for CSS variables. */
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** Apply an accent color to the document CSS variables immediately. */
export function applyAccentColor(hex: string) {
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return;
  const hsl = hexToHsl(hex);
  document.documentElement.style.setProperty("--primary", hsl);
  document.documentElement.style.setProperty("--ring", hsl);
  // Accent can be slightly brighter — use the same HSL for simplicity
  document.documentElement.style.setProperty("--accent", hsl);
}

/**
 * Manages user accent color preference:
 * - Reads from localStorage on mount
 * - Applies CSS variable overrides
 * - Exposes setAccentColor to persist + apply new color
 */
export function useAccentColor() {
  const [color, setColor] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? "";
    } catch {
      return "";
    }
  });

  // Apply saved preference on mount (or no-op if empty → use CSS defaults)
  useEffect(() => {
    if (color) applyAccentColor(color);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setAccentColor = useCallback((hex: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, hex);
    } catch {}
    setColor(hex);
    applyAccentColor(hex);
  }, []);

  const resetAccentColor = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setColor("");
    // Remove inline overrides → CSS file defaults take over
    document.documentElement.style.removeProperty("--primary");
    document.documentElement.style.removeProperty("--ring");
    document.documentElement.style.removeProperty("--accent");
  }, []);

  return { color, setAccentColor, resetAccentColor, presets: ACCENT_PRESETS };
}
