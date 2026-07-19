import { describe, it, expect } from 'vitest';
import { loginSchema } from '../pages/Login/Login';
import { registerSchema } from '../pages/Register/Register';
import { profileSchema, passwordSchema } from '../pages/Profile/Profile';

describe('Zod Schemas Validation', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const result = loginSchema.safeParse({
        email: 'gabriel@example.com',
        password: 'Password123!',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email formats', () => {
      const result = loginSchema.safeParse({
        email: 'gabrielexample.com',
        password: 'Password123!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Formato de e-mail inválido.');
      }
    });

    it('should reject empty fields', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('should validate complex correct password and fields', () => {
      const result = registerSchema.safeParse({
        name: 'Gabriel Oliveira',
        email: 'gabriel@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      expect(result.success).toBe(true);
    });

    it('should reject when password does not match confirmation', () => {
      const result = registerSchema.safeParse({
        name: 'Gabriel Oliveira',
        email: 'gabriel@example.com',
        password: 'Password123!',
        confirmPassword: 'Password1234!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('As senhas não coincidem.');
      }
    });

    it('should reject weak passwords', () => {
      // Sem maiúscula, número ou especial
      const result = registerSchema.safeParse({
        name: 'Gabriel Oliveira',
        email: 'gabriel@example.com',
        password: 'simplepassword',
        confirmPassword: 'simplepassword',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('profileSchema', () => {
    it('should validate profile edits', () => {
      const result = profileSchema.safeParse({
        name: 'Gabriel Prado',
        email: 'gabriel2@example.com',
        avatarUrl: 'data:image/png;base64,123',
      });
      expect(result.success).toBe(true);
    });

    it('should allow empty/optional avatar url', () => {
      const result = profileSchema.safeParse({
        name: 'Gabriel Prado',
        email: 'gabriel2@example.com',
        avatarUrl: '',
      });
      expect(result.success).toBe(true);
    });

    it('should reject short username', () => {
      const result = profileSchema.safeParse({
        name: 'Ga',
        email: 'gabriel@example.com',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('should validate correct password change', () => {
      const result = passwordSchema.safeParse({
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      });
      expect(result.success).toBe(true);
    });

    it('should require strong new password', () => {
      const result = passwordSchema.safeParse({
        currentPassword: 'OldPassword123!',
        newPassword: '123',
        confirmPassword: '123',
      });
      expect(result.success).toBe(false);
    });
  });
});