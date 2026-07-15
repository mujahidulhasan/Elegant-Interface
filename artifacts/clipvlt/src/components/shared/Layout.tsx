import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { DownloadQueue } from "./DownloadQueue";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden bg-background font-sans">
      <div className="aurora-bg" />
      <Navbar />
      <main className="flex-1 flex flex-col relative z-10 w-full max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
      <DownloadQueue />
    </div>
  );
}
