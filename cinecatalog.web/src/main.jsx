import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.jsx';

import { AuthProvider } from './context/AuthContext';

// Configuração do TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Evita re-buscas desnecessárias ao trocar de aba
      retry: 1, // Tenta novamente apenas uma vez em caso de falha
      staleTime: 0, // Cache expira imediatamente (garante dados sempre frescos) // Aumentar se nao quiser que atualize o catalogo instantaneamente
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>

      {/* Sistema de Toasts estilizado para o tema "Cinema à noite" */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--surface-color)',
            color: 'var(--text-main)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            borderRadius: 'var(--border-radius-md)',
            boxShadow: 'var(--shadow-md)',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-success)',
              secondary: 'var(--surface-color)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--color-error)',
              secondary: 'var(--surface-color)',
            },
          },
        }}
      />
    </QueryClientProvider>
  </StrictMode>
);