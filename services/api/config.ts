export function getBackendUrl(): string {
  let url = process.env.INTERNAL_API_URL;
  if (!url) {
    if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.startsWith('http')) {
      url = process.env.NEXT_PUBLIC_API_URL;
    }
  }
  if (url) {
    if (!url.endsWith('/api/v1')) {
      url = url.replace(/\/+$/, '') + '/api/v1';
    }
    return url;
  }
  return 'http://127.0.0.1:8000/api/v1';
}
