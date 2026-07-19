import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import api from '../services/api';

let requestCount = 0;

const handlers = [
  http.get('*/api/test-protected', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    // Simula a expiração do token na primeira chamada
    if (authHeader === 'Bearer old-token') {
      requestCount++;
      return new HttpResponse(null, { status: 401 });
    }

    if (authHeader === 'Bearer new-token') {
      return HttpResponse.json({ success: true });
    }

    return new HttpResponse(null, { status: 401 });
  }),

  http.post('*/api/Auth/refresh', async ({ request }) => {
    const body = await request.json();
    if (body.accessToken === 'old-token' && body.refreshToken === 'old-refresh') {
      return HttpResponse.json({
        accessToken: 'new-token',
        refreshToken: 'new-refresh-token',
      });
    }
    return new HttpResponse(null, { status: 400 });
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  requestCount = 0;
  vi.restoreAllMocks();
});
afterAll(() => server.close());

describe('Axios Interceptor', () => {
  it('should inject accessToken in request headers', async () => {
    localStorage.setItem('@CineCatalog:accessToken', 'some-token');

    // Cria um handler temporário para interceptar o header enviado
    server.use(
      http.get('*/api/any-endpoint', ({ request }) => {
        const authHeader = request.headers.get('Authorization');
        expect(authHeader).toBe('Bearer some-token');
        return HttpResponse.json({ ok: true });
      })
    );

    await api.get('/api/any-endpoint');
  });

  it('should attempt refresh token and retry original request on 401', async () => {
    localStorage.setItem('@CineCatalog:accessToken', 'old-token');
    localStorage.setItem('@CineCatalog:refreshToken', 'old-refresh');

    const response = await api.get('/api/test-protected');

    expect(response.data).toEqual({ success: true });
    expect(localStorage.getItem('@CineCatalog:accessToken')).toBe('new-token');
    expect(localStorage.getItem('@CineCatalog:refreshToken')).toBe('new-refresh-token');
    expect(requestCount).toBe(1); // Garante que passou pelo 401 uma vez e depois retentou
  });

  it('should dispatch auth:logout event and clear tokens if refresh fails', async () => {
    localStorage.setItem('@CineCatalog:accessToken', 'old-token');
    localStorage.setItem('@CineCatalog:refreshToken', 'wrong-refresh-token');

    const logoutListener = vi.fn();
    window.addEventListener('auth:logout', logoutListener);

    // Deve falhar o refresh e estourar erro
    await expect(api.get('/api/test-protected')).rejects.toThrow();

    expect(localStorage.getItem('@CineCatalog:accessToken')).toBeNull();
    expect(localStorage.getItem('@CineCatalog:refreshToken')).toBeNull();
    expect(logoutListener).toHaveBeenCalled();

    window.removeEventListener('auth:logout', logoutListener);
  });
});
