import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@/lib/server-fns-mock";
import { deleteArticle, listArticles } from "@/lib/articles.functions";
import { logoutAdmin } from "@/lib/auth.functions";

const adminArticlesQuery = queryOptions({
  queryKey: ["admin", "articles"],
  queryFn: () => listArticles(),
});

export const Route = createFileRoute("/admin/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminArticlesQuery),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: articles } = useSuspenseQuery(adminArticlesQuery);
  const del = useServerFn(deleteArticle);
  const logout = useServerFn(logoutAdmin);
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function onDelete(id: number) {
    if (!confirm("Excluir esta matéria? Esta ação não pode ser desfeita.")) return;
    await del({ data: { id } });
    await qc.invalidateQueries({ queryKey: ["admin", "articles"] });
    await qc.invalidateQueries({ queryKey: ["articles"] });
  }

  async function onLogout() {
    await logout();
    await navigate({ to: "/admin/login" });
  }

  return (
    <div>
      <div className="flex items-end justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">Matérias</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {articles.length} {articles.length === 1 ? "matéria" : "matérias"} no banco Neon
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onLogout}
            className="text-sm border border-border px-3 py-2 rounded-md hover:bg-surface"
          >
            Sair
          </button>
          <Link
            to="/admin/novo"
            className="bg-brand text-brand-foreground text-sm font-semibold px-4 py-2 rounded-md hover:opacity-90"
          >
            + Nova matéria
          </Link>
        </div>
      </div>

      <div className="mt-6 divide-y divide-border border border-border rounded-md overflow-hidden">
        {articles.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Nenhuma matéria ainda.
          </div>
        )}
        {articles.map((a) => (
          <div key={a.id} className="p-4 flex items-center gap-4">
            <div className="w-20 h-14 rounded bg-surface overflow-hidden flex-shrink-0">
              {a.cover_url && (
                <img src={a.cover_url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wider text-brand font-bold">
                {a.category}
              </div>
              <div className="font-serif font-bold truncate">{a.title}</div>
              <div className="text-xs text-muted-foreground">
                /{a.slug} · {new Date(a.published_at).toLocaleDateString("pt-BR")}
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/noticia/$slug"
                params={{ slug: a.slug }}
                className="text-sm border border-border px-3 py-1.5 rounded hover:bg-surface"
              >
                Ver
              </Link>
              <Link
                to="/admin/editar/$id"
                params={{ id: String(a.id) }}
                className="text-sm border border-border px-3 py-1.5 rounded hover:bg-surface"
              >
                Editar
              </Link>
              <button
                onClick={() => onDelete(a.id)}
                className="text-sm border border-border px-3 py-1.5 rounded hover:bg-brand hover:text-brand-foreground hover:border-brand"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
