import { Outlet } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/theme-toggle";
import { useMdData } from "@/hooks/use-md-data";

export function RootLayout() {
  const { loading } = useMdData();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <header className="border-b px-4 py-3 shrink-0 flex items-center justify-between">
        <h1 className="text-lg font-bold">md-meta-view</h1>
        <ThemeToggle />
      </header>
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
