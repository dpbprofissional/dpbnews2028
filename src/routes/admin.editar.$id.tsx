import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@/lib/server-fns-mock";
import { useState } from "react";
import { getArticleById, updateArticle } from "@/lib/articles.functions";
import { ArticleForm } from "@/components/article-form";

const articleByIdQuery = (id: number) =>
  queryOptions({
    queryKey: ["admin", "article", id],
    queryFn: () => getArticleById({ data: { id } }),
  });

export const Route = createFileRoute("/admin/editar/$id")({
  loader: async ({ params, context }) => {
    const id = Number(params.id);
    const data = await context.queryClient.ensureQueryData(articleByIdQuery(id));
    if (!data) throw notFound();
    return data;
  },
  component: EditArticle,
  notFoundComponent: () => <div>Matéria não encontrada.</div>,
});

function EditArticle() {
  const { id } = Route.useParams();
  const idNum = Number(id);
  const { data: article } = useSuspenseQuery(articleByIdQuery(idNum));
  const update = useServerFn(updateArticle);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!article) return null;

  return (
    <div>
      <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
        ← Voltar
      </Link>
      <h1 className="font-serif text-3xl font-bold mt-2">Editar matéria</h1>
      {error && <div className="text-brand text-sm mt-4">{error}</div>}
      <div className="mt-6">
        <ArticleForm
          submitLabel="Salvar alterações"
          submitting={loading}
          initial={article}
          onSubmit={async (v) => {
            setLoading(true);
            setError(null);
            try {
              await update({ data: { id: idNum, ...v } });
              await qc.invalidateQueries({ queryKey: ["articles"] });
              await qc.invalidateQueries({ queryKey: ["admin", "articles"] });
              await qc.invalidateQueries({ queryKey: ["admin", "article", idNum] });
              await navigate({ to: "/admin" });
            } catch (err: any) {
              setError(err?.message ?? "Erro ao salvar");
            } finally {
              setLoading(false);
            }
          }}
        />
      </div>
    </div>
  );
}
