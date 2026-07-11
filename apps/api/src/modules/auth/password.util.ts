import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;

/**
 * Hash a password using Node's built-in scrypt (no native dependency).
 * Format: `scrypt$<saltHex>$<hashHex>`. Argon2id is the Phase 2 target per the
 * master plan; scrypt is a strong, dependency-free choice for the MVP.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') {
    return false;
  }

  const salt = Buffer.from(parts[1], 'hex');
  const expected = Buffer.from(parts[2], 'hex');
  const derived = scryptSync(password, salt, expected.length);

  return expected.length === derived.length && timingSafeEqual(expected, derived);
}
