/**
 * Field validation shared by the Log in / Register forms. Returns i18n keys (not literal copy)
 * so the messages stay VI/EN-parity-correct (FR-034). Both forms are passwordless (email code +
 * Google) — there is no password field to validate (research R3/NFR-SEC-04).
 */
import type { TranslationKey } from '../i18n/translations';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export interface RegisterFields {
  name: string;
  email: string;
}

export type FieldErrors<T extends string> = Partial<Record<T, TranslationKey>>;

export function validateRegister(fields: RegisterFields): FieldErrors<keyof RegisterFields> {
  const errors: FieldErrors<keyof RegisterFields> = {};
  if (!fields.name.trim()) errors.name = 'validation.required';
  if (!fields.email.trim()) errors.email = 'validation.required';
  else if (!isValidEmail(fields.email)) errors.email = 'validation.email';
  return errors;
}

export interface LoginFields {
  email: string;
}

export function validateLogin(fields: LoginFields): FieldErrors<keyof LoginFields> {
  const errors: FieldErrors<keyof LoginFields> = {};
  if (!fields.email.trim()) errors.email = 'validation.required';
  else if (!isValidEmail(fields.email)) errors.email = 'validation.email';
  return errors;
}

export function isValidCode(code: string): boolean {
  return /^\d{6}$/.test(code.trim());
}

export function hasErrors(errors: Record<string, unknown>): boolean {
  return Object.keys(errors).length > 0;
}
