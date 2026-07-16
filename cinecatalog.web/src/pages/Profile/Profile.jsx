import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { User, Mail, Calendar, Save, KeyRound, Camera } from 'lucide-react';
import Swal from 'sweetalert2';
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
  avatarUrl: z
    .string()
    .trim()
    .url('Informe uma URL de imagem válida.')
    .optional()
    .or(z.literal('')),
});

// Schema de validação Zod para alteração de senha
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe sua senha atual.'),
    newPassword: z
      .string()
      .min(6, 'A nova senha deve ter pelo menos 6 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

const Profile = () => {
  const { user, updateProfileState } = useAuth();
  const [apiError, setApiError] = useState('');
  const [avatarImgError, setAvatarImgError] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      avatarUrl: user?.avatarUrl || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm({ resolver: zodResolver(passwordSchema) });

  const avatarUrlPreview = watch('avatarUrl');
  
  const handleAvatarClick = () => {
    Swal.fire({
      title: 'Alterar foto de perfil',
      input: 'url',
      inputLabel: 'Insira a URL da sua nova foto de perfil',
      inputValue: watch('avatarUrl') || '',
      placeholder: 'https://exemplo.com/foto.jpg',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary-color)',
      cancelButtonColor: 'var(--color-error)',
      confirmButtonText: 'Salvar',
      cancelButtonText: 'Cancelar',
      background: 'var(--surface-color)',
      color: 'var(--text-main)',
      inputValidator: (value) => {
        if (value && !value.startsWith('http')) {
          return 'Insira uma URL válida!';
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const newUrl = result.value || '';
        setValue('avatarUrl', newUrl);
        updateProfileMutation.mutate({
          name: watch('name'),
          email: watch('email'),
          avatarUrl: newUrl || null,
        });
      }
    });
  };

  useEffect(() => {
    setAvatarImgError(false);
  }, [avatarUrlPreview]);

  // Mantém o formulário sincronizado se o usuário carregar de forma assíncrona
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || '',
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

  // Mutation para alterar a senha
  // ATENÇÃO: depende do endpoint PUT/POST /api/Auth/change-password na API
  // (ainda não existe no contrato atual — ver observação enviada no chat)
  const changePasswordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/api/Auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Senha alterada com sucesso!');
      resetPasswordForm();
    },
    onError: (err) => {
      toast.error(err.message || 'Erro ao alterar a senha.');
    },
  });

  const onSubmit = (data) => {
    updateProfileMutation.mutate({
      ...data,
      avatarUrl: data.avatarUrl || null,
    });
  };

  const onPasswordSubmit = (data) => {
    changePasswordMutation.mutate(data);
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
          <div className={styles.avatarContainer} onClick={handleAvatarClick} title="Clique para alterar a foto de perfil">
            <div className={styles.avatar}>
              {avatarUrlPreview && !avatarImgError ? (
                <img
                  src={avatarUrlPreview}
                  alt={`Foto de perfil de ${user?.name || 'usuário'}`}
                  className={styles.avatarImg}
                  onError={() => setAvatarImgError(true)}
                />
              ) : (
                getInitials(user?.name)
              )}
              <div className={styles.avatarOverlay}>
                <Camera size={18} />
                <span>Alterar</span>
              </div>
            </div>
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
                isLoading={updateProfileMutation.isPending}
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Card de Alteração de Senha */}
      <div className={styles.passwordCard}>
        <h3 className={styles.formTitle}>Alterar Senha</h3>
        <p className={styles.passwordHint}>
          Escolha uma senha forte que você ainda não usou em outros serviços.
        </p>

        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className={styles.form} noValidate>
          <Input
            label="Senha atual"
            type="password"
            placeholder="Digite sua senha atual"
            leftIcon={<KeyRound size={18} />}
            error={passwordErrors.currentPassword?.message}
            {...registerPassword('currentPassword')}
          />

          <div className={styles.passwordRow}>
            <Input
              label="Nova senha"
              type="password"
              placeholder="Mínimo de 6 caracteres"
              leftIcon={<KeyRound size={18} />}
              error={passwordErrors.newPassword?.message}
              {...registerPassword('newPassword')}
            />

            <Input
              label="Confirmar nova senha"
              type="password"
              placeholder="Repita a nova senha"
              leftIcon={<KeyRound size={18} />}
              error={passwordErrors.confirmPassword?.message}
              {...registerPassword('confirmPassword')}
            />
          </div>

          <div className={styles.actions}>
            <Button
              type="submit"
              variant="secondary"
              leftIcon={<KeyRound size={18} />}
              isLoading={changePasswordMutation.isPending}
            >
              Alterar Senha
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
