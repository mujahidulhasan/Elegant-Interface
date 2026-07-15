import { useDownloadQueue } from "@/hooks/useDownloadQueue";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, X, RefreshCcw, File, Loader2, FileCheck2, AlertCircle } from "lucide-react";
import { getFileUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export function DownloadQueue() {
  const { jobs, cancelJob, retryJob } = useDownloadQueue();

  if (jobs.length === 0) return null;

  const activeJobs = jobs.filter(j => j.status !== "completed" && j.status !== "error" && j.status !== "failed");
  const recentJobs = jobs.filter(j => j.status === "completed" || j.status === "error" || j.status === "failed").slice(0, 3);
  const displayJobs = [...activeJobs, ...recentJobs];

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm flex flex-col gap-2 px-4 md:px-0">
      {displayJobs.map(job => {
        const isError = job.status === "error" || job.status === "failed";
        const isDone = job.status === "completed";
        const isActive = !isError && !isDone;

        return (
          <div key={job.jobId} className={cn(
            "bg-card rounded-[32px] p-4 flex flex-col gap-3 animate-in slide-in-from-bottom-4 fade-in-50 card-shadow",
            isActive && "shadow-primary/10",
            isError && "border border-destructive/50"
          )}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={cn("w-16 h-16 rounded-[20px] flex items-center justify-center shrink-0 overflow-hidden relative", 
                  isActive ? "bg-primary/10 text-primary" : 
                  isError ? "bg-destructive/10 text-destructive" : 
                  "bg-green-500/10 text-green-600"
                )}>
                   {/* We don't have the thumbnail in the job object currently, but if we did, we could show it here. Let's show the icon for now. */}
                  {isActive ? <Loader2 className="w-6 h-6 animate-spin" /> : 
                   isError ? <AlertCircle className="w-6 h-6" /> : 
                   <FileCheck2 className="w-6 h-6" />}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate text-foreground">{job.label || "Media"}</span>
                  <span className="text-xs text-muted-foreground truncate mt-0.5">{job.stage || job.status}</span>
                  {isActive && (
                    <span className="text-xs font-semibold mt-1">
                      Total 100% - Remaining {100 - (job.percent || 0)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 mt-2">
                {isActive && (
                  <button className="text-sm font-semibold text-info hover:underline bg-transparent border-none p-0 cursor-pointer" onClick={() => cancelJob(job.jobId)}>
                    Cancel
                  </button>
                )}
                {isError && (
                  <>
                    <button className="text-sm font-semibold text-info hover:underline bg-transparent border-none p-0 cursor-pointer mr-3" onClick={() => retryJob(job.jobId)}>
                      Retry
                    </button>
                    <button className="text-sm font-semibold text-muted-foreground hover:underline bg-transparent border-none p-0 cursor-pointer" onClick={() => cancelJob(job.jobId)}>
                      Dismiss
                    </button>
                  </>
                )}
                {isDone && (
                  <>
                    <a href={job.downloadUrl || getFileUrl(job.jobId)} download className="text-sm font-semibold text-info hover:underline mr-3">
                      Save
                    </a>
                    <button className="text-sm font-semibold text-muted-foreground hover:underline bg-transparent border-none p-0 cursor-pointer" onClick={() => cancelJob(job.jobId)}>
                      Dismiss
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {isActive && (
              <div className="space-y-2 mt-1">
                <Progress value={job.percent > 0 ? job.percent : undefined} className="h-2 rounded-full bg-secondary [&>div]:bg-progress" />
                <div className="flex items-center justify-between text-xs font-semibold text-info">
                  <span>{job.speed ? `${job.speed}/s` : ""}</span>
                  <span>{job.eta ? `${job.eta} left` : ""}</span>
                </div>
              </div>
            )}
            {isError && job.error && (
              <div className="text-[10px] text-destructive bg-destructive/10 px-2 py-1 rounded line-clamp-2">
                {job.error}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
