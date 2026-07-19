import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, afterAll, beforeAll } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const handlers = [
  http.post('http://localhost:5298/api/Auth/login', async ({ request }) => {
    const { email } = await request.json();
    if (email === 'fail@test.com') {
      return HttpResponse.json({ title: 'Unauthorized', detail: 'Invalid credentials' }, { status: 401 });
    }
    return HttpResponse.json({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    });
  }),
  http.get('http://localhost:5298/api/Auth/me', () => {
    return HttpResponse.json({
      id: 'user-id',
      name: 'Gabriel Prado',
      email: 'gabriel@test.com',
      avatarUrl: ''
    });
  }),
  http.post('http://localhost:5298/api/Auth/register', () => {
    return HttpResponse.json({ success: true });
  })
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());

const TestComponent = () => {
  const { user, isAuthenticated, login, logout, register, loading } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Guest'}</div>
      <div data-testid="user-name">{user?.name || 'No User'}</div>
      <div data-testid="loading-status">{loading ? 'Loading' : 'Idle'}</div>
      <button onClick={() => login('gabriel@test.com', 'password')} data-testid="login-btn">Login</button>
      <button onClick={() => login('fail@test.com', 'password')} data-testid="login-fail-btn">Login Fail</button>
      <button onClick={() => register('Test', 'test@test.com', 'password')} data-testid="register-btn">Register</button>
      <button onClick={logout} data-testid="logout-btn">Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  it('should start with guest status and load user if token exists', async () => {
    localStorage.setItem('@CineCatalog:accessToken', 'some-token');
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Give it time to load the user profile
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(screen.getByTestId('auth-status').textContent).toBe('Authenticated');
    expect(screen.getByTestId('user-name').textContent).toBe('Gabriel Prado');
  });

  it('should authenticate user on login and save token', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginBtn = screen.getByTestId('login-btn');
    await act(async () => {
      loginBtn.click();
    });

    expect(localStorage.getItem('@CineCatalog:accessToken')).toBe('mock-access-token');
    expect(localStorage.getItem('@CineCatalog:refreshToken')).toBe('mock-refresh-token');
    expect(screen.getByTestId('auth-status').textContent).toBe('Authenticated');
    expect(screen.getByTestId('user-name').textContent).toBe('Gabriel Prado');
  });

  it('should clear tokens on logout', async () => {
    localStorage.setItem('@CineCatalog:accessToken', 'mock-access-token');
    localStorage.setItem('@CineCatalog:refreshToken', 'mock-refresh-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for the user profile to load first
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(screen.getByTestId('auth-status').textContent).toBe('Authenticated');

    const logoutBtn = screen.getByTestId('logout-btn');
    await act(async () => {
      logoutBtn.click();
    });

    expect(localStorage.getItem('@CineCatalog:accessToken')).toBeNull();
    expect(localStorage.getItem('@CineCatalog:refreshToken')).toBeNull();
    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('Guest');
    });
  });
});