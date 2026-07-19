import { describe, it, expect } from 'vitest';
import { loginSchema } from '../pages/Login/Login';
import { registerSchema } from '../pages/Register/Register';
import { profileSchema, passwordSchema } from '../pages/Profile/Profile';

describe('Zod Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should fail validation on invalid email or empty fields', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.format();
        expect(errors.email?._errors).toContain('Formato de e-mail inválido.');
        expect(errors.password?._errors).toContain('A senha é obrigatória.');
      }
    });
  });

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const result = registerSchema.safeParse({
        name: 'Gabriel Prado',
        email: 'gabriel@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      expect(result.success).toBe(true);
    });

    it('should enforce name constraints (min 3, max 60)', () => {
      // Too short name
      const shortNameResult = registerSchema.safeParse({
        name: 'ab',
        email: 'gabriel@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      expect(shortNameResult.success).toBe(false);

      // Too long name (61 characters)
      const longName = 'a'.repeat(61);
      const longNameResult = registerSchema.safeParse({
        name: longName,
        email: 'gabriel@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      expect(longNameResult.success).toBe(false);
      if (!longNameResult.success) {
        expect(longNameResult.error.format().name?._errors).toContain('O nome de usuário não pode exceder 60 caracteres.');
      }
    });

    it('should reject passwords failing complexity rules', () => {
      // Missing uppercase, number, special char
      const result = registerSchema.safeParse({
        name: 'Gabriel',
        email: 'gabriel@example.com',
        password: 'password',
        confirmPassword: 'password',
      });
      expect(result.success).toBe(false);
    });

    it('should reject when passwords do not match', () => {
      const result = registerSchema.safeParse({
        name: 'Gabriel',
        email: 'gabriel@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('profileSchema', () => {
    it('should validate profile updates correctly', () => {
      const result = profileSchema.safeParse({
        name: 'Gabriel Prado Updated',
        email: 'gabriel.updated@example.com',
        avatarUrl: 'https://example.com/avatar.jpg',
      });
      expect(result.success).toBe(true);
    });

    it('should validate profile updates with empty avatarUrl', () => {
      const result = profileSchema.safeParse({
        name: 'Gabriel Prado Updated',
        email: 'gabriel.updated@example.com',
        avatarUrl: '',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid emails or too long names', () => {
      const result = profileSchema.safeParse({
        name: 'a'.repeat(61),
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('should validate strong password changes', () => {
      const result = passwordSchema.safeParse({
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      });
      expect(result.success).toBe(true);
    });

    it('should reject mismatched confirmation password', () => {
      const result = passwordSchema.safeParse({
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'WrongConfirmation123!',
      });
      expect(result.success).toBe(false);
    });
  });
});