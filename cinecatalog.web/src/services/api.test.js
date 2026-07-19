import { describe, it, expect, beforeEach, afterEach, afterAll, beforeAll, vi } from 'vitest';
import api from './api';
import axios from 'axios';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

let refreshCalled = 0;
let getMeCalled = 0;

const handlers = [
  http.post('http://localhost:5298/api/Auth/refresh', async ({ request }) => {
    refreshCalled++;
    const body = await request.json().catch(() => ({}));
    if (body.accessToken === 'expired-token') {
      return HttpResponse.json({
        accessToken: 'new-valid-token',
        refreshToken: 'new-refresh-token'
      });
    }
    return HttpResponse.json({ message: 'Invalid refresh token' }, { status: 400 });
  }),
  http.get('http://localhost:5298/api/Auth/me', ({ request }) => {
    getMeCalled++;
    const authHeader = request.headers.get('Authorization');
    if (authHeader === 'Bearer expired-token') {
      return HttpResponse.json({ title: 'Unauthorized', detail: 'Token expired' }, { status: 401 });
    }
    if (authHeader === 'Bearer new-valid-token') {
      return HttpResponse.json({ name: 'Gabriel' });
    }
    return HttpResponse.json({ title: 'Unauthorized' }, { status: 401 });
  })
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  refreshCalled = 0;
  getMeCalled = 0;
});
afterAll(() => server.close());

describe('api service interceptors', () => {
  it('should attach Authorization header when accessToken exists in localStorage', async () => {
    localStorage.setItem('@CineCatalog:accessToken', 'new-valid-token');
    
    const response = await api.get('/api/Auth/me');
    expect(response.data.name).toBe('Gabriel');
  });

  it('should attempt token refresh on 401 and retry the original request', async () => {
    localStorage.setItem('@CineCatalog:accessToken', 'expired-token');
    localStorage.setItem('@CineCatalog:refreshToken', 'refresh-token');

    const response = await api.get('/api/Auth/me');

    expect(refreshCalled).toBe(1);
    expect(response.data.name).toBe('Gabriel');
    expect(localStorage.getItem('@CineCatalog:accessToken')).toBe('new-valid-token');
  });
});
