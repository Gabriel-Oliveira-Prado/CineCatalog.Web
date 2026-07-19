import React from 'react';
import { Skeleton, Card } from '../ui';
import styles from './MovieCard.module.css';

const MovieCardSkeleton = () => {
  return (
    <Card padding="none" className={styles.card} style={{ pointerEvents: 'none' }}>
      <div className={styles.posterWrapper}>
        <Skeleton variant="rect" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
      </div>
      <div className={styles.content}>
        {/* Gêneros */}
        <div className={styles.genres}>
          <Skeleton variant="text" width="40px" height="12px" />
          <Skeleton variant="text" width="50px" height="12px" />
        </div>

        {/* Título */}
        <Skeleton variant="text" width="80%" height="16px" style={{ marginBottom: '8px', marginTop: '4px' }} />

        {/* Informações Auxiliares */}
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <Skeleton variant="text" width="80%" height="12px" />
          </div>
          <div className={styles.infoItem}>
            <Skeleton variant="text" width="60%" height="12px" />
          </div>
          <div className={styles.infoItem} style={{ gridColumn: 'span 2' }}>
            <Skeleton variant="text" width="90%" height="12px" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MovieCardSkeleton;