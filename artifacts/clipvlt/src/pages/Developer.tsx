import { useState, useEffect } from "react";
import { siteConfig } from "@/lib/siteConfig";
import { Globe, Github, MessageCircle, Mail, Twitter } from "lucide-react";
import NotFound from "@/pages/not-found";

interface DeveloperInfo {
  name: string;
  description: string;
  avatar: string;
  website?: string;
  github?: string;
  telegram?: string;
  discord?: string;
  twitter?: string;
  email?: string;
}

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
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-[14px] bg-secondary/60 hover:bg-secondary transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </a>
  );
}

export function DeveloperPage() {
  const [dev, setDev] = useState<DeveloperInfo | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Feature-gated: only show if developer feature is enabled
  if (!siteConfig.features.developer) {
    return <NotFound />;
  }

  useEffect(() => {
    fetch("/site/developer.json")
      .then((r) => r.json())
      .then((data: DeveloperInfo) => { setDev(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const socialLinks = dev
    ? Object.entries(dev)
        .filter(([key, val]) => ["website", "github", "telegram", "discord", "twitter"].includes(key) && val)
        .map(([key, val]) => ({ key, href: val as string, Icon: SOCIAL_ICONS[key] ?? Globe }))
    : [];

  const emailLink = dev?.email ? { key: "email", href: `mailto:${dev.email}`, Icon: Mail } : null;
  const allLinks = emailLink ? [...socialLinks, emailLink] : socialLinks;

  return (
    <div className="w-full max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 pt-4">
      <div className="bg-card rounded-[20px] p-8 card-shadow text-center space-y-5">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="w-24 h-24 rounded-full bg-muted mx-auto" />
            <div className="h-6 bg-muted rounded-[8px] w-1/2 mx-auto" />
            <div className="h-4 bg-muted rounded-[8px] w-3/4 mx-auto" />
          </div>
        ) : dev ? (
          <>
            {/* Avatar */}
            <div className="flex justify-center">
              {!avatarError && dev.avatar ? (
                <img
                  src={dev.avatar}
                  alt={dev.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-border"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold">
                  {dev.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name + description */}
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold">{dev.name}</h1>
              {dev.description && (
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  {dev.description}
                </p>
              )}
            </div>

            {/* Social links */}
            {allLinks.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {allLinks.map(({ key, href, Icon }) => (
                  <SocialLink
                    key={key}
                    icon={Icon}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    href={href}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-muted-foreground text-sm py-6">
            Developer information is not available. Add a <code className="font-mono text-xs bg-secondary px-1 py-0.5 rounded">/site/developer.json</code> file to display it here.
          </p>
        )}
      </div>
    </div>
  );
}
