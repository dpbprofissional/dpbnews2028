import { createServerFn } from "@/lib/server-fns-mock";

async function requireAdmin() {
  const { requireAdmin: r } = await import("./auth-helpers.server");
  return r();
}

export type Article = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  cover_url: string;
  content: string;
  author: string;
  published_at: string;
};

function toArticle(r: any): Article {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    subtitle: r.subtitle,
    category: r.category,
    cover_url: r.cover_url,
    content: r.content,
    author: r.author,
    published_at: typeof r.published_at === "string" ? r.published_at : new Date(r.published_at).toISOString(),
  };
}

export const listArticles = createServerFn({ method: "GET" }).handler(async () => {
  const { sql, ensureSchema } = await import("./db.server");
  await ensureSchema();
  const rows = (await sql`
    SELECT id, slug, title, subtitle, category, cover_url, content, author, published_at
    FROM dpb_articles
    ORDER BY published_at DESC
    LIMIT 50
  `) as any[];
  return rows.map(toArticle);
});

export const getArticleBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug) }))
  .handler(async ({ data }) => {
    const { sql, ensureSchema } = await import("./db.server");
    await ensureSchema();
    const rows = (await sql`
      SELECT id, slug, title, subtitle, category, cover_url, content, author, published_at
      FROM dpb_articles WHERE slug = ${data.slug} LIMIT 1
    `) as any[];
    if (rows.length === 0) return null;
    return toArticle(rows[0]);
  });

export const getArticleById = createServerFn({ method: "GET" })
  .inputValidator((data: { id: number }) => ({ id: Number(data.id) }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { sql, ensureSchema } = await import("./db.server");
    await ensureSchema();
    const rows = (await sql`
      SELECT id, slug, title, subtitle, category, cover_url, content, author, published_at
      FROM dpb_articles WHERE id = ${data.id} LIMIT 1
    `) as any[];
    if (rows.length === 0) return null;
    return toArticle(rows[0]);
  });

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

type ArticleInput = {
  slug?: string;
  title: string;
  subtitle: string;
  category: string;
  cover_url: string;
  content: string;
  author: string;
};

function validateInput(data: any): ArticleInput {
  if (!data || typeof data !== "object") throw new Error("Dados inválidos");
  const required = ["title", "subtitle", "category", "cover_url", "content", "author"];
  for (const k of required) {
    if (typeof data[k] !== "string") throw new Error(`Campo ${k} obrigatório`);
  }
  if (!data.title.trim()) throw new Error("Título obrigatório");
  return {
    slug: typeof data.slug === "string" ? data.slug : undefined,
    title: data.title,
    subtitle: data.subtitle,
    category: data.category,
    cover_url: data.cover_url,
    content: data.content,
    author: data.author,
  };
}

export const createArticle = createServerFn({ method: "POST" })
  .inputValidator(validateInput)
  .handler(async ({ data }) => {
    await requireAdmin();
    const { sql, ensureSchema } = await import("./db.server");
    await ensureSchema();
    const slug = (data.slug && data.slug.trim()) || slugify(data.title);
    const rows = (await sql`
      INSERT INTO dpb_articles (slug, title, subtitle, category, cover_url, content, author)
      VALUES (${slug}, ${data.title}, ${data.subtitle}, ${data.category}, ${data.cover_url}, ${data.content}, ${data.author})
      RETURNING id, slug
    `) as any[];
    return { id: rows[0].id as number, slug: rows[0].slug as string };
  });

export const updateArticle = createServerFn({ method: "POST" })
  .inputValidator((data: any) => {
    if (typeof data?.id !== "number") throw new Error("id obrigatório");
    return { id: data.id, ...validateInput(data) };
  })
  .handler(async ({ data }) => {
    await requireAdmin();
    const { sql, ensureSchema } = await import("./db.server");
    await ensureSchema();
    const slug = (data.slug && data.slug.trim()) || slugify(data.title);
    await sql`
      UPDATE dpb_articles SET
        slug = ${slug},
        title = ${data.title},
        subtitle = ${data.subtitle},
        category = ${data.category},
        cover_url = ${data.cover_url},
        content = ${data.content},
        author = ${data.author}
      WHERE id = ${data.id}
    `;
    return { ok: true, slug };
  });

export const deleteArticle = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => ({ id: Number(data.id) }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { sql, ensureSchema } = await import("./db.server");
    await ensureSchema();
    await sql`DELETE FROM dpb_articles WHERE id = ${data.id}`;
    return { ok: true };
  });
