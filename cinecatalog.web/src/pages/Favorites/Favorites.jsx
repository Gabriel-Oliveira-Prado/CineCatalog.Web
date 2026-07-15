import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Heart, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { Card, Button, Skeleton } from '../../components/ui';
import MovieCard from '../../components/MovieCard/MovieCard';
import styles from './Favorites.module.css';

const Favorites = () => {
  // Query para buscar a lista de favoritos do usuário logado
  const { data: favorites = [], isLoading, isError, error } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await api.get('/api/Favorites');
      return response.data || [];
    },
  });

  return (
    <div className={`page-fade-in ${styles.container}`}>
      <header className={styles.headerSection}>
        <h1 className={styles.title}>Seus Favoritos</h1>
        <p className={styles.subtitle}>Acesso rápido a todos os filmes que você marcou com um coração</p>
      </header>

      {isLoading ? (
        <div className={styles.grid}>
          {[...Array(4)].map((_, i) => (
            <Card key={i} padding="none" style={{ borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
              <Skeleton variant="rect" height="330px" />
              <div style={{ padding: '16px' }}>
                <Skeleton variant="text" width="60%" height="16px" style={{ marginBottom: '12px' }} />
                <Skeleton variant="text" width="90%" height="24px" style={{ marginBottom: '16px' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Skeleton variant="text" width="45%" height="14px" />
                  <Skeleton variant="text" width="45%" height="14px" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className={styles.emptyContainer}>
          <AlertCircle size={48} style={{ color: 'var(--color-error)', marginBottom: '20px' }} />
          <h3 className={styles.emptyTitle}>Erro ao carregar favoritos</h3>
          <p className={styles.emptyText}>{error?.message || 'Não foi possível buscar sua lista de favoritos.'}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>Tentar Novamente</Button>
        </div>
      ) : favorites.length === 0 ? (
        <div className={styles.emptyContainer}>
          <Heart size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>Nenhum filme favoritado</h3>
          <p className={styles.emptyText}>
            Sua lista está vazia por enquanto. Explore o catálogo e clique em "Adicionar aos Favoritos" nas produções que você mais gosta.
          </p>
          <Link to="/catalogo">
            <Button variant="primary">Explorar Filmes</Button>
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {favorites.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
