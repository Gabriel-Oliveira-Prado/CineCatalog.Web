import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { User, Mail, Calendar, Save, KeyRound, Camera, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Skeleton } from '../../components/ui';
import styles from './Profile.module.css';

// Schema de validação Zod para atualização cadastral
export const profileSchema = z.object({
  name: z
    .string()
    .min(1, 'O nome de usuário é obrigatório.')
    .min(3, 'O nome de usuário deve ter pelo menos 3 caracteres.')
    .max(60, 'O nome de usuário não pode exceder 60 caracteres.'),
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório.')
    .email('Formato de e-mail inválido.'),
  avatarUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
});

// Schema de validação Zod para alteração de senha (espelhando as regras de validação estritas da API)
export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe sua senha atual.'),
    newPassword: z
      .string()
      .min(1, 'A nova senha é obrigatória.')
      .min(8, 'A nova senha deve conter no mínimo 8 caracteres.')
      .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula.')
      .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula.')
      .regex(/[0-9]/, 'A senha deve conter pelo menos um número.')
      .regex(/[^a-zA-Z0-9]/, 'A senha deve conter pelo menos um caractere especial.'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

const Profile = () => {
  const { user, loading, updateProfileState, logout } = useAuth();
  const navigate = useNavigate();
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
  
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (max 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Por favor, selecione uma imagem de até 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result;
      setValue('avatarUrl', base64String);
      updateProfileMutation.mutate({
        name: watch('name'),
        email: watch('email'),
        avatarUrl: base64String || null,
      });
    };
    reader.onerror = () => {
      toast.error('Erro ao ler o arquivo.');
    };
    reader.readAsDataURL(file);
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
  const changePasswordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/api/Auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return response.data;
    },
    onSuccess: () => {
      Swal.fire({
        title: 'Senha alterada!',
        text: 'Sua senha foi alterada com sucesso.',
        icon: 'success',
        confirmButtonColor: 'var(--primary-color)',
        background: 'var(--surface-color)',
        color: 'var(--text-main)',
      });
      resetPasswordForm();
    },
    onError: (err) => {
      toast.error(err.message || 'Erro ao alterar a senha.');
    },
  });

  // Mutation para excluir a conta
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/api/Auth/me');
      return response.data;
    },
    onSuccess: () => {
      logout();
      navigate('/');
      toast.success('Sua conta foi excluída permanentemente.');
    },
    onError: (err) => {
      toast.error(err.message || 'Erro ao excluir a conta.');
    },
  });

  const handleDeleteAccount = () => {
    Swal.fire({
      title: 'Deseja excluir sua conta?',
      text: 'Esta ação é definitiva e não poderá ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-error)',
      cancelButtonColor: 'var(--text-muted)',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
      background: 'var(--surface-color)',
      color: 'var(--text-main)',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Tem certeza absoluta?',
          text: 'Todos os seus comentários e favoritos salvos serão apagados para sempre.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: 'var(--color-error)',
          cancelButtonColor: 'var(--text-muted)',
          confirmButtonText: 'Sim, excluir conta permanentemente!',
          cancelButtonText: 'Cancelar',
          background: 'var(--surface-color)',
          color: 'var(--text-main)',
        }).then((secondResult) => {
          if (secondResult.isConfirmed) {
            deleteAccountMutation.mutate();
          }
        });
      }
    });
  };

  const onSubmit = (data) => {
    updateProfileMutation.mutate({
      ...data,
      avatarUrl: data.avatarUrl || null,
    });
  };

  const onPasswordSubmit = (data) => {
    Swal.fire({
      title: 'Confirmar alteração de senha?',
      text: 'Tem certeza de que deseja alterar sua senha atual?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary-color)',
      cancelButtonColor: 'var(--color-error)',
      confirmButtonText: 'Sim, alterar!',
      cancelButtonText: 'Cancelar',
      background: 'var(--surface-color)',
      color: 'var(--text-main)',
    }).then((result) => {
      if (result.isConfirmed) {
        changePasswordMutation.mutate(data);
      }
    });
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

  if (loading || !user) {
    return (
      <div className={`page-fade-in ${styles.container}`}>
        <header className={styles.headerSection}>
          <Skeleton variant="title" width="300px" />
          <Skeleton variant="text" width="500px" />
        </header>

        <div className={styles.profileGrid}>
          <div className={styles.sidebarCard}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <Skeleton variant="circle" width="90px" height="90px" />
            </div>
            <Skeleton variant="text" width="60%" style={{ margin: '0 auto 8px', display: 'block' }} />
            <Skeleton variant="text" width="80%" style={{ margin: '0 auto 20px', display: 'block' }} />
            <div className={styles.divider}></div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Skeleton variant="text" width="40%" style={{ marginBottom: '8px' }} />
              <Skeleton variant="text" width="60%" />
            </div>
          </div>

          <div className={styles.formCard}>
            <Skeleton variant="title" width="200px" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
              <div>
                <Skeleton variant="text" width="100px" style={{ marginBottom: '8px' }} />
                <Skeleton variant="rect" height="48px" />
              </div>
              <div>
                <Skeleton variant="text" width="100px" style={{ marginBottom: '8px' }} />
                <Skeleton variant="rect" height="48px" />
              </div>
              <Skeleton variant="rect" width="150px" height="40px" style={{ marginTop: '10px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className={styles.avatar}>
              <img
                src={avatarUrlPreview && !avatarImgError ? avatarUrlPreview : '/default-avatar.png'}
                alt={`Foto de perfil de ${user?.name || 'usuário'}`}
                className={styles.avatarImg}
                onError={() => setAvatarImgError(true)}
              />
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

      {/* Zona de Perigo / Excluir Conta */}
      <div className={styles.deleteCard}>
        <h3 className={styles.dangerTitle}>Zona de Perigo</h3>
        <p className={styles.dangerText}>
          A exclusão de conta é permanente. Todos os seus dados, incluindo reviews e favoritos, serão removidos imediatamente de nossos servidores.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Button
            type="button"
            variant="outline"
            style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
            onClick={handleDeleteAccount}
            isLoading={deleteAccountMutation.isPending}
            leftIcon={<Trash2 size={18} />}
          >
            Excluir Minha Conta
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
