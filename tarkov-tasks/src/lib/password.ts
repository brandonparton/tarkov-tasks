// src/lib/password.ts
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/** Hashes a plain-text password */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/** Verifies a plain-text password against a bcrypt hash */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
