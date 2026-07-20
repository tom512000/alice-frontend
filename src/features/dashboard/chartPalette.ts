/**
 * Palette des graphiques du tableau de bord — huit teintes catégorielles validées
 * CVD-safe (voir dataviz skill), utilisées en préfixe contigu selon le nombre de
 * catégories (les paires adjacentes sont garanties de passer la validation).
 * Les trois derniers slots (magenta/jaune/aqua) restent sous le seuil de contraste
 * 3:1 : toujours les accompagner d'une légende/étiquette visible, jamais de la
 * couleur seule.
 */
export const CATEGORICAL = [
  '#2a78d6', // 1 blue
  '#008300', // 2 green
  '#e87ba4', // 3 magenta
  '#eda100', // 4 yellow
  '#1baf7a', // 5 aqua
  '#eb6834', // 6 orange
  '#4a3aa7', // 7 violet
  '#e34948', // 8 red
] as const;

export const SEQUENTIAL_BLUE = '#2a78d6';

/** Couleurs de statut réutilisées telles quelles depuis Badge.tsx (mêmes teintes que les badges déjà affichés ailleurs dans l'app). */
export const STATUS = {
  info: '#3b82f6',
  success: '#16a34a',
  danger: '#dc2626',
  warning: '#d97706',
} as const;

/** Reprend exactement les couleurs du plan de lits (BedBoardPage) pour ne pas introduire un second code couleur pour le même concept. */
export const BED_STATUS: Record<string, string> = {
  free: '#9ca3af',
  reserved: '#f59e0b',
  occupied: '#ef4444',
};

export const BED_STATUS_LABELS: Record<string, string> = {
  free: 'Libre',
  reserved: 'Réservé',
  occupied: 'Occupé',
};

/**
 * Assignations fixes couleur ↔ catégorie (jamais par rang dans la réponse API,
 * qui peut être triée par fréquence) : une entité garde toujours la même teinte.
 */
export const DIAGNOSIS_TYPE_COLORS: Record<string, string> = {
  principal: CATEGORICAL[0],
  associated: CATEGORICAL[1],
  secondary: CATEGORICAL[2],
  complication: CATEGORICAL[3],
  differential: CATEGORICAL[4],
};

export const GENDER_COLORS: Record<string, string> = {
  M: CATEGORICAL[0],
  F: CATEGORICAL[1],
  O: CATEGORICAL[2],
};

export const AUDIT_ACTION_COLORS: Record<string, string> = {
  create: CATEGORICAL[0],
  update: CATEGORICAL[1],
  delete: CATEGORICAL[2],
  read: CATEGORICAL[3],
};

export const SURGICAL_STATUS_COLORS: Record<string, string> = {
  scheduled: STATUS.info,
  performed: STATUS.success,
  cancelled: STATUS.danger,
  postponed: STATUS.warning,
};

export const CONSENT_STATUS_COLORS: Record<string, string> = {
  granted: STATUS.success,
  refused: STATUS.danger,
  withdrawn: STATUS.warning,
};

export const TEXT_SECONDARY = '#52514e';
export const GRIDLINE = '#e1e0d9';
