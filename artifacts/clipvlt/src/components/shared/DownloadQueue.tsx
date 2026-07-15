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
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm flex flex-col gap-2">
      {displayJobs.map(job => {
        const isError = job.status === "error" || job.status === "failed";
        const isDone = job.status === "completed";
        const isActive = !isError && !isDone;

        return (
          <div key={job.jobId} className={cn(
            "bg-card border rounded-lg shadow-lg p-3 flex flex-col gap-2 animate-in slide-in-from-bottom-4 fade-in-50",
            isActive && "border-primary/50 shadow-primary/10",
            isError && "border-destructive/50"
          )}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className={cn("w-8 h-8 rounded flex items-center justify-center shrink-0", 
                  isActive ? "bg-primary/10 text-primary" : 
                  isError ? "bg-destructive/10 text-destructive" : 
                  "bg-green-500/10 text-green-600"
                )}>
                  {isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                   isError ? <AlertCircle className="w-4 h-4" /> : 
                   <FileCheck2 className="w-4 h-4" />}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate">{job.label || "Media"}</span>
                  <span className="text-xs text-muted-foreground truncate">{job.stage || job.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {isActive && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => cancelJob(job.jobId)}>
                    <X className="w-3 h-3" />
                  </Button>
                )}
                {isError && (
                  <>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => retryJob(job.jobId)}>
                      <RefreshCcw className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => cancelJob(job.jobId)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </>
                )}
                {isDone && (
                  <>
                    <Button variant="default" size="sm" className="h-6 px-2 text-xs" asChild>
                      <a href={job.downloadUrl || getFileUrl(job.jobId)} download>
                        <Download className="w-3 h-3 mr-1" /> Save
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => cancelJob(job.jobId)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {isActive && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                  <span>{job.percent > 0 ? `${job.percent.toFixed(1)}%` : ""}</span>
                  <span>{job.speed ? `${job.speed}/s` : ""} {job.eta ? `• ETA: ${job.eta}` : ""}</span>
                </div>
                <Progress value={job.percent > 0 ? job.percent : undefined} className="h-1.5" />
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
