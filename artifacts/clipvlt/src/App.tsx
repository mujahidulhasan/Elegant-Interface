import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/shared/Layout";

// Pages
import { Home } from "@/pages/Home";
import { Downloader } from "@/pages/Downloader";
import { BulkDownloader } from "@/pages/Bulk";
import { HistoryPage } from "@/pages/History";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/download" component={Downloader} />
        {/* Legacy route aliases — redirect to the unified downloader */}
        <Route path="/video">
          {() => {
            const search = window.location.search;
            window.location.replace(`/download${search}`);
            return null;
          }}
        </Route>
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
