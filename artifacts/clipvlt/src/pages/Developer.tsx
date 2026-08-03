import { useState, useEffect } from "react";
import { siteConfig } from "@/lib/siteConfig";
import { Globe, Github, MessageCircle, Mail, Twitter, Code2, Sparkles, UserCheck } from "lucide-react";
import NotFound from "@/pages/not-found";

interface DeveloperInfo {
  name: string;
  role?: string;
  description: string;
  avatar: string;
  website?: string;
  github?: string;
  telegram?: string;
  discord?: string;
  twitter?: string;
  email?: string;
  skills?: string[];
}

const DEFAULT_DEV: DeveloperInfo = {
  name: "Mujahidul Hasan",
  role: "Full-Stack Developer & Creator",
  description: "Creator and maintainer of Saveclp. Passionate about building fast, elegant web experiences and modern applications.",
  avatar: "/site/developer.png",
  github: "https://github.com/mujahidulhasan",
  skills: ["React", "TypeScript", "Node.js", "Tailwind CSS", "Vite"],
};

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  website:  Globe,
  github:   Github,
  telegram: MessageCircle,
  discord:  MessageCircle,
  twitter:  Twitter,
  email:    Mail,
};

function SocialLink({ icon: Icon, label, href }: { icon: React.ElementType; label: string; href: string }) {
  return (
    <a
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3.5 py-2 rounded-[14px] bg-secondary/70 hover:bg-primary/10 hover:text-primary transition-all text-xs sm:text-sm font-medium text-muted-foreground hover:scale-105 active:scale-95"
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </a>
  );
}

export function DeveloperPage() {
  const [dev, setDev] = useState<DeveloperInfo | null>(DEFAULT_DEV);
  const [avatarError, setAvatarError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Feature-gated: only show if developer feature is enabled
  if (!siteConfig.features.developer) {
    return <NotFound />;
  }

  useEffect(() => {
    fetch("/site/developer.json")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((data: DeveloperInfo) => {
        setDev({ ...DEFAULT_DEV, ...data });
        setLoading(false);
      })
      .catch(() => {
        setDev(DEFAULT_DEV);
        setLoading(false);
      });
  }, []);

  const socialLinks = dev
    ? Object.entries(dev)
        .filter(([key, val]) => ["website", "github", "telegram", "discord", "twitter"].includes(key) && val)
        .map(([key, val]) => ({ key, href: val as string, Icon: SOCIAL_ICONS[key] ?? Globe }))
    : [];

  const emailLink = dev?.email ? { key: "email", href: `mailto:${dev.email}`, Icon: Mail } : null;
  const allLinks = emailLink ? [...socialLinks, emailLink] : socialLinks;

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 pt-2 pb-8 px-2 sm:px-0">
      {/* Header Badge */}
      <div className="space-y-1 text-left sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Code2 className="w-5 h-5" />
          </div>
          Developer Profile
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm pl-0 sm:pl-[52px]">
          Meet the creator behind {siteConfig.siteName}.
        </p>
      </div>

      {/* Main Developer Card */}
      <div className="bg-card rounded-[22px] p-6 sm:p-8 card-shadow border border-border/60 text-center space-y-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        {loading ? (
          <div className="space-y-4 animate-pulse py-4">
            <div className="w-24 h-24 rounded-full bg-muted mx-auto" />
            <div className="h-6 bg-muted rounded-[8px] w-1/2 mx-auto" />
            <div className="h-4 bg-muted rounded-[8px] w-3/4 mx-auto" />
          </div>
        ) : dev ? (
          <>
            {/* Avatar */}
            <div className="flex justify-center relative">
              {!avatarError && dev.avatar ? (
                <div className="relative">
                  <img
                    src={dev.avatar}
                    alt={dev.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-primary/20 shadow-md"
                    onError={() => setAvatarError(true)}
                  />
                  <div className="absolute bottom-1 right-1 bg-primary text-white p-1.5 rounded-full shadow-md" title="Verified Developer">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-4 ring-primary/20 flex items-center justify-center text-3xl font-extrabold shadow-md">
                  {dev.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name + role + description */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{dev.name}</h2>
              {dev.role && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  <UserCheck className="w-3.5 h-3.5" />
                  {dev.role}
                </span>
              )}
              {dev.description && (
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto pt-1">
                  {dev.description}
                </p>
              )}
            </div>

            {/* Skills / Tech Stack Badges */}
            {dev.skills && dev.skills.length > 0 && (
              <div className="pt-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Technologies</p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {dev.skills.map((skill) => (
                    <span key={skill} className="px-2.5 py-1 rounded-lg bg-secondary text-xs font-medium text-foreground">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social & Contact Links */}
            {allLinks.length > 0 && (
              <div className="pt-2 border-t border-border/50">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Connect</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {allLinks.map(({ key, href, Icon }) => (
                    <SocialLink
                      key={key}
                      icon={Icon}
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                      href={href}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
