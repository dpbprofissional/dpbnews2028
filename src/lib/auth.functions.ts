import { createServerFn } from "@tanstack/react-start";

export const getSessionStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { getSession } = await import("./auth-helpers.server");
  const session = await getSession();
  return { isAdmin: !!session.data.admin };
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "dpbinteligenciaprivada@proton.me";

export const loginAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => {
    if (!data || typeof data.email !== "string" || typeof data.password !== "string") {
      throw new Error("Email e senha são obrigatórios");
    }
    return { email: data.email.trim().toLowerCase(), password: data.password };
  })
  .handler(async ({ data }) => {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) throw new Error("Servidor não configurado (ADMIN_PASSWORD ausente)");
    if (data.email !== ADMIN_EMAIL || data.password !== adminPassword) {
      throw new Error("Email ou senha incorretos");
    }
    const { getSession } = await import("./auth-helpers.server");
    const session = await getSession();
    await session.update({ admin: true, loggedInAt: Date.now() });
    return { ok: true };
  });

export const logoutAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { getSession } = await import("./auth-helpers.server");
  const session = await getSession();
  await session.clear();
  return { ok: true };
});
