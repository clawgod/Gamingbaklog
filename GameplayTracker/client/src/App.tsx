import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import LogsView from "@/pages/logs";
import AuthPage from "@/pages/auth";
import Header from "@/components/header";
import { ProtectedRoute } from "@/components/protected-route";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/" component={Dashboard} />
          <ProtectedRoute path="/logs" component={LogsView} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;