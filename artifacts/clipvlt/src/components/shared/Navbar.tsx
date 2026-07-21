import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { siteConfig } from "@/lib/siteConfig";
import { useTheme } from "@/hooks/useTheme";
import { Button, buttonVariants } from "@/components/ui/button";
import { Menu, Moon, Sun, Clock, Download, Video, Layers, Settings2, Code2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// ─── Logo component — respects logoMode from siteConfig ──
function SiteLogo({ size = "md" }: { size?: "sm" | "md" }) {
  const [logoError, setLogoError] = useState(false);
  const mode = siteConfig.logoMode;
  const showImage = mode === "logo-only" || mode === "logo+text";
  const showText  = mode === "text-only"  || mode === "logo+text";
  const imgSize   = size === "sm" ? "w-7 h-7" : "w-[34px] h-[34px]";

  return (
    <div className="flex items-center gap-2.5">
      {showImage && !logoError && (
        <img
          src={siteConfig.logo}
          alt={siteConfig.siteName}
          className={cn(imgSize, "rounded-[10px] object-cover")}
          onError={() => setLogoError(true)}
        />
      )}
      {showImage && logoError && (
        <div className={cn(imgSize, "rounded-[10px] bg-primary flex items-center justify-center text-primary-foreground shadow-sm")}>
          <Download className={size === "sm" ? "w-4 h-4" : "w-5 h-5"} />
        </div>
      )}
      {showText && (
        <span className={cn("font-semibold tracking-tight", size === "sm" ? "text-lg" : "text-xl")}>
          {siteConfig.siteName}
        </span>
      )}
    </div>
  );
}

export function Navbar() {
  const { resolved, mode, setMode } = useTheme();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/download", label: "Download", icon: Video },
    ...(siteConfig.features.bulk ? [{ href: "/bulk", label: "Bulk", icon: Layers }] : []),
    ...(siteConfig.features.developer ? [{ href: "/developer", label: "Developer", icon: Code2 }] : []),
  ];

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full transition-all duration-300 border-b",
      scrolled
        ? "bg-background/80 backdrop-blur-md border-border"
        : "bg-transparent border-transparent"
    )}>
      <div className="container mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <SiteLogo />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-sm rounded-[16px] h-10 px-4 transition-colors",
                location.startsWith(link.href)
                  ? "bg-secondary font-semibold text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side icons */}
        <div className="flex items-center gap-1">
          {siteConfig.features.history && (
            <Link
              href="/history"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "hidden sm:flex rounded-[16px]",
                location === "/history" && "bg-secondary"
              )}
              title="History"
              aria-label="Download history"
            >
              <Clock className="w-5 h-5" />
            </Link>
          )}

          {siteConfig.features.settings && (
            <Link
              href="/settings"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "hidden sm:flex rounded-[16px]",
                location === "/settings" && "bg-secondary"
              )}
              title="Settings"
              aria-label="Settings"
            >
              <Settings2 className="w-5 h-5" />
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="rounded-[16px]"
            onClick={() => setMode(resolved === "dark" ? "light" : "dark")}
            aria-label={resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {resolved === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="rounded-[16px]" aria-label="Open menu">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[340px] p-6 bg-card border-l-0">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-left">
                  <SiteLogo size="sm" />
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-1.5">
                {/* Main nav links */}
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 h-[46px] px-3 rounded-[14px] transition-colors",
                        isActive ? "bg-secondary" : "hover:bg-secondary/50"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0",
                        isActive ? "bg-card text-primary shadow-sm" : "bg-secondary text-muted-foreground"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={cn("text-base font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
                        {link.label}
                      </span>
                    </Link>
                  );
                })}

                {/* Separator */}
                <div className="h-px bg-border my-1" />

                {/* Utility links */}
                {siteConfig.features.history && (
                  <Link
                    href="/history"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 h-[46px] px-3 rounded-[14px] transition-colors",
                      location === "/history" ? "bg-secondary" : "hover:bg-secondary/50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0",
                      location === "/history" ? "bg-card text-primary shadow-sm" : "bg-secondary text-muted-foreground"
                    )}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className={cn("text-base font-medium", location === "/history" ? "text-foreground" : "text-muted-foreground")}>
                      History
                    </span>
                  </Link>
                )}

                {siteConfig.features.settings && (
                  <Link
                    href="/settings"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 h-[46px] px-3 rounded-[14px] transition-colors",
                      location === "/settings" ? "bg-secondary" : "hover:bg-secondary/50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0",
                      location === "/settings" ? "bg-card text-primary shadow-sm" : "bg-secondary text-muted-foreground"
                    )}>
                      <Settings2 className="w-4 h-4" />
                    </div>
                    <span className={cn("text-base font-medium", location === "/settings" ? "text-foreground" : "text-muted-foreground")}>
                      Settings
                    </span>
                  </Link>
                )}

                {/* Theme toggle in mobile menu */}
                <button
                  onClick={() => { setMode(resolved === "dark" ? "light" : "dark"); setOpen(false); }}
                  className="flex items-center gap-3 h-[46px] px-3 rounded-[14px] transition-colors hover:bg-secondary/50"
                >
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 bg-secondary text-muted-foreground">
                    {resolved === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </div>
                  <span className="text-base font-medium text-muted-foreground">
                    {resolved === "dark" ? "Light Mode" : "Dark Mode"}
                  </span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
