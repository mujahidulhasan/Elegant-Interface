import { siteConfig } from "@/lib/siteConfig";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function Layout({ children }: { children: React.ReactNode }) {
  const hasBgVideo = siteConfig.backgroundType === "video";
  const hasAnimations = siteConfig.features.animations;

  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden bg-background font-sans">

      {/* ── Ambient background ─────────────────────────────────── */}
      {hasBgVideo ? (
        /*
         * bg.mp4: muted, looped, autoplayed, GPU-composited.
         * Owner drops /public/site/bg.mp4 and sets backgroundType="video" in settings.js.
         */
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="fixed inset-0 w-full h-full object-cover z-[-2] opacity-20 pointer-events-none"
          style={{ willChange: "auto" }}
          src="/site/bg.mp4"
        />
      ) : hasAnimations ? (
        /* Default: aurora + gradient mesh + floating particles */
        <>
          <div className="aurora-bg" aria-hidden="true" />
          <div className="gradient-mesh" aria-hidden="true">
            <div className="gradient-mesh-a" />
            <div className="gradient-mesh-b" />
          </div>
          <div className="particles" aria-hidden="true">
            <div className="particle" />
            <div className="particle" />
            <div className="particle" />
            <div className="particle" />
            <div className="particle" />
            <div className="particle" />
          </div>
        </>
      ) : null}

      <Navbar />
      <main
        className="flex-1 flex flex-col relative z-10 w-full max-w-5xl mx-auto px-4 py-8"
        id="main-content"
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
