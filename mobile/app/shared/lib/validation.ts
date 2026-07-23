/**
 * Field validation shared by the Log in / Register forms. Returns i18n keys (not literal copy)
 * so the messages stay VI/EN-parity-correct (FR-034). Mock/local only — no network validation.
 */
import type { TranslationKey } from '../i18n/translations';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export interface RegisterFields {
  name: string;
  email: string;
  password: string;
}

export type FieldErrors<T extends string> = Partial<Record<T, TranslationKey>>;

export function validateRegister(fields: RegisterFields): FieldErrors<keyof RegisterFields> {
  const errors: FieldErrors<keyof RegisterFields> = {};
  if (!fields.name.trim()) errors.name = 'validation.required';
  if (!fields.email.trim()) errors.email = 'validation.required';
  else if (!isValidEmail(fields.email)) errors.email = 'validation.email';
  if (!fields.password) errors.password = 'validation.required';
  else if (fields.password.length < 6) errors.password = 'validation.password';
  return errors;
}

export interface LoginFields {
  email: string;
  password: string;
}

export function validateLogin(fields: LoginFields): FieldErrors<keyof LoginFields> {
  const errors: FieldErrors<keyof LoginFields> = {};
  if (!fields.email.trim()) errors.email = 'validation.required';
  else if (!isValidEmail(fields.email)) errors.email = 'validation.email';
  if (!fields.password) errors.password = 'validation.required';
  return errors;
}

export function hasErrors(errors: Record<string, unknown>): boolean {
  return Object.keys(errors).length > 0;
}
