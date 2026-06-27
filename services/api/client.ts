import { useAuthStore } from '@/stores/useAuthStore';
import { getBackendUrl } from './config';

export interface ApiErrorData {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  constructor(public status: number, public data: ApiErrorData | null) {
    super(data?.detail || data?.message || `API Error with status ${status}`);
    this.name = 'ApiError';
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  try {
    const refreshResponse = await fetch('/api/auth/refresh', { method: 'POST' });
    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      if (data.access_token) {
        useAuthStore.getState().setAccessToken(data.access_token);
        return data.access_token;
      }
    }
    useAuthStore.getState().logout();
    return null;
  } catch {
    useAuthStore.getState().logout();
    return null;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const accessToken = token ?? useAuthStore.getState().accessToken;

  const baseUrl = typeof window === 'undefined'
    ? getBackendUrl()
    : (process.env.NEXT_PUBLIC_API_URL || '/api/v1');
  
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401 && !path.includes('/auth/refresh') && !token) {
    if (!refreshPromise) {
      refreshPromise = performRefresh().then((newToken) => {
        refreshPromise = null;
        return newToken;
      });
    }

    const newToken = await refreshPromise;
    if (newToken) {
      return apiRequest<T>(path, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    }

    throw new ApiError(401, { detail: 'Unauthorized' });
  }

  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: response.statusText };
    }
    throw new ApiError(response.status, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
