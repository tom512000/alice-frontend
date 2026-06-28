import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return '—';
    return format(d, 'dd/MM/yyyy', { locale: fr });
  } catch {
    return '—';
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return '—';
    return format(d, 'dd/MM/yyyy HH:mm', { locale: fr });
  } catch {
    return '—';
  }
}

export function formatDateInput(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return '';
    return format(d, 'yyyy-MM-dd');
  } catch {
    return '';
  }
}

export function formatDateTimeInput(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return '';
    return format(d, "yyyy-MM-dd'T'HH:mm");
  } catch {
    return '';
  }
}

export function formatGender(gender: string | null | undefined): string {
  const map: Record<string, string> = { M: 'Homme', F: 'Femme', O: 'Autre' };
  return gender ? (map[gender] ?? gender) : '—';
}

export function formatName(lastname: string | null, firstname: string | null): string {
  if (!lastname && !firstname) return '—';
  return [lastname, firstname].filter(Boolean).join(' ');
}

export function formatPrice(price: string | number | null | undefined): string {
  if (price === null || price === undefined) return '—';
  return `${parseFloat(String(price)).toFixed(2)} €`;
}

export function formatDuration(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return '—';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

export function getAge(birthdateStr: string | null | undefined): string {
  if (!birthdateStr) return '—';
  try {
    const birth = parseISO(birthdateStr);
    if (!isValid(birth)) return '—';
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return `${age} ans`;
  } catch {
    return '—';
  }
}

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Planifié',
  completed: 'Terminé',
  cancelled: 'Annulé',
  no_show: 'Absent',
};

export const SURGICAL_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Planifiée',
  performed: 'Réalisée',
  cancelled: 'Annulée',
  postponed: 'Reportée',
};

export const DIAGNOSIS_TYPE_LABELS: Record<string, string> = {
  principal: 'Principal',
  associated: 'Associé',
  secondary: 'Secondaire',
  complication: 'Complication',
  differential: 'Différentiel',
};

export const DIAGNOSIS_CERTAINTY_LABELS: Record<string, string> = {
  confirmed: 'Confirmé',
  suspected: 'Suspecté',
  excluded: 'Exclu',
};

export const EXAM_TYPE_LABELS: Record<string, string> = {
  blood_test: 'Bilan sanguin',
  imaging: 'Imagerie',
  ecg: 'ECG',
  endoscopy: 'Endoscopie',
  biopsy: 'Biopsie',
  urinalysis: 'Analyse urine',
  microbiology: 'Microbiologie',
  other: 'Autre',
};

export const MEDICAL_HISTORY_TYPE_LABELS: Record<string, string> = {
  medical: 'Médical',
  surgical: 'Chirurgical',
  family: 'Familial',
  gynecological: 'Gynécologique',
  addiction: 'Addiction',
  allergy_detail: 'Allergie (détail)',
  vaccination: 'Vaccination',
  other: 'Autre',
};
