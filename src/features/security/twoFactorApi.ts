import { apiClient } from '@/api/client';

const JSON_HEADERS = { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } };

export interface TwoFactorSetup {
  secret: string;
  otpauthUri: string;
}

/** Génère un secret TOTP et renvoie l'URI otpauth à saisir dans l'application d'authentification. */
export async function setupTwoFactor(): Promise<TwoFactorSetup> {
  const res = await apiClient.post<TwoFactorSetup>('/2fa/setup', {}, JSON_HEADERS);
  return res.data;
}

/** Active la 2FA après vérification d'un premier code. */
export async function enableTwoFactor(code: string): Promise<void> {
  await apiClient.post('/2fa/enable', { code }, JSON_HEADERS);
}

/** Désactive la 2FA (code requis si elle est active). */
export async function disableTwoFactor(code: string): Promise<void> {
  await apiClient.post('/2fa/disable', { code }, JSON_HEADERS);
}

/** Vérifie un code TOTP pour le compte connecté (step-up). */
export async function verifyTwoFactor(code: string): Promise<boolean> {
  const res = await apiClient.post<{ verified: boolean }>('/2fa/verify', { code }, JSON_HEADERS);
  return res.data.verified === true;
}
