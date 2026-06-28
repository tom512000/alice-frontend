import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from 'axios';
import type { ApiError, HydraCollection, HydraError, ListParams, ListResult } from '@/types/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/ld+json',
    Accept: 'application/ld+json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('alice_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<HydraError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('alice_token');
      window.location.href = '/login';
    }
    return Promise.reject(parseApiError(error));
  }
);

export function parseApiError(error: AxiosError<HydraError>): ApiError {
  const status = error.response?.status ?? 0;
  const data = error.response?.data;

  if (!data) {
    return { message: error.message || 'Erreur réseau', status };
  }

  const violations: Record<string, string> = {};
  if (data.violations) {
    for (const v of data.violations) {
      violations[v.propertyPath] = v.message;
    }
  }

  const fallbackData = data as unknown as Record<string, string>;
  const message =
    data['hydra:description'] ||
    data['hydra:title'] ||
    fallbackData['description'] ||
    fallbackData['title'] ||
    'Une erreur est survenue';

  return { message, status, violations };
}

export function extractMembers<T>(data: HydraCollection<T>): ListResult<T> {
  return {
    items: data.member ?? data['hydra:member'] ?? [],
    totalItems: data.totalItems ?? data['hydra:totalItems'] ?? 0,
    page: 1,
    itemsPerPage: 30,
  };
}

export function buildParams(params: ListParams): Record<string, string | number> {
  const result: Record<string, string | number> = {};

  if (params.page) result.page = params.page;
  if (params.itemsPerPage) result.itemsPerPage = params.itemsPerPage;

  if (params.order) {
    for (const [key, dir] of Object.entries(params.order)) {
      result[`order[${key}]`] = dir;
    }
  }

  for (const [key, value] of Object.entries(params)) {
    if (key === 'page' || key === 'itemsPerPage' || key === 'order') continue;
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value as string | number;
    }
  }

  return result;
}

export function toIri(endpoint: string, id: number | string): string {
  return `/api/${endpoint}/${id}`;
}

export function extractIdFromIri(iri: string): number {
  const parts = iri.split('/');
  return parseInt(parts[parts.length - 1], 10);
}
