import { NextResponse } from 'next/server';
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

    // Input Validation
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ detail: 'Invalid JSON' }, { status: 400 });
    }

    const { email, code } = body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ detail: 'Invalid email address' }, { status: 400 });
    }
    if (!code || typeof code !== 'string' || code.length !== 6 || !/^\d+$/.test(code)) {
      return NextResponse.json({ detail: 'Invalid verification code' }, { status: 400 });
    }

    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/auth/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json(); // verify code response containing access_token, refresh_token, etc.

    // Extract refresh_token so it doesn't leak in the JSON body to the client
    const { refresh_token, ...clientData } = data;

    const res = NextResponse.json(clientData);

    // Set refresh token in HttpOnly cookie if present
    if (refresh_token) {
      res.cookies.set('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    // Set access token in cookie for middleware verification
    if (data.access_token) {
      res.cookies.set('access_token', data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 15, // 15 mins
      });
    }

    return res;
  } catch (error: unknown) {
    const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : (error instanceof Error ? error.message : 'Internal Server Error');
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
