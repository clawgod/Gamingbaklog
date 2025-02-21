import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  return (
    <header className="border-b">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            GameLogger
          </h1>

          <div className="flex gap-4">
            <Link href="/">
              <a className={cn(
                "hover:text-primary transition-colors",
                location === "/" && "text-primary font-medium"
              )}>
                Dashboard
              </a>
            </Link>
            <Link href="/logs">
              <a className={cn(
                "hover:text-primary transition-colors",
                location === "/logs" && "text-primary font-medium"
              )}>
                Logs
              </a>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {user.username}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </nav>
    </header>
  );
}