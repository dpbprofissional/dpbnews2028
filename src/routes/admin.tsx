import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSessionStatus } from "@/lib/auth.functions";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    // /admin/login itself is also under this layout — allow it through
    if (location.pathname === "/admin/login") return;
    const { isAdmin } = await getSessionStatus();
    if (!isAdmin) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-5xl w-full px-5 py-10">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
