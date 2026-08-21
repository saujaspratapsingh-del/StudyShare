import { type ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import HomePage from '@/pages/home';
import NoteDetailPage from '@/pages/note-detail';
import SharePage from '@/pages/share';
import LikedNotesPage from '@/pages/liked';
import DownloadsPage from '@/pages/downloads';
import { StudyShell } from '@/components/study-shell';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <StudyShell>
        <div key={location} className="page-transition">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/liked" component={LikedNotesPage} />
            <Route path="/downloads" component={DownloadsPage} />
            <Route path="/notes/:id" component={NoteDetailPage} />
            <Route path="/share" component={SharePage} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </StudyShell>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
