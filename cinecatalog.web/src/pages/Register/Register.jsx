import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/ui';
import styles from './Register.module.css';

// Schema de validação Zod espelhando as regras de validação estritas da API do CineCatalog
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'O nome de usuário é obrigatório.')
    .min(3, 'O nome de usuário deve ter pelo menos 3 caracteres.')
    .max(60, 'O nome de usuário não pode exceder 60 caracteres.'),
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório.')
    .email('Formato de e-mail inválido.'),
  password: z
    .string()
    .min(1, 'A senha é obrigatória.')
    .min(8, 'A senha deve conter no mínimo 8 caracteres.')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula.')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula.')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número.')
    .regex(/[^a-zA-Z0-9]/, 'A senha deve conter pelo menos um caractere especial.'),
  confirmPassword: z
    .string()
    .min(1, 'A confirmação de senha é obrigatória.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem.',
  path: ['confirmPassword'],
});

const Register = () => {
  const { register: registerApi } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setApiError('');
    setLoading(true);
    try {
      await registerApi(data.name, data.email, data.password);
      navigate('/login');
    } catch (error) {
      console.error(error);
      setApiError(error.message || 'Falha ao realizar o cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`page-fade-in ${styles.container}`}>
      <div className={styles.registerCard}>
        <h1 className={styles.title}>CADASTRE-SE</h1>
        <p className={styles.subtitle}>Crie sua conta para começar a favoritar e avaliar filmes</p>

        {apiError && (
          <div 
            style={{
              padding: '12px',
              backgroundColor: 'rgba(229, 72, 77, 0.1)',
              border: '1px solid rgba(229, 72, 77, 0.2)',
              borderRadius: 'var(--border-radius-md)',
              color: 'var(--color-error)',
              fontSize: '0.875rem',
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: 500
            }}
          >
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          <Input
            label="Nome de Usuário"
            placeholder="Digite seu nome de usuário"
            leftIcon={<User size={18} />}
            error={errors.name?.message}
            maxLength={60}
            {...register('name')}
          />

          <Input
            label="E-mail"
            type="email"
            placeholder="Digite seu e-mail"
            leftIcon={<Mail size={18} />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            placeholder="No mínimo 8 caracteres com Maiúsculas/Especiais"
            leftIcon={<Lock size={18} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', padding: 0 }}
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Confirmar Senha"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirme sua senha"
            leftIcon={<Lock size={18} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', padding: 0 }}
                aria-label={showConfirmPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            variant="primary"
            className={styles.submitBtn}
            isLoading={loading}
            style={{ width: '100%' }}
          >
            Cadastrar
          </Button>
        </form>

        <div className={styles.footer}>
          Já possui uma conta?
          <Link to="/login" className={styles.loginLink}>
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
