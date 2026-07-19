import React, { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Search, SlidersHorizontal, Trash2, Film, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { Input, Button, Card, Skeleton, Spinner } from '../../components/ui';
import MovieCard from '../../components/MovieCard/MovieCard';
import MovieCardSkeleton from '../../components/MovieCard/MovieCardSkeleton';
import styles from './Catalog.module.css';

const Catalog = () => {
  // Estados de busca e paginação
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(24);
  const [showFilters, setShowFilters] = useState(false);

  // Estados de filtros
  const [genre, setGenre] = useState('');
  const [director, setDirector] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [minRating, setMinRating] = useState('');
  const [minDuration, setMinDuration] = useState('');
  const [sortBy, setSortBy] = useState('createdat');
  const [isDescending, setIsDescending] = useState(true);

  // Debounce para o input de busca (evita requests repetitivos)
  const debouncedSearch = useDebounce(searchInput, 500);

  // Reseta para a página 1 sempre que um filtro mudar
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, genre, director, releaseYear, minRating, minDuration, sortBy, isDescending]);

  // Query para buscar a lista de Gêneros (para o filtro dropdown)
  const { data: genresData } = useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const response = await api.get('/api/Genres');
      // Suporta tanto array puro (contrato do Swagger) quanto um possível wrapper { value: [...] }
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.value)) return data.value;
      if (Array.isArray(data?.items)) return data.items;
      return [];
    },
  });

  // Query para buscar a lista de Filmes com paginação e filtros
  const { data: moviesData, isLoading, isError, error, isFetching } = useQuery({
    queryKey: [
      'movies', 
      debouncedSearch, 
      genre, 
      director, 
      releaseYear, 
      minRating, 
      minDuration, 
      sortBy, 
      isDescending, 
      page, 
      pageSize
    ],
    queryFn: async () => {
      const params = {
        PageNumber: page,
        PageSize: pageSize,
        SortBy: sortBy,
        IsDescending: isDescending,
      };

      if (debouncedSearch) params.Search = debouncedSearch;
      if (genre) params.Genre = genre;
      if (director) params.Director = director;
      if (releaseYear) params.ReleaseYear = parseInt(releaseYear, 10);
      if (minRating) params.MinRating = parseFloat(minRating);
      if (minDuration) params.MinDuration = parseInt(minDuration, 10);

      const response = await api.get('/api/Movies', { params });
      return response.data;
    },
    placeholderData: keepPreviousData,
  });

  const clearFilters = () => {
    setSearchInput('');
    setGenre('');
    setDirector('');
    setReleaseYear('');
    setMinRating('');
    setMinDuration('');
    setSortBy('createdat');
    setIsDescending(true);
  };

  const hasActiveFilters = 
    searchInput || genre || director || releaseYear || minRating || minDuration;

  // Cálculos de paginação
  const movies = moviesData?.items || [];
  const totalPages = moviesData?.totalPages || 1;
  const totalCount = moviesData?.totalCount || 0;

  return (
    <div className={`page-fade-in ${styles.container}`}>
      <header className={styles.headerSection}>
        <h1 className={styles.title}>Catálogo de Filmes</h1>
        <p className={styles.subtitle}>Encontre produções clássicas e grandes novidades da sétima arte</p>
      </header>

      {/* Barra de Controles (Busca + Filtro Expand) */}
      <div className={styles.controlsRow}>
        <div className={styles.searchWrapper}>
          <Input
            placeholder="Buscar por título, diretor, palavra-chave..."
            leftIcon={<Search size={18} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`${styles.toggleFiltersBtn} ${showFilters ? styles.active : ''}`}
          aria-expanded={showFilters}
        >
          <SlidersHorizontal size={18} />
          <span>Filtros {hasActiveFilters ? '(Ativos)' : ''}</span>
        </button>
      </div>

      {/* Painel de Filtros Avançado */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Gênero</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className={styles.selectInput}
            >
              <option value="">Todos</option>
              {genresData?.map((g) => (
                <option key={g.id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Diretor</label>
            <Input
              placeholder="Ex: Christopher Nolan"
              value={director}
              onChange={(e) => setDirector(e.target.value)}
              style={{ height: '48px' }}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Ano</label>
            <Input
              type="number"
              placeholder="Ex: 2026"
              value={releaseYear}
              onChange={(e) => setReleaseYear(e.target.value)}
              style={{ height: '48px' }}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Nota Mínima</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className={styles.selectInput}
            >
              <option value="">Qualquer nota</option>
              <option value="4">4.0+ Estrelas</option>
              <option value="3">3.0+ Estrelas</option>
              <option value="2">2.0+ Estrelas</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Duração Mínima (min)</label>
            <Input
              type="number"
              placeholder="Ex: 90"
              value={minDuration}
              onChange={(e) => setMinDuration(e.target.value)}
              style={{ height: '48px' }}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.selectInput}
            >
              <option value="createdat">Adicionado recente</option>
              <option value="title">Título</option>
              <option value="releaseyear">Ano de lançamento</option>
              <option value="durationminutes">Duração</option>
              <option value="averagerating">Nota média</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Ordem</label>
            <select
              value={isDescending ? 'true' : 'false'}
              onChange={(e) => setIsDescending(e.target.value === 'true')}
              className={styles.selectInput}
            >
              <option value="true">Decrescente</option>
              <option value="false">Crescente</option>
            </select>
          </div>

          {hasActiveFilters && (
            <div className={styles.clearFiltersRow}>
              <Button
                variant="secondary"
                onClick={clearFilters}
                leftIcon={<Trash2 size={16} />}
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Grid de Exibição ou Estados */}
      {isLoading ? (
        <div className={styles.grid}>
          {[...Array(pageSize)].map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className={styles.statusContainer}>
          <AlertCircle size={48} className={styles.statusIcon} style={{ color: 'var(--color-error)' }} />
          <h3 className={styles.statusTitle}>Falha na Projeção</h3>
          <p className={styles.statusText}>{error?.message || 'Não foi possível carregar a lista de filmes.'}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>Tentar Novamente</Button>
        </div>
      ) : movies.length === 0 ? (
        <div className={styles.statusContainer}>
          <Film size={48} className={styles.statusIcon} />
          <h3 className={styles.statusTitle}>Nenhum filme encontrado</h3>
          <p className={styles.statusText}>Não encontramos produções com os filtros informados. Experimente ajustar sua busca.</p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>Limpar Filtros</Button>
          )}
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                aria-label="Página anterior"
              >
                &laquo;
              </button>
              
              <span className={styles.pageIndicator}>
                Página {page} de {totalPages} ({totalCount} filmes)
              </span>

              <button
                className={styles.pageBtn}
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                aria-label="Próxima página"
              >
                &raquo;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Catalog;
