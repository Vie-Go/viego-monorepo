/**
 * Mock account/session repository (research.md R9; data-model.md Explorer).
 *
 * Zero network calls — accounts live in `AsyncStorage` so they survive restarts within a single
 * install (needed for US3 returning sign-in to be testable without re-registering). A later
 * feature swaps only this module's internals for real API calls, without changing any screen or
 * store. `passwordHash` is a deliberately-weak placeholder transform, NOT real security (spec Key
 * Entities note).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'viego.mock.explorers';

export interface Explorer {
  id: string;
  displayName: string;
  email: string;
  passwordHash: string;
  consentAcceptedAt: string;
}

/** Public shape returned to callers — never leaks the password hash. */
export type PublicExplorer = Omit<Explorer, 'passwordHash'>;

export type AuthErrorCode = 'duplicate-email' | 'invalid-credentials';

export class AuthError extends Error {
  constructor(public code: AuthErrorCode) {
    super(code);
    this.name = 'AuthError';
  }
}

function toPublic(e: Explorer): PublicExplorer {
  const { passwordHash: _omit, ...pub } = e;
  return pub;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Placeholder transform — NOT cryptographically secure; real hashing is a later feature. */
function hashPassword(password: string): string {
  let h = 0;
  for (let i = 0; i < password.length; i += 1) {
    h = (h << 5) - h + password.charCodeAt(i);
    h |= 0;
  }
  return `mock$${h}`;
}

function generateId(): string {
  return `exp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

async function readAll(): Promise<Explorer[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Explorer[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(explorers: Explorer[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(explorers));
}

export interface RegisterInput {
  displayName: string;
  email: string;
  password: string;
}

/**
 * Create a mock account. Throws `AuthError('duplicate-email')` if the email already exists
 * (FR-020; US2 acceptance scenario 2).
 */
export async function register(input: RegisterInput): Promise<PublicExplorer> {
  const email = normalizeEmail(input.email);
  const explorers = await readAll();
  if (explorers.some((e) => e.email === email)) {
    throw new AuthError('duplicate-email');
  }
  const explorer: Explorer = {
    id: generateId(),
    displayName: input.displayName.trim(),
    email,
    passwordHash: hashPassword(input.password),
    consentAcceptedAt: new Date().toISOString(),
  };
  await writeAll([...explorers, explorer]);
  return toPublic(explorer);
}

export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Validate mock credentials. Throws `AuthError('invalid-credentials')` on unknown email or wrong
 * password (US3 acceptance scenario 2) — the same code for both, so the UI never reveals which
 * field was wrong.
 */
export async function login(input: LoginInput): Promise<PublicExplorer> {
  const email = normalizeEmail(input.email);
  const explorers = await readAll();
  const found = explorers.find((e) => e.email === email);
  if (!found || found.passwordHash !== hashPassword(input.password)) {
    throw new AuthError('invalid-credentials');
  }
  return toPublic(found);
}

/** Test/support helper — wipe the mock account store. */
export async function _resetForTests(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
