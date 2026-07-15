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

  return (
    <div className={cn("relative group w-full flex flex-col gap-4", className)}>
      <div className="relative flex items-center bg-input rounded-xl overflow-hidden shadow-none transition-all focus-within:ring-2 focus-within:ring-ring focus-within:border-ring h-[51px]">
        <div className="pl-4 pr-2 flex items-center justify-center text-muted-foreground">
          {platform && platform.id !== 'generic' ? (
            <i className={cn(platform.icon, "text-lg")} style={{ color: platform.accent }} />
          ) : (
            <Link2 className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="border-0 focus-visible:ring-0 shadow-none text-base h-full pl-2 pr-2 bg-transparent text-foreground placeholder:text-muted-foreground w-full"
          disabled={isLoading}
        />
        <div className="pr-2 flex items-center shrink-0">
          {value ? (
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-xl" onClick={() => onChange("")} disabled={isLoading}>
              <X className="w-5 h-5" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="h-9 text-sm font-semibold rounded-xl text-primary hover:text-primary hover:bg-primary/10" onClick={handlePaste} disabled={isLoading}>
              Paste
            </Button>
          )}
        </div>
      </div>
      
      <Button 
        onClick={onSubmit} 
        disabled={!valid || isLoading} 
        className="w-full h-[51px] rounded-xl font-semibold shadow-none text-base transition-all bg-primary hover:bg-[#B92C2C] text-primary-foreground"
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
  );
}
