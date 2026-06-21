import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <>
      <div className="bg-brand text-brand-foreground">
        <div className="mx-auto max-w-6xl px-5 py-2 text-xs sm:text-sm font-medium tracking-wide">
          Informação apurada. Verdade documentada.
        </div>
      </div>
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-6 flex items-end justify-between">
          <Link to="/" className="block">
            <div className="font-serif text-3xl sm:text-4xl font-black tracking-tight leading-none">
              DPB
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-1 font-serif italic">
              Jornal Investigativo
            </div>
          </Link>
          <nav className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors hidden sm:inline">
              Início
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="mx-auto max-w-6xl px-5 py-10 text-sm text-muted-foreground flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <div className="font-serif text-xl font-bold text-foreground">DPB</div>
          <div className="mt-1">Informação apurada. Verdade documentada.</div>
        </div>
        <div>© {new Date().getFullYear()} DPB — Todos os direitos reservados.</div>
      </div>
    </footer>
  );
}
