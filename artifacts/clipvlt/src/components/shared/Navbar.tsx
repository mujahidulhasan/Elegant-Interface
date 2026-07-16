import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { siteConfig } from "@/lib/siteConfig";
import { useTheme } from "@/hooks/useTheme";
import { Button, buttonVariants } from "@/components/ui/button";
import { Menu, Moon, Sun, Clock, Download, Video, Layers } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { resolved, mode, setMode } = useTheme();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/download", label: "Download", icon: Video },
    ...(siteConfig.features.bulk ? [{ href: "/bulk", label: "Bulk", icon: Layers }] : []),
  ];

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full transition-all duration-300",
      scrolled ? "bg-background/80 backdrop-blur-md border-b" : "bg-transparent border-transparent"
    )}>
      <div className="container mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          {!logoError ? (
            <img
              src={siteConfig.logo}
              alt={siteConfig.siteName}
              className="w-[34px] h-[34px] rounded-[10px] object-cover"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="w-[34px] h-[34px] rounded-[10px] bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <Download className="w-5 h-5" />
            </div>
          )}
          <span className="font-semibold tracking-tight text-xl">{siteConfig.siteName}</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-sm transition-colors rounded-[16px] h-10 px-4",
                location.startsWith(link.href)
                  ? "bg-secondary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {siteConfig.features.history && (
            <Link
              href="/history"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "hidden sm:flex rounded-[16px]")}
              title="History"
            >
              <Clock className="w-5 h-5" />
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="rounded-[16px]"
            onClick={() => setMode(resolved === "dark" ? "light" : "dark")}
          >
            {resolved === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="rounded-[16px]">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[340px] p-6 bg-card border-l-0">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-left flex items-center gap-3">
                  {!logoError ? (
                    <img
                      src={siteConfig.logo}
                      alt={siteConfig.siteName}
                      className="w-[34px] h-[34px] rounded-[10px] object-cover"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <div className="w-[34px] h-[34px] rounded-[10px] bg-primary flex items-center justify-center text-primary-foreground">
                      <Download className="w-5 h-5" />
                    </div>
                  )}
                  <span className="font-semibold text-xl">{siteConfig.siteName}</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-4 h-[46px] px-3 rounded-[14px] transition-colors",
                        isActive ? "bg-secondary" : "hover:bg-secondary/50"
                      )}
                    >
                      <div className={cn(
                        "w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0",
                        isActive ? "bg-card text-primary shadow-sm" : "bg-secondary text-muted-foreground"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={cn(
                        "text-base font-medium",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}>{link.label}</span>
                    </Link>
                  );
                })}
                {siteConfig.features.history && (
                  <Link
                    href="/history"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-4 h-[46px] px-3 rounded-[14px] transition-colors mt-1 border-t pt-3",
                      location === "/history" ? "bg-secondary" : "hover:bg-secondary/50"
                    )}
                  >
                    <div className={cn(
                      "w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0",
                      location === "/history" ? "bg-card text-primary shadow-sm" : "bg-secondary text-muted-foreground"
                    )}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className={cn(
                      "text-base font-medium",
                      location === "/history" ? "text-foreground" : "text-muted-foreground"
                    )}>History</span>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
