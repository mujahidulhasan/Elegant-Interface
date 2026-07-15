import { useState, useRef, useEffect } from "react";
import { Link2, Search, X } from "lucide-react";
import { detectPlatform, isLikelyUrl, PlatformDef } from "@/lib/platforms";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UrlInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  statusText?: string;
  placeholder?: string;
  className?: string;
}

export function UrlInput({ value, onChange, onSubmit, isLoading, statusText, placeholder = "Paste a link here...", className }: UrlInputProps) {
  const [platform, setPlatform] = useState<PlatformDef | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform(value));
  }, [value]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onChange(text);
    } catch (err) {
      console.error("Failed to read clipboard");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isLikelyUrl(value) && !isLoading) {
      onSubmit();
    }
  };

  const valid = isLikelyUrl(value);

  // Apply a subtle local override if platform detected
  const inlineStyle = platform && platform.accent ? {
    '--ring': `from hsl(var(--primary)) h s l`, // just a mock idea, better to use the exact hex in a custom prop
  } as React.CSSProperties : {};

  return (
    <div className={cn("relative group w-full", className)}>
      <div 
        className={cn(
          "absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500",
          platform ? "opacity-30 group-hover:opacity-50" : ""
        )}
        style={platform ? { background: `linear-gradient(to right, ${platform.accent}80, ${platform.accent})` } : {}}
      />
      <div className="relative flex items-center bg-card border rounded-xl overflow-hidden shadow-sm transition-all focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
        <div className="pl-4 pr-2 flex items-center justify-center text-muted-foreground">
          {platform ? (
            <i className={cn(platform.icon, "text-lg")} style={{ color: platform.accent }} />
          ) : (
            <Link2 className="w-5 h-5" />
          )}
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="border-0 focus-visible:ring-0 shadow-none text-base h-14 pl-2 pr-2 bg-transparent"
          disabled={isLoading}
        />
        <div className="pr-2 flex items-center gap-1 shrink-0">
          {value ? (
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" onClick={() => onChange("")} disabled={isLoading}>
              <X className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="h-9 text-xs font-medium" onClick={handlePaste} disabled={isLoading}>
              Paste
            </Button>
          )}
          <Button 
            onClick={onSubmit} 
            disabled={!valid || isLoading} 
            className="h-10 px-6 font-semibold shadow-sm transition-all"
            style={platform ? { backgroundColor: platform.accent, color: '#fff' } : {}}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-circle-notch fa-spin" /> {statusText || "Loading"}
              </span>
            ) : (
              "Extract"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
