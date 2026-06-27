import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getBackendUrl } from '@/services/api/config';

export async function POST(request: Request) {
  try {
    // CSRF Check
    const origin = request.headers.get('origin');
    if (origin) {
      const originUrl = new URL(origin);
      const requestUrl = new URL(request.url);
      if (originUrl.host !== requestUrl.host) {
        return NextResponse.json({ detail: 'CSRF Protection: Invalid origin' }, { status: 403 });
      }
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;

    const backendUrl = getBackendUrl();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    await fetch(`${backendUrl}/auth/logout`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ refresh_token: refreshToken || null }),
    });
  } catch (e) {
    // Ignore backend logout errors, proceed to clear local session
  }

  const response = NextResponse.json({ message: 'Logged out successfully' });
  
  // Clear cookies
  response.cookies.delete('refresh_token');
  response.cookies.delete('access_token');

  return response;
}
