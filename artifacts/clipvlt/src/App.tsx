import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/shared/Layout";
import { useAccentColor } from "@/hooks/useAccentColor";
import { Home } from "@/pages/Home";
import { Downloader } from "@/pages/Downloader";
import { BulkDownloader } from "@/pages/Bulk";
import { HistoryPage } from "@/pages/History";
import { SettingsPage } from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  useAccentColor();
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/download" component={Downloader} />
        <Route path="/bulk" component={BulkDownloader} />
        <Route path="/history" component={HistoryPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <WouterRouter>
      <Router />
      <Toaster />
    </WouterRouter>
  );
}

export default App;
