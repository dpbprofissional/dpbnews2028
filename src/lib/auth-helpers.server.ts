import { useSession } from "@/lib/server-fns-mock";
import { sessionConfig } from "./session.server";

export async function getSession() {
  return useSession<{ admin?: boolean; loggedInAt?: number }>(sessionConfig);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session.data.admin) {
    throw new Error("Não autorizado");
  }
}
