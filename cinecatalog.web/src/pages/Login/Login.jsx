import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/ui';
import styles from './Login.module.css';

// Schema de validação Zod para o formulário de login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório.')
    .email('Formato de e-mail inválido.'),
  password: z
    .string()
    .min(1, 'A senha é obrigatória.'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // Determina a rota de redirecionamento após o login (ex: favoritos se tentou acessar)
  const from = location.state?.from?.pathname || '/catalogo';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setApiError('');
    setLoading(true);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error(error);
      setApiError(error.message || 'Falha ao autenticar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`page-fade-in ${styles.container}`}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>BEM-VINDO</h1>
        <p className={styles.subtitle}>Acesse sua conta para ver seus filmes preferidos</p>

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
            placeholder="Digite sua senha"
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

          <Button
            type="submit"
            variant="primary"
            className={styles.submitBtn}
            isLoading={loading}
            style={{ width: '100%' }}
          >
            Entrar
          </Button>
        </form>

        <div className={styles.footer}>
          Não possui uma conta?
          <Link to="/cadastro" className={styles.registerLink}>
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
