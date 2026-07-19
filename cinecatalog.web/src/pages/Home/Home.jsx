import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ChevronLeft, ChevronRight, Film } from 'lucide-react';
import api from '../../services/api';
import { Button, Card, Skeleton } from '../../components/ui';
import MovieCard from '../../components/MovieCard/MovieCard';
import { useAuth } from '../../context/AuthContext';
import styles from './Home.module.css';
import { slugify } from '../../utils/slugify';
import cardStyles from '../../components/MovieCard/MovieCard.module.css';

const HIGHLIGHTS_PAGE_SIZE = 12;
const FEATURED_MOVIES_COUNT = 5;

const Home = () => {
  const { isAuthenticated } = useAuth();

  // Busca os filmes populares em alta (trending) do TMDb para a seção Hero/Destaque
  const { data: trendingData, isLoading: isTrendingLoading } = useQuery({
    queryKey: ['movies', 'home-trending'],
    queryFn: async () => {
      const response = await api.get('/api/Movies/trending');
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutos de cache
  });

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
  const featuredMovies = trendingData || [];
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const activeSlide = featuredMovies.length ? activeSlideIndex % featuredMovies.length : 0;
  const featuredMovie = featuredMovies[activeSlide];

  useEffect(() => {
    if (featuredMovies.length < 2) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveSlideIndex((currentSlide) => (currentSlide + 1) % featuredMovies.length);
    }, 7000);

    return () => window.clearInterval(intervalId);
  }, [featuredMovies.length]);

  const selectPreviousSlide = () => {
    setActiveSlideIndex((currentSlide) => (
      (currentSlide + featuredMovies.length - 1) % featuredMovies.length
    ));
  };

  const selectNextSlide = () => {
    setActiveSlideIndex((currentSlide) => (currentSlide + 1) % featuredMovies.length);
  };

  return (
    <div className="page-fade-in" style={{ marginTop: '-40px', paddingTop: '0px' }}>
      <div className="sprocket-divider" style={{ marginBottom: '5px' }}>
        <div className="sprocket-holes">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="sprocket-hole"></div>
          ))}
        </div>
      </div>

      {isTrendingLoading ? (
        <section className={styles.featured} aria-label="Carregando destaques">
          <div className={styles.featuredCard}>
            <div className={styles.featuredContent}>
              <Skeleton variant="text" width="120px" height="14px" style={{ marginBottom: '12px' }} />
              <Skeleton variant="text" width="80%" height="32px" style={{ marginBottom: '16px' }} />
              <Skeleton variant="text" width="95%" height="16px" style={{ marginBottom: '8px' }} />
              <Skeleton variant="text" width="90%" height="16px" style={{ marginBottom: '8px' }} />
              <Skeleton variant="text" width="70%" height="16px" style={{ marginBottom: '24px' }} />
              <Skeleton variant="rect" width="150px" height="38px" style={{ borderRadius: 'var(--border-radius-md)' }} />
            </div>
          </div>
        </section>
      ) : featuredMovie ? (
        <section className={styles.featured} aria-label="Filmes em destaque">
          <article className={styles.featuredCard} aria-live="polite">
            {(featuredMovie.backdropUrl || featuredMovie.imageUrl) && (
              <img
                key={featuredMovie.id}
                src={featuredMovie.backdropUrl || featuredMovie.imageUrl}
                alt=""
                aria-hidden="true"
                className={styles.featuredBackground}
                loading="lazy"
                decoding="async"
              />
            )}
            <div className={styles.featuredOverlay} />

            <div className={styles.featuredContent}>
              <p className={styles.featuredMeta}>
                {featuredMovie.releaseYear || 'Ano não informado'}
                {featuredMovie.durationMinutes > 0 && ` · ${featuredMovie.durationMinutes} min`}
              </p>
              <h3 className={styles.featuredMovieTitle}>{featuredMovie.title}</h3>
              <p className={styles.featuredDescription}>
                {featuredMovie.description || 'Abra o filme para ver sinopse, avaliações e onde assistir.'}
              </p>
              <Link to={`/filme/${featuredMovie.id}/${slugify(featuredMovie.title)}`}>
                <Button variant="primary">Ver detalhes do filme</Button>
              </Link>
            </div>

            {featuredMovies.length > 1 && (
              <>
                <div className={styles.featuredControls}>
                  <button type="button" onClick={selectPreviousSlide} className={styles.carouselButton} aria-label="Filme anterior">
                    <ChevronLeft size={20} />
                  </button>
                  <button type="button" onClick={selectNextSlide} className={styles.carouselButton} aria-label="Próximo filme">
                    <ChevronRight size={20} />
                  </button>
                </div>
                <div className={styles.carouselDots} aria-label="Selecionar filme em destaque">
                  {featuredMovies.map((movie, index) => (
                    <button
                      key={movie.id}
                      type="button"
                      className={`${styles.carouselDot} ${index === activeSlide ? styles.carouselDotActive : ''}`}
                      onClick={() => setActiveSlideIndex(index)}
                      aria-label={`Mostrar ${movie.title}`}
                      aria-current={index === activeSlide ? 'true' : undefined}
                    />
                  ))}
                </div>
              </>
            )}
          </article>
        </section>
      ) : null}

      {/* Destaques / Lançamentos recentes */}
      <section className={styles.highlights}>
        <div className={styles.highlightsHeader}>
          <h2 className={styles.highlightsTitle}>Recém-chegados</h2>
          <Link to="/catalogo" className={styles.seeAllLink}>Ver catálogo completo</Link>
        </div>

        {isLoading ? (
          <div className={styles.grid}>
            {[...Array(HIGHLIGHTS_PAGE_SIZE)].map((_, i) => (
              <Card key={i} padding="none" style={{ borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className={cardStyles.posterWrapper}>
                  <Skeleton variant="rect" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
                </div>
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                    <Skeleton variant="text" width="40px" height="12px" />
                    <Skeleton variant="text" width="50px" height="12px" />
                  </div>
                  <Skeleton variant="text" width="80%" height="16px" style={{ marginBottom: '8px', marginTop: '4px' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.03)' }}>
                    <Skeleton variant="text" width="80%" height="12px" />
                    <Skeleton variant="text" width="60%" height="12px" />
                    <Skeleton variant="text" width="90%" height="12px" style={{ gridColumn: 'span 2' }} />
                  </div>
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
