// API Platform 4 uses 'member'/'totalItems'; older versions used 'hydra:member'/'hydra:totalItems'
export interface HydraCollection<T> {
  '@context': string;
  '@id': string;
  '@type': string;
  member?: T[];
  totalItems?: number;
  'hydra:member'?: T[];
  'hydra:totalItems'?: number;
  'hydra:view'?: {
    '@id': string;
    '@type': string;
    'hydra:first'?: string;
    'hydra:last'?: string;
    'hydra:next'?: string;
    'hydra:previous'?: string;
  };
}

export interface HydraError {
  '@context': string;
  '@type': string;
  'hydra:title': string;
  'hydra:description': string;
  violations?: HydraViolation[];
  status?: number;
}

export interface HydraViolation {
  propertyPath: string;
  message: string;
}

export interface ApiError {
  message: string;
  status: number;
  violations?: Record<string, string>;
}

export interface PaginationParams {
  page?: number;
  itemsPerPage?: number;
}

export interface OrderParams {
  [key: string]: 'asc' | 'desc';
}

export interface ListParams extends PaginationParams {
  order?: OrderParams;
  [key: string]: unknown;
}

export interface ListResult<T> {
  items: T[];
  totalItems: number;
  page: number;
  itemsPerPage: number;
}
