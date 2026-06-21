import { neon } from "@neondatabase/serverless";

const url = process.env.NEON_DATABASE_URL;
if (!url) {
  console.warn("[db] NEON_DATABASE_URL is not set");
}

export const sql = neon(url ?? "postgresql://invalid");

let initPromise: Promise<void> | null = null;

export async function ensureSchema() {
  if (!initPromise) {
    initPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS dpb_articles (
          id SERIAL PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          subtitle TEXT NOT NULL DEFAULT '',
          category TEXT NOT NULL DEFAULT 'Investigação',
          cover_url TEXT NOT NULL DEFAULT '',
          content TEXT NOT NULL DEFAULT '',
          author TEXT NOT NULL DEFAULT 'Redação DPB',
          published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      // Ensure all expected columns exist (handles pre-existing tables)
      await sql`ALTER TABLE dpb_articles ADD COLUMN IF NOT EXISTS subtitle TEXT NOT NULL DEFAULT ''`;
      await sql`ALTER TABLE dpb_articles ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Investigação'`;
      await sql`ALTER TABLE dpb_articles ADD COLUMN IF NOT EXISTS cover_url TEXT NOT NULL DEFAULT ''`;
      await sql`ALTER TABLE dpb_articles ADD COLUMN IF NOT EXISTS content TEXT NOT NULL DEFAULT ''`;
      await sql`ALTER TABLE dpb_articles ADD COLUMN IF NOT EXISTS author TEXT NOT NULL DEFAULT 'Redação DPB'`;
      await sql`ALTER TABLE dpb_articles ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`;
      await sql`ALTER TABLE dpb_articles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`;
      // Seed if empty
      const rows = (await sql`SELECT COUNT(*)::int AS n FROM dpb_articles`) as Array<{ n: number }>;
      if (rows[0]?.n === 0) {
        await sql`
          INSERT INTO dpb_articles (slug, title, subtitle, category, cover_url, content, author)
          VALUES
            (
              'honey-cadela-idosa-urso',
              'Honey: A cadela idosa e cega que enfrentou um urso para salvar sua família',
              'Aos 12 anos, a pequena ''matadora de ursos'' sobreviveu a ferimentos graves após defender fazenda no Novo México',
              'Investigação',
              'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1600&q=80',
              'Honey, uma cadela de 12 anos cega de um olho, virou heroína no Novo México após enfrentar um urso que invadiu a fazenda da família. Ferida gravemente, foi levada às pressas para atendimento veterinário e segue se recuperando.',
              'Redação DPB'
            ),
            (
              'desvio-verbas-prefeitura',
              'Esquema de desvio de verbas na prefeitura movimentou R$ 12 milhões',
              'Documentos obtidos pela reportagem revelam pagamentos suspeitos a empresas de fachada entre 2023 e 2025',
              'Política',
              'https://images.unsplash.com/photo-1604933762023-7213af7ff7a7?auto=format&fit=crop&w=1600&q=80',
              'Uma investigação de seis meses identificou um padrão de pagamentos suspeitos da prefeitura a empresas sem estrutura operacional. Os valores chegaram a R$ 12 milhões no período analisado.',
              'Redação DPB'
            ),
            (
              'denuncia-trabalho-escravo',
              'Denúncia expõe trabalho análogo à escravidão em vinícolas do Sul',
              'Trabalhadores relatam jornadas exaustivas, alojamentos insalubres e retenção de documentos',
              'Direitos Humanos',
              'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1600&q=80',
              'Auditores do trabalho resgataram dezenas de trabalhadores em vinícolas após denúncias anônimas. As empresas foram autuadas e o caso segue na Justiça do Trabalho.',
              'Redação DPB'
            )
        `;
      }
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

export type ArticleRow = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  cover_url: string;
  content: string;
  author: string;
  published_at: string;
  created_at: string;
};
