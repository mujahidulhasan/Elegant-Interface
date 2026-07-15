import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { siteConfig } from "@/lib/siteConfig";
import { useTheme } from "@/hooks/useTheme";
import { Button, buttonVariants } from "@/components/ui/button";
import { Menu, Moon, Sun, Monitor, Clock, Download } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { resolved, mode, setMode } = useTheme();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/video", label: "Video" },
    ...(siteConfig.features.playlist ? [{ href: "/playlist", label: "Playlist" }] : []),
    ...(siteConfig.features.thumbnail ? [{ href: "/thumbnail", label: "Thumbnails" }] : []),
    ...(siteConfig.features.timestamp ? [{ href: "/timestamp", label: "Clips" }] : []),
    ...(siteConfig.features.bulk ? [{ href: "/bulk", label: "Bulk" }] : []),
    ...(siteConfig.features.nsfw ? [{ href: "/nsfw", label: "18+" }] : []),
  ];

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full transition-all duration-300",
      scrolled ? "bg-background/80 backdrop-blur-md border-b" : "bg-transparent border-transparent"
    )}>
      <div className="container mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <Download className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-tight text-lg">{siteConfig.siteName}</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-sm transition-colors",
                location === link.href ? "bg-muted font-semibold" : "text-muted-foreground hover:text-foreground"
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
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "hidden sm:flex")}
              title="History"
            >
              <Clock className="w-4 h-4" />
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                {resolved === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setMode("light")}>
                <Sun className="w-4 h-4 mr-2" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMode("dark")}>
                <Moon className="w-4 h-4 mr-2" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMode("system")}>
                <Monitor className="w-4 h-4 mr-2" /> System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader>
                <SheetTitle className="text-left flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" /> {siteConfig.siteName}
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-8">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    onClick={() => setOpen(false)}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "w-full justify-start text-base",
                      location === link.href && "bg-muted font-semibold"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {siteConfig.features.history && (
                  <Link 
                    href="/history" 
                    onClick={() => setOpen(false)}
                    className={cn(
                      buttonVariants({ variant: "ghost" }), 
                      "w-full justify-start text-base mt-4",
                      location === "/history" && "bg-muted font-semibold"
                    )}
                  >
                    <Clock className="w-4 h-4 mr-2" /> History
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
