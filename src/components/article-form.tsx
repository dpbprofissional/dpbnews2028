import { useState } from "react";

export type ArticleFormValue = {
  slug?: string;
  title: string;
  subtitle: string;
  category: string;
  cover_url: string;
  content: string;
  author: string;
};

export function ArticleForm({
  initial,
  submitting,
  onSubmit,
  submitLabel,
}: {
  initial?: Partial<ArticleFormValue>;
  submitting?: boolean;
  submitLabel: string;
  onSubmit: (v: ArticleFormValue) => void | Promise<void>;
}) {
  const [v, setV] = useState<ArticleFormValue>({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    subtitle: initial?.subtitle ?? "",
    category: initial?.category ?? "Investigação",
    cover_url: initial?.cover_url ?? "",
    content: initial?.content ?? "",
    author: initial?.author ?? "Redação DPB",
  });

  function set<K extends keyof ArticleFormValue>(k: K, val: ArticleFormValue[K]) {
    setV((prev) => ({ ...prev, [k]: val }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
      className="space-y-5 max-w-2xl"
    >
      <Field label="Título">
        <input
          required
          value={v.title}
          onChange={(e) => set("title", e.target.value)}
          className="input"
        />
      </Field>
      <Field label="Subtítulo / chamada">
        <textarea
          required
          rows={2}
          value={v.subtitle}
          onChange={(e) => set("subtitle", e.target.value)}
          className="input resize-y"
        />
      </Field>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Categoria">
          <input
            required
            value={v.category}
            onChange={(e) => set("category", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Autor">
          <input
            required
            value={v.author}
            onChange={(e) => set("author", e.target.value)}
            className="input"
          />
        </Field>
      </div>
      <Field label="URL da imagem de capa">
        <input
          required
          type="url"
          value={v.cover_url}
          onChange={(e) => set("cover_url", e.target.value)}
          placeholder="https://..."
          className="input"
        />
      </Field>
      <Field label="Slug (opcional — gerado a partir do título se vazio)">
        <input
          value={v.slug}
          onChange={(e) => set("slug", e.target.value)}
          placeholder="exemplo-de-slug"
          className="input"
        />
      </Field>
      <Field label="Conteúdo">
        <textarea
          required
          rows={10}
          value={v.content}
          onChange={(e) => set("content", e.target.value)}
          className="input resize-y font-serif text-base"
        />
      </Field>
      <button
        type="submit"
        disabled={submitting}
        className="bg-brand text-brand-foreground font-semibold px-5 py-2.5 rounded-md hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Salvando..." : submitLabel}
      </button>

      <style>{`
        .input {
          width: 100%;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 0.5rem;
          padding: 0.55rem 0.75rem;
          outline: none;
        }
        .input:focus { border-color: var(--color-brand); }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium block mb-1.5">{label}</span>
      {children}
    </label>
  );
}
