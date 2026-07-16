import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { siteConfig } from "@/lib/siteConfig";

export function Layout({ children }: { children: React.ReactNode }) {
  const bg = siteConfig.background;
  const hasBgVideo = bg && bg.endsWith(".mp4");
  const hasBgImage = bg && !bg.endsWith(".mp4");

  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden bg-background font-sans">
      {/* Ambient background layers */}
      {hasBgVideo ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-[-2] opacity-20"
          src={bg}
        />
      ) : hasBgImage ? (
        <div
          className="fixed inset-0 z-[-2] opacity-15 bg-cover bg-center"
          style={{ backgroundImage: `url(${bg})` }}
        />
      ) : (
        <>
          {/* Default aurora + gradient mesh ambient background */}
          <div className="aurora-bg" />
          <div className="gradient-mesh" aria-hidden>
            <div className="gradient-mesh-a" />
            <div className="gradient-mesh-b" />
          </div>
          <div className="particles" aria-hidden>
            <div className="particle" />
            <div className="particle" />
            <div className="particle" />
            <div className="particle" />
            <div className="particle" />
            <div className="particle" />
          </div>
        </>
      )}

      <Navbar />
      <main className="flex-1 flex flex-col relative z-10 w-full max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
