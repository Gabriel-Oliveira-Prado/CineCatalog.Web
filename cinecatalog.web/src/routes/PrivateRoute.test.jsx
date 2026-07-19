import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PrivateRoute from './PrivateRoute';
import { useAuth } from '../context/AuthContext';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('PrivateRoute Component', () => {
  it('should render a loading spinner when auth context is loading', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
    });

    render(
      <MemoryRouter>
        <PrivateRoute>
          <div data-testid="protected-content">Protected Content</div>
        </PrivateRoute>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('protected-content')).toBeNull();
  });

  it('should render children when user is authenticated', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
    });

    render(
      <MemoryRouter>
        <PrivateRoute>
          <div data-testid="protected-content">Protected Content</div>
        </PrivateRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content').textContent).toBe('Protected Content');
  });

  it('should redirect to login when user is not authenticated', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <div data-testid="protected-content">Protected Content</div>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('protected-content')).toBeNull();
    expect(screen.getByTestId('login-page').textContent).toBe('Login Page');
  });
});
