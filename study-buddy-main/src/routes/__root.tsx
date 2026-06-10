import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, createRootRouteWithContext, useRouter, HeadContent, Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/lib/theme";

const themeInitScript = `(function(){try{var t=localStorage.getItem('medharank-theme');if(t!=='dark'&&t!=='light'&&t!=='default')t='default';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','default');}})();`;

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="glass max-w-md rounded-2xl p-8 text-center">
        <h1 className="text-6xl font-bold gradient-text">404</h1>
        <p className="mt-3 text-muted-foreground">Page not found.</p>
        <a href="/" className="mt-6 inline-block rounded-lg px-4 py-2 btn-gradient btn-gradient-hover">Go home</a>
      </div>
    </div>
  );
}
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="glass max-w-md rounded-2xl p-8 text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 rounded-lg px-4 py-2 btn-gradient btn-gradient-hover">Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MedhaRank — Premium Exam Prep for Bangladeshi Students" },
      { name: "description", content: "MCQ practice, live exams, leaderboard and study notes for HSC, Medical and University admission." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <HeadContent />
      </head>
      <body>{children}<Scripts /></body>
    </html>
  );
}
function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouter().state.location.pathname;
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Navbar />
        <main key={pathname} className="page-enter mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
          <Outlet />
        </main>
        <footer className="mx-auto max-w-7xl px-4 pb-10 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} MedhaRank · Crafted for Bangladeshi students.
        </footer>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
