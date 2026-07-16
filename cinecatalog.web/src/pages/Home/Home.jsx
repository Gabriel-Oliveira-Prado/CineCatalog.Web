import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Film } from 'lucide-react';
import api from '../../services/api';
import { Button, Card, Skeleton } from '../../components/ui';
import MovieCard from '../../components/MovieCard/MovieCard';
import styles from './Home.module.css';

const HIGHLIGHTS_PAGE_SIZE = 12;

const Home = () => {
  // Busca os filmes mais recentes cadastrados no catálogo (sem repetição, direto da API paginada)
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['movies', 'home-highlights'],
    queryFn: async () => {
      const response = await api.get('/api/Movies', {
        params: {
          PageNumber: 1,
          PageSize: HIGHLIGHTS_PAGE_SIZE,
          SortBy: 'createdat',
          IsDescending: true,
        },
      });
      return response.data;
    },
  });

  const movies = data?.items || [];

  return (
    <div className="page-fade-in">
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Cine<span>Catalog</span>
        </h1>
        <p className={styles.heroText}>
          Descubra, avalie e favorite seus filmes preferidos no catálogo mais elegante e completo para os amantes do cinema.
        </p>
        <div className={styles.heroActions}>
          <Link to="/catalogo">
            <Button variant="primary">Explorar Catálogo</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline">Entrar na Conta</Button>
          </Link>
        </div>
      </section>

      <div className="sprocket-divider">
        <div className="sprocket-holes">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="sprocket-hole"></div>
          ))}
        </div>
      </div>

      {/* Destaques / Lançamentos recentes */}
      <section className={styles.highlights}>
        <div className={styles.highlightsHeader}>
          <h2 className={styles.highlightsTitle}>Recém-chegados</h2>
          <Link to="/catalogo" className={styles.seeAllLink}>Ver catálogo completo</Link>
        </div>

        {isLoading ? (
          <div className={styles.grid}>
            {[...Array(HIGHLIGHTS_PAGE_SIZE)].map((_, i) => (
              <Card key={i} padding="none" style={{ borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
                <Skeleton variant="rect" height="330px" />
                <div style={{ padding: '16px' }}>
                  <Skeleton variant="text" width="60%" height="16px" style={{ marginBottom: '12px' }} />
                  <Skeleton variant="text" width="90%" height="24px" />
                </div>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <div className={styles.statusContainer}>
            <AlertCircle size={40} style={{ color: 'var(--color-error)' }} />
            <p className={styles.statusText}>{error?.message || 'Não foi possível carregar os filmes em destaque.'}</p>
          </div>
        ) : movies.length === 0 ? (
          <div className={styles.statusContainer}>
            <Film size={40} style={{ color: 'var(--text-muted)' }} />
            <p className={styles.statusText}>Nenhum filme cadastrado no catálogo ainda.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
