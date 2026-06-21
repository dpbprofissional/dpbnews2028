import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { loginAdmin } from "@/lib/auth.functions";

export const Route = createFileRoute("/admin/login")({
  component: LoginPage,
});

function LoginPage() {
  const login = useServerFn(loginAdmin);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ data: { email, password } });
      await navigate({ to: "/admin" });
    } catch (err: any) {
      setError(err?.message ?? "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="font-serif text-3xl font-bold">Painel administrativo</h1>
      <p className="text-muted-foreground text-sm mt-2">
        Insira suas credenciais para gerenciar matérias.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1.5">Email</label>
          <input
            type="email"
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Senha</label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 outline-none focus:border-brand"
          />
        </div>
        {error && <div className="text-sm text-brand">{error}</div>}
        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full bg-brand text-brand-foreground font-semibold py-2.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
