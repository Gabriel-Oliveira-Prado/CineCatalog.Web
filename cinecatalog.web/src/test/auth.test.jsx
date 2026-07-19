import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { AuthProvider, useAuth } from '../context/AuthContext';
import api from '../services/api';

const handlers = [
  http.post('*/api/Auth/login', async () => {
    return HttpResponse.json({
      accessToken: 'fake-access-token',
      refreshToken: 'fake-refresh-token',
    });
  }),
  http.get('*/api/Auth/me', async () => {
    return HttpResponse.json({
      id: '123',
      name: 'Gabriel Oliveira',
      email: 'gabriel@example.com',
      createdAt: '2026-07-19T00:00:00Z',
    });
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());

// Componente auxiliar para consumir o contexto
const TestComponent = () => {
  const { user, isAuthenticated, loading, login, logout } = useAuth();

  return (
    <div>
      <span data-testid="loading">{loading ? 'true' : 'false'}</span>
      <span data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</span>
      <span data-testid="username">{user?.name || 'no-user'}</span>
      <button data-testid="login-btn" onClick={() => login('gabriel@example.com', 'Password123!')}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  it('should start with loading=true or load user from storage on mount if token exists', async () => {
    localStorage.setItem('@CineCatalog:accessToken', 'fake-access-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Deve carregar o usuário e terminar o loading
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(screen.getByTestId('username').textContent).toBe('Gabriel Oliveira');
  });

  it('should authenticate user on login and save tokens', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('false');

    const loginButton = screen.getByTestId('login-btn');
    
    await act(async () => {
      loginButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });

    expect(screen.getByTestId('username').textContent).toBe('Gabriel Oliveira');
    expect(localStorage.getItem('@CineCatalog:accessToken')).toBe('fake-access-token');
    expect(localStorage.getItem('@CineCatalog:refreshToken')).toBe('fake-refresh-token');
  });

  it('should clear tokens and user state on logout', async () => {
    localStorage.setItem('@CineCatalog:accessToken', 'fake-access-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });

    const logoutButton = screen.getByTestId('logout-btn');
    
    await act(async () => {
      logoutButton.click();
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('username').textContent).toBe('no-user');
    expect(localStorage.getItem('@CineCatalog:accessToken')).toBeNull();
  });
});