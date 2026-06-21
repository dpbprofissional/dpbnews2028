import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@/lib/server-fns-mock";
import { useState } from "react";
import { createArticle } from "@/lib/articles.functions";
import { ArticleForm } from "@/components/article-form";

export const Route = createFileRoute("/admin/novo")({
  component: NewArticle,
});

function NewArticle() {
  const create = useServerFn(createArticle);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
        ← Voltar
      </Link>
      <h1 className="font-serif text-3xl font-bold mt-2">Nova matéria</h1>
      {error && <div className="text-brand text-sm mt-4">{error}</div>}
      <div className="mt-6">
        <ArticleForm
          submitLabel="Publicar"
          submitting={loading}
          onSubmit={async (v) => {
            setLoading(true);
            setError(null);
            try {
              await create({ data: v });
              await qc.invalidateQueries({ queryKey: ["articles"] });
              await qc.invalidateQueries({ queryKey: ["admin", "articles"] });
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
