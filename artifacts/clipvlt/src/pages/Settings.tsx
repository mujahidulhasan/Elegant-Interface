import { useState, useEffect } from "react";
import { Settings2, Palette, Accessibility, Bell } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAccentColor, ACCENT_PRESETS } from "@/hooks/useAccentColor";
import { cn } from "@/lib/utils";

// ─── localStorage helpers ─────────────────────────────────

const PREF_TOAST   = "clipvlt.toastEnabled";
const PREF_MOTION  = "clipvlt.reduceMotion";
const PREF_DLMODE  = "clipvlt.rememberMode";

function getPref(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v === "true";
  } catch {
    return fallback;
  }
}

function setPref(key: string, value: boolean) {
  try {
    localStorage.setItem(key, String(value));
  } catch {}
}

// ─── Sub-components ───────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-[18px] p-6 card-shadow space-y-5">
      <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</h2>
      {children}
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        value ? "bg-primary" : "bg-secondary"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          value ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

// ─── Main Settings page ───────────────────────────────────

export function SettingsPage() {
  const { resolved, mode, setMode } = useTheme();
  const { color: accentColor, setAccentColor, resetAccentColor } = useAccentColor();

  const [toastEnabled,  setToastEnabled]  = useState(() => getPref(PREF_TOAST,  true));
  const [reduceMotion,  setReduceMotion]  = useState(() => getPref(PREF_MOTION, false));
  const [rememberMode,  setRememberMode]  = useState(() => getPref(PREF_DLMODE, false));

  // Apply reduce-motion class to document root
  useEffect(() => {
    if (reduceMotion) {
      document.documentElement.setAttribute("data-reduce-motion", "true");
    } else {
      document.documentElement.removeAttribute("data-reduce-motion");
    }
    setPref(PREF_MOTION, reduceMotion);
  }, [reduceMotion]);

  // Persist other prefs
  useEffect(() => { setPref(PREF_TOAST,  toastEnabled); }, [toastEnabled]);
  useEffect(() => { setPref(PREF_DLMODE, rememberMode); }, [rememberMode]);

  const themes = [
    { value: "light",  label: "Light"  },
    { value: "dark",   label: "Dark"   },
    { value: "system", label: "System" },
  ] as const;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-primary/10 text-primary flex items-center justify-center">
            <Settings2 className="w-5 h-5" />
          </div>
          Settings
        </h1>
        <p className="text-muted-foreground text-sm pl-[52px]">
          Preferences are saved in your browser.
        </p>
      </div>

      {/* ── Appearance ───────────────────────────────────── */}
      <SectionCard title="Appearance">
        {/* Theme selector */}
        <SettingRow label="Theme" description="Choose between light, dark, or your system default.">
          <div className="flex gap-1 rounded-[12px] bg-secondary p-1">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setMode(t.value)}
                className={cn(
                  "px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-all",
                  mode === t.value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </SettingRow>

        {/* Accent color */}
        <SettingRow
          label="Accent Color"
          description="Choose a primary color for buttons and highlights."
        >
          <div className="flex items-center gap-1.5">
            {ACCENT_PRESETS.map((preset) => {
              const isActive = accentColor === preset.value;
              return (
                <button
                  key={preset.value}
                  title={preset.label}
                  onClick={() => setAccentColor(preset.value)}
                  className={cn(
                    "w-7 h-7 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive ? "ring-2 ring-offset-2 ring-offset-card scale-110" : "hover:scale-105"
                  )}
                  style={{
                    backgroundColor: preset.value,
                    ringColor: preset.value,
                  }}
                />
              );
            })}
            {accentColor && (
              <button
                onClick={resetAccentColor}
                className="ml-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
                title="Reset to default"
              >
                Reset
              </button>
            )}
          </div>
        </SettingRow>
      </SectionCard>

      {/* ── Notifications ────────────────────────────────── */}
      <SectionCard title="Notifications">
        <SettingRow
          label="Toast Notifications"
          description="Show compact in-app notifications when downloads start or complete."
        >
          <Toggle value={toastEnabled} onChange={setToastEnabled} />
        </SettingRow>
      </SectionCard>

      {/* ── Behavior ─────────────────────────────────────── */}
      <SectionCard title="Behavior">
        <SettingRow
          label="Remember Last Mode"
          description="Remember whether you last chose Video, Audio, or Thumbnail between sessions."
        >
          <Toggle value={rememberMode} onChange={setRememberMode} />
        </SettingRow>
      </SectionCard>

      {/* ── Accessibility ─────────────────────────────────── */}
      <SectionCard title="Accessibility">
        <SettingRow
          label="Reduce Motion"
          description="Minimize ambient animations. Useful if animations cause discomfort."
        >
          <Toggle value={reduceMotion} onChange={setReduceMotion} />
        </SettingRow>
      </SectionCard>

      {/* Info note */}
      <p className="text-xs text-center text-muted-foreground pb-4">
        Preferences are stored locally in your browser and never sent to a server.
      </p>
    </div>
  );
}
