import { AlertCircle, AlertTriangle, Globe, Link2, WifiOff, FileX2, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-4 shadow-sm animate-pulse">
      <div className="flex gap-4">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-muted shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-5 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-3 bg-muted rounded w-1/4 mt-4" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t">
        <div className="h-8 bg-muted rounded" />
        <div className="h-8 bg-muted rounded" />
        <div className="h-8 bg-muted rounded" />
        <div className="h-8 bg-muted rounded" />
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon?: string | React.ElementType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 text-muted-foreground">
        {typeof Icon === 'string' ? (
          <i className={`${Icon} text-2xl`} />
        ) : Icon ? (
          <Icon className="w-8 h-8" />
        ) : (
          <AlertCircle className="w-8 h-8" />
        )}
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-[280px] mb-6 text-balance">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} variant="secondary">
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: any, onRetry?: () => void }) {
  let title = "Something went wrong";
  let description = typeof error === 'string' ? error : error?.message || "An unexpected error occurred.";
  let Icon: any = AlertTriangle;

  const msg = description.toLowerCase();
  if (msg.includes("unsupported") || msg.includes("not a valid")) {
    title = "Unsupported URL";
    description = "We couldn't recognize this link. Make sure it's a valid media URL.";
    Icon = Link2;
  } else if (msg.includes("private") || msg.includes("requires authentication")) {
    title = "Private Video";
    description = "This content is private or requires login. We cannot access it.";
    Icon = Globe;
  } else if (msg.includes("age") || msg.includes("18+")) {
    title = "Age Restricted";
    description = "This content is age-restricted. You may need to use the NSFW downloader.";
    Icon = AlertCircle;
  } else if (msg.includes("network") || msg.includes("fetch")) {
    title = "Network Error";
    description = "Check your internet connection and try again.";
    Icon = WifiOff;
  } else if (msg.includes("server busy") || msg.includes("offline") || msg.includes("50")) {
    title = "Server Busy";
    description = "Our extraction servers are currently busy. Please try again in a moment.";
    Icon = Loader2;
  } else if (msg.includes("failed")) {
    title = "Extraction Failed";
    Icon = FileX2;
  }

  return <EmptyState icon={Icon} title={title} description={description} action={onRetry ? { label: "Try Again", onClick: onRetry } : undefined} />;
}
