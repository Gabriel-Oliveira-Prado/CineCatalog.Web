import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Limpa o DOM após cada caso de teste para evitar vazamentos de estado
afterEach(() => {
  cleanup();
});