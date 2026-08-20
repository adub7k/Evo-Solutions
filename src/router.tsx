import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () =>
  createRouter({
    routeTree,
    // Restores scroll position on browser back/forward instead of dumping the
    // visitor at the top of the previous page.
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });
