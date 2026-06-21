export const sessionConfig = {
  password: process.env.SESSION_SECRET ?? "dev-insecure-secret-change-me-please-32chars",
  name: "dpb_session",
  maxAge: 60 * 60 * 24 * 7, // 7 days
  cookie: {
    httpOnly: true,
    sameSite: "none" as const,
    secure: true,
    path: "/",
  },
};

export type SessionData = {
  admin?: boolean;
  loggedInAt?: number;
};
