import { useState, useEffect, useRef } from "react";
import { useDownloadQueue } from "@/hooks/useDownloadQueue";
import { getFileUrl, type DownloadKind, type AudioFormat } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, RefreshCcw, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DownloadSpec {
  url: string;
  kind: DownloadKind;
  formatId?: string | null;
  audioFormat?: AudioFormat;
  label: string;
}

interface DownloadActionProps extends DownloadSpec {
  disabled?: boolean;
  className?: string;
  onComplete?: () => void;
}

export function DownloadAction({
  url,
  kind,
  formatId,
  audioFormat,
  label,
  disabled,
  className,
  onComplete,
}: DownloadActionProps) {
  const { jobs, enqueue, retryJob } = useDownloadQueue();
  const { toast } = useToast();
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const autoDownloadedRef = useRef<Set<string>>(new Set());

  // Reset when the download spec changes (user picked a different format)
  const specKey = `${url}|${kind}|${formatId ?? ""}`;
  const prevSpecKey = useRef(specKey);
  useEffect(() => {
    if (prevSpecKey.current !== specKey) {
      prevSpecKey.current = specKey;
      setActiveJobId(null);
    }
  }, [specKey]);

  const activeJob = activeJobId ? jobs.find((j) => j.jobId === activeJobId) ?? null : null;

  // Auto-trigger browser download when job completes
  useEffect(() => {
    if (!activeJob) return;

    if (activeJob.status === "completed" && !autoDownloadedRef.current.has(activeJob.jobId)) {
      autoDownloadedRef.current.add(activeJob.jobId);
      const fileUrl = activeJob.downloadUrl || getFileUrl(activeJob.jobId);
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = activeJob.filename || label;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 200);
      toast({ title: "Download complete", description: label });
      onComplete?.();
    }

    if (
      (activeJob.status === "failed" || activeJob.status === "error") &&
      !autoDownloadedRef.current.has(`err-${activeJob.jobId}`)
    ) {
      autoDownloadedRef.current.add(`err-${activeJob.jobId}`);
      toast({
        title: "Download failed",
        description: activeJob.error || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [activeJob, label, toast, onComplete]);

  const handleDownload = async () => {
    const jobId = await enqueue({ url, kind, formatId, audioFormat, label });
    if (jobId) {
      setActiveJobId(jobId);
      toast({ title: "Download started", description: label });
    }
  };

  const handleRetry = () => {
    if (activeJobId) retryJob(activeJobId);
    setActiveJobId(null);
  };

  const isIdle      = !activeJob;
  const isPreparing = activeJob?.status === "queued";
  const isRunning   = activeJob?.status === "running" || activeJob?.status === "merging";
  const isCompleted = activeJob?.status === "completed";
  const isFailed    = activeJob?.status === "failed" || activeJob?.status === "error";
  const percent     = activeJob?.percent ?? 0;

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        onClick={isFailed ? handleRetry : handleDownload}
        disabled={disabled || isPreparing || isRunning || isCompleted}
        className={cn(
          "w-full h-[51px] rounded-[16px] font-semibold text-base gap-2 transition-all duration-200",
          isCompleted && "bg-green-600 hover:bg-green-600 cursor-default",
          isFailed && "bg-destructive hover:bg-destructive/90"
        )}
      >
        {isPreparing && (
          <><Loader2 className="w-5 h-5 animate-spin" /> Preparing…</>
        )}
        {isRunning && (
          <><Loader2 className="w-5 h-5 animate-spin" />
            {percent > 0 ? `Downloading ${percent}%` : "Downloading…"}
          </>
        )}
        {isCompleted && (
          <><CheckCircle className="w-5 h-5" /> Saved to Downloads</>
        )}
        {isFailed && (
          <><RefreshCcw className="w-5 h-5" /> Retry Download</>
        )}
        {isIdle && (
          <><Download className="w-5 h-5" /> Download</>
        )}
      </Button>

      {isRunning && (
        <div className="space-y-1 px-0.5">
          <Progress
            value={percent > 0 ? percent : undefined}
            className="h-1.5 rounded-full"
          />
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{activeJob?.speed ? `${activeJob.speed}/s` : ""}</span>
            <span>{activeJob?.eta ? `${activeJob.eta} left` : activeJob?.stage || ""}</span>
          </div>
        </div>
      )}

      {isFailed && activeJob?.error && (
        <p className="text-[11px] text-destructive bg-destructive/8 px-3 py-1.5 rounded-[10px] line-clamp-2">
          {activeJob.error}
        </p>
      )}
    </div>
  );
}
