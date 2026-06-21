import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getArticleBySlug } from "@/lib/articles.functions";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

const articleQuery = (slug: string) =>
  queryOptions({
    queryKey: ["article", slug],
    queryFn: () => getArticleBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/noticia/$slug")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(articleQuery(params.slug));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — DPB` },
          { name: "description", content: loaderData.subtitle },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.subtitle },
          { property: "og:image", content: loaderData.cover_url },
          { property: "og:type", content: "article" },
        ]
      : [],
  }),
  component: ArticlePage,
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="font-serif text-3xl">Matéria não encontrada</h1>
          <Link to="/" className="text-brand underline mt-4 inline-block">
            Voltar à home
          </Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <p className="text-muted-foreground text-sm">{error.message}</p>
    </div>
  ),
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { data: article } = useSuspenseQuery(articleQuery(slug));
  if (!article) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-5 py-10">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Voltar
        </Link>
        <span className="inline-block bg-brand text-brand-foreground text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm mt-6">
          {article.category}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold leading-tight mt-4">
          {article.title}
        </h1>
        <p className="text-lg text-muted-foreground mt-4 leading-relaxed">{article.subtitle}</p>
        <div className="text-sm text-muted-foreground mt-4 border-b border-border pb-6">
          {new Date(article.published_at).toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          · {article.author}
        </div>
        {article.cover_url && (
          <img
            src={article.cover_url}
            alt={article.title}
            className="w-full rounded-md mt-8 aspect-video object-cover"
          />
        )}
        <article className="prose prose-invert max-w-none mt-8 font-serif text-lg leading-relaxed whitespace-pre-wrap">
          {article.content}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
