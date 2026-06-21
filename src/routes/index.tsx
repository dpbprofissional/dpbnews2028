import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listArticles } from "@/lib/articles.functions";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

const articlesQuery = queryOptions({
  queryKey: ["articles"],
  queryFn: () => listArticles(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DPB — Jornal Investigativo" },
      { name: "description", content: "Informação apurada. Verdade documentada. Últimas investigações do DPB." },
      { property: "og:title", content: "DPB — Jornal Investigativo" },
      { property: "og:description", content: "Informação apurada. Verdade documentada." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(articlesQuery),
  component: Home,
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="font-serif text-2xl">Erro ao carregar</h1>
        <p className="text-muted-foreground mt-2 text-sm">{error.message}</p>
      </div>
    </div>
  ),
});

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function Home() {
  const { data: articles } = useSuspenseQuery(articlesQuery);
  const [featured, ...rest] = articles;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-5 pt-8">
          {featured ? (
            <Link
              to="/noticia/$slug"
              params={{ slug: featured.slug }}
              className="group relative block overflow-hidden rounded-lg border border-border"
            >
              <div className="relative aspect-[4/5] sm:aspect-[16/10] w-full">
                {featured.cover_url ? (
                  <img
                    src={featured.cover_url}
                    alt={featured.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="eager"
                  />
                ) : (
                  <div className="absolute inset-0 bg-surface" />
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, oklch(0.58 0.21 25 / 0.0) 0%, oklch(0.58 0.21 25 / 0.45) 45%, oklch(0.45 0.20 25 / 0.85) 100%)",
                  }}
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
                <span className="inline-block bg-brand text-brand-foreground text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm">
                  {featured.category}
                </span>
                <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight mt-4 max-w-3xl">
                  {featured.title}
                </h1>
                <p className="text-white/85 mt-3 max-w-2xl text-sm sm:text-base leading-relaxed">
                  {featured.subtitle}
                </p>
                <div className="text-white/70 text-xs sm:text-sm mt-4">
                  {formatDate(featured.published_at)} · {featured.author}
                </div>
              </div>
            </Link>
          ) : (
            <div className="border border-border rounded-lg p-10 text-center text-muted-foreground">
              Nenhuma matéria publicada ainda.{" "}
              <Link to="/admin" className="text-brand underline">
                Acessar admin
              </Link>
            </div>
          )}
        </div>

        {rest.length > 0 && (
          <section className="mx-auto max-w-6xl px-5 mt-16">
            <div className="flex items-end justify-between border-b border-border pb-4 mb-8">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold">Últimas Investigações</h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((a) => (
                <Link
                  key={a.id}
                  to="/noticia/$slug"
                  params={{ slug: a.slug }}
                  className="group block"
                >
                  <div className="aspect-[4/3] overflow-hidden rounded-md bg-surface mb-4">
                    {a.cover_url && (
                      <img
                        src={a.cover_url}
                        alt={a.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand">
                    {a.category}
                  </span>
                  <h3 className="font-serif text-xl font-bold mt-2 leading-snug group-hover:text-brand transition-colors">
                    {a.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{a.subtitle}</p>
                  <div className="text-xs text-muted-foreground mt-3">
                    {formatDate(a.published_at)} · {a.author}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
