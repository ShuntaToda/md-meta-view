import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { RootLayout } from "@/routes/__root";
import { IndexPage } from "@/routes/index";
import type { SearchParams } from "@/lib/search-params";

const validateSearch = (search: Record<string, unknown>): SearchParams => ({
  sort: (search.sort as string) || undefined,
  filter: (search.filter as string) || undefined,
  q: (search.q as string) || undefined,
  file: (search.file as string) || undefined,
});

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch,
  component: IndexPage,
});

const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
