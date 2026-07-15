import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { User, Mail, Calendar, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/ui';
import styles from './Profile.module.css';

// Schema de validação Zod para atualização cadastral
const profileSchema = z.object({
  name: z
    .string()
    .min(1, 'O nome é obrigatório.')
    .min(3, 'O nome deve ter pelo menos 3 caracteres.')
    .max(100, 'O nome não pode exceder 100 caracteres.'),
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório.')
    .email('Formato de e-mail inválido.'),
});

const Profile = () => {
  const { user, updateProfileState } = useAuth();
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  // Mantém o formulário sincronizado se o usuário carregar de forma assíncrona
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, reset]);

  // Mutation para atualizar o perfil do usuário
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData) => {
      const response = await api.put('/api/Auth/me', updatedData);
      return response.data;
    },
    onSuccess: (data) => {
      updateProfileState(data); // Atualiza dados no AuthContext
      toast.success('Perfil atualizado com sucesso!');
      setApiError('');
    },
    onError: (err) => {
      setApiError(err.message || 'Erro ao salvar alterações no perfil.');
    },
  });

  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const parts = fullName.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Desconhecida';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className={`page-fade-in ${styles.container}`}>
      <header className={styles.headerSection}>
        <h1 className={styles.title}>Configurações de Perfil</h1>
        <p className={styles.subtitle}>Gerencie suas informações pessoais cadastrais no CineCatalog</p>
      </header>

      <div className={styles.profileGrid}>
        {/* Sidebar com Avatar e Data de Ingresso */}
        <div className={styles.sidebarCard}>
          <div className={styles.avatar}>
            {getInitials(user?.name)}
          </div>
          <h3 className={styles.userName}>{user?.name || 'Carregando...'}</h3>
          <p className={styles.userEmail}>{user?.email || ''}</p>

          <div className={styles.divider}></div>

          <div className={styles.metaItem}>
            <Calendar size={20} style={{ color: 'var(--primary-color)', marginBottom: '8px' }} />
            <span className={styles.metaLabel}>Membro desde</span>
            <span className={styles.metaValue}>{formatDate(user?.createdAt)}</span>
          </div>
        </div>

        {/* Formulário de Configuração */}
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>Informações de Cadastro</h3>

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
              label="Nome Completo"
              placeholder="Digite seu nome"
              leftIcon={<User size={18} />}
              error={errors.name?.message}
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

            <div className={styles.actions}>
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Save size={18} />}
                isLoading={updateProfileMutation.isLoading}
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
