import { useState, useEffect } from "react";
import { siteConfig } from "@/lib/siteConfig";
import {
  Globe,
  Github,
  MessageCircle,
  Mail,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Code2,
  Sparkles,
  MapPin,
  Check,
  Copy,
} from "lucide-react";
import NotFound from "@/pages/not-found";
import { cn } from "@/lib/utils";

interface DeveloperInfo {
  name: string;
  role?: string;
  description?: string;
  bio?: string;
  avatar?: string;
  location?: string;
  website?: string;
  github?: string;
  telegram?: string;
  discord?: string;
  twitter?: string;
  email?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  skills?: string[];
  [key: string]: any;
}

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  website: Globe,
  github: Github,
  telegram: MessageCircle,
  discord: MessageCircle,
  twitter: Twitter,
  email: Mail,
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
};

function SocialLink({ icon: Icon, label, href }: { icon: React.ElementType; label: string; href: string }) {
  return (
    <a
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2.5 rounded-[14px] bg-secondary/70 hover:bg-primary/10 hover:text-primary transition-all text-xs sm:text-sm font-medium text-muted-foreground hover:scale-105 active:scale-95 border border-border/40 shadow-xs"
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </a>
  );
}

export function DeveloperPage() {
  const [dev, setDev] = useState<DeveloperInfo | null>(null);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Feature-gated: only show if developer feature is enabled
  if (!siteConfig.features.developer) {
    return <NotFound />;
  }

  useEffect(() => {
    fetch("/site/developer.json")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load developer.json");
        return r.json();
      })
      .then((data: DeveloperInfo) => {
        setDev(data);
        setLoading(false);
      })
      .catch(() => {
        setDev(null);
        setLoading(false);
      });
  }, []);

  // Avatar candidate list (tries user defined avatar first, then fallback paths)
  const avatarCandidates: string[] = [];
  if (dev?.avatar) avatarCandidates.push(dev.avatar);
  if (!avatarCandidates.includes("/site/dev.png")) avatarCandidates.push("/site/dev.png");
  if (!avatarCandidates.includes("/site/developer.png")) avatarCandidates.push("/site/developer.png");
  if (!avatarCandidates.includes("/site/dev.jpg")) avatarCandidates.push("/site/dev.jpg");

  const currentAvatarUrl = avatarCandidates[avatarIndex];

  const handleAvatarError = () => {
    if (avatarIndex < avatarCandidates.length - 1) {
      setAvatarIndex((prev) => prev + 1);
    } else {
      setAvatarIndex(-1); // Initial avatar fallback
    }
  };

  // Build social links array strictly from developer.json data
  const socialKeys = ["website", "github", "telegram", "discord", "twitter", "linkedin", "instagram", "facebook", "youtube"];
  const socialLinks = dev
    ? socialKeys
        .filter((key) => dev[key] && typeof dev[key] === "string" && dev[key].trim().length > 0)
        .map((key) => ({
          key,
          href: dev[key] as string,
          Icon: SOCIAL_ICONS[key] ?? Globe,
          label: key.charAt(0).toUpperCase() + key.slice(1),
        }))
    : [];

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const devDescription = dev?.description || dev?.bio;

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 pt-2 pb-12 px-2 sm:px-0">
      {/* Header */}
      <div className="space-y-1 text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs">
            <Code2 className="w-5 h-5" />
          </div>
          Developer Profile
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm pl-0 sm:pl-[52px]">
          Meet the creator behind {siteConfig.siteName}.
        </p>
      </div>

      {/* Developer Card */}
      <div className="bg-card rounded-[24px] p-6 sm:p-8 card-shadow border border-border/60 text-center space-y-6 relative overflow-hidden">
        {/* Glow backdrop decorations */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {loading ? (
          <div className="space-y-4 animate-pulse py-8">
            <div className="w-28 h-28 rounded-full bg-muted mx-auto" />
            <div className="h-6 bg-muted rounded-[8px] w-1/2 mx-auto" />
            <div className="h-4 bg-muted rounded-[8px] w-3/4 mx-auto" />
          </div>
        ) : dev ? (
          <>
            {/* Avatar Section */}
            <div className="flex justify-center relative pt-2">
              {avatarIndex >= 0 && currentAvatarUrl ? (
                <div className="relative group">
                  <img
                    src={currentAvatarUrl}
                    alt={dev.name || "Developer"}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-primary/20 shadow-lg transition-transform duration-300 group-hover:scale-105"
                    onError={handleAvatarError}
                  />
                  <div className="absolute bottom-1 right-1 bg-primary text-primary-foreground p-1.5 rounded-full shadow-md">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-4 ring-primary/20 flex items-center justify-center text-3xl font-extrabold shadow-lg">
                  {(dev.name || "D").charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name & Role (Only if provided in developer.json) */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {dev.name || "Developer"}
              </h2>

              {dev.role && (
                <div className="flex justify-center pt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                    <Sparkles className="w-3.5 h-3.5" />
                    {dev.role}
                  </span>
                </div>
              )}

              {dev.location && (
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {dev.location}
                </p>
              )}

              {devDescription && (
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto pt-2">
                  {devDescription}
                </p>
              )}
            </div>

            {/* Optional Skills array from developer.json */}
            {Array.isArray(dev.skills) && dev.skills.length > 0 && (
              <div className="pt-2">
                <div className="flex flex-wrap justify-center gap-1.5">
                  {dev.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-lg bg-secondary text-xs font-medium text-foreground border border-border/40"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Email Contact Card */}
            {dev.email && (
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary/60 border border-border/50 text-xs sm:text-sm max-w-full">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate font-mono">{dev.email}</span>
                  <button
                    onClick={() => handleCopyEmail(dev.email!)}
                    className="p-1 hover:bg-background rounded-md transition-colors text-muted-foreground hover:text-foreground"
                    title="Copy email address"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Social & Web Links */}
            {socialLinks.length > 0 && (
              <div className="pt-4 border-t border-border/50">
                <div className="flex flex-wrap justify-center gap-2.5">
                  {socialLinks.map(({ key, href, Icon, label }) => (
                    <SocialLink key={key} icon={Icon} label={label} href={href} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-8 space-y-3">
            <p className="text-muted-foreground text-sm">
              Developer details could not be loaded. Please add a valid <code className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">/site/developer.json</code> file.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
