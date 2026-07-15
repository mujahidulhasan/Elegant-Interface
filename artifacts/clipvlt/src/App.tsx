import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/shared/Layout";

// Pages
import { VideoDownloader } from "@/pages/Video";
import { Home } from "@/pages/Home";
// We will create these shortly
import { PlaylistDownloader } from "@/pages/Playlist";
import { ThumbnailDownloader } from "@/pages/Thumbnail";
import { TimestampDownloader } from "@/pages/Timestamp";
import { NsfwDownloader } from "@/pages/Nsfw";
import { BulkDownloader } from "@/pages/Bulk";
import { HistoryPage } from "@/pages/History";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/video" component={VideoDownloader} />
        <Route path="/playlist" component={PlaylistDownloader} />
        <Route path="/thumbnail" component={ThumbnailDownloader} />
        <Route path="/timestamp" component={TimestampDownloader} />
        <Route path="/nsfw" component={NsfwDownloader} />
        <Route path="/bulk" component={BulkDownloader} />
        <Route path="/history" component={HistoryPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
