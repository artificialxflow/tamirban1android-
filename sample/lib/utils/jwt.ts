import jwt from "jsonwebtoken";

import type { AuthTokenPayload } from "@/lib/types";

const DEFAULT_EXPIRES_IN = "1d";

export async function issueJwt(payload: AuthTokenPayload, options?: jwt.SignOptions) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }

  return jwt.sign(payload, secret, {
    expiresIn: DEFAULT_EXPIRES_IN,
    ...options,
  });
}

export function verifyJwt(token: string) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }

  return jwt.verify(token, secret) as AuthTokenPayload;
}
