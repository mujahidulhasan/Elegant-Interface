import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertOctagon, ShieldAlert } from "lucide-react";
import { useLocation } from "wouter";
import { VideoDownloader } from "./Video";

export function NsfwDownloader() {
  const [, setLocation] = useLocation();
  const [accepted, setAccepted] = useState<boolean>(false);

  useEffect(() => {
    if (localStorage.getItem("clipvlt.nsfwAccepted") === "true") {
      setAccepted(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("clipvlt.nsfwAccepted", "true");
    setAccepted(true);
  };

  if (!accepted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl border-2 border-destructive/20 bg-card p-8 text-center space-y-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-destructive/50 to-destructive" />
          
          <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-2">
            <ShieldAlert className="w-10 h-10" />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold mb-2">Age Verification</h1>
            <p className="text-muted-foreground">
              This section is designed to download content from platforms that host adult material. You must be 18 years or older to proceed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="outline" className="w-full flex-1" onClick={() => setLocation("/")}>
              Leave
            </Button>
            <Button variant="destructive" className="w-full flex-1" onClick={handleAccept}>
              I am 18 or older
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-full max-w-lg h-32 bg-destructive/5 blur-[100px] pointer-events-none rounded-full" />
      
      <div className="bg-destructive/10 text-destructive-foreground border border-destructive/20 text-xs px-4 py-2 rounded-full mx-auto w-fit flex items-center gap-2 font-semibold">
        <AlertOctagon className="w-4 h-4 text-destructive" /> Unrestricted Mode Active
      </div>
      
      <VideoDownloader />
    </div>
  );
}
