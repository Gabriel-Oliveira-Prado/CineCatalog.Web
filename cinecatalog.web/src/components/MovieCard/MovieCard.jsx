import React, { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { Star, Film, Clock, Calendar, User } from 'lucide-react';
import styles from './MovieCard.module.css';

const MovieCard = ({ movie }) => {
  const [imageError, setImageError] = useState(false);

  const formattedRating = movie.averageRating > 0 
    ? movie.averageRating.toFixed(1) 
    : 'N/A';

  const genresToShow = movie.genres || [];

  return (
    <Link to={`/filme/${movie.id}`} className={styles.card}>
      <div className={styles.posterWrapper}>
        {/* Badge de Nota */}
        <div className={styles.ratingBadge}>
          <Star size={14} fill={movie.averageRating > 0 ? 'currentColor' : 'none'} />
          <span>{formattedRating}</span>
        </div>

        {movie.imageUrl && !imageError ? (
          <img
            src={movie.imageUrl}
            alt={`Pôster do filme ${movie.title}`}
            className={styles.poster}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className={styles.posterPlaceholder}>
            <Film size={48} className={styles.placeholderIcon} />
            <span className={styles.placeholderText}>{movie.title}</span>
          </div>
        )}
      </div>

      <div className={styles.content}>
        {/* Gêneros */}
        {genresToShow.length > 0 && (
          <div className={styles.genres}>
            {genresToShow.slice(0, 2).map((genre) => (
              <span key={genre.id} className={styles.genreTag}>
                {genre.name}
              </span>
            ))}
          </div>
        )}

        {/* Título */}
        <h3 className={styles.title} title={movie.title}>
          {movie.title}
        </h3>

        {/* Informações Auxiliares */}
        <div className={styles.infoGrid}>
          <div className={styles.infoItem} title={movie.director}>
            <User size={14} />
            <span>{movie.director || 'Desconhecido'}</span>
          </div>
          <div className={styles.infoItem}>
            <Calendar size={14} />
            <span>{movie.releaseYear}</span>
          </div>
          <div className={styles.infoItem} style={{ gridColumn: 'span 2' }}>
            <Clock size={14} />
            <span>{movie.durationMinutes} min</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default memo(MovieCard);

