import { apiRequest } from './client';
import { User } from '@/types/shared';

export interface IdentifyResponse {
  next: 'enter_code' | 'enter_password' | 'setup_profile';
  error?: string;
}

export interface VerifyCodeResponse {
  access_token?: string;
  refresh_token?: string;
  setup_token?: string;
  user?: User;
  next: 'setup_profile' | 'approved' | 'pending_approval' | 'home';
}

export interface SetupResponse {
  access_token?: string;
  user?: User;
}

export const authApi = {
  identify: async (email: string): Promise<IdentifyResponse> => {
    return apiRequest<IdentifyResponse>('/auth/identify', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  verifyCode: async (email: string, code: string): Promise<VerifyCodeResponse> => {
    return apiRequest<VerifyCodeResponse>('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  setup: async (setupToken: string, firstName: string, lastName: string, avatarUrl?: string): Promise<SetupResponse> => {
    return apiRequest<SetupResponse>('/auth/setup', {
      method: 'POST',
      body: JSON.stringify({ setup_token: setupToken, first_name: firstName, last_name: lastName, avatar_url: avatarUrl }),
    });
  },

  refresh: async (refreshToken: string): Promise<unknown> => {
    return apiRequest<unknown>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  logout: async (): Promise<unknown> => {
    return apiRequest<unknown>('/auth/logout', {
      method: 'POST',
    });
  },
};
