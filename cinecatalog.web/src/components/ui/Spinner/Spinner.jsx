import React from 'react';
import styles from './Spinner.module.css';

const Spinner = ({ size = 'md', color = 'primary', className = '' }) => {
  return (
    <div 
      className={`${styles.spinner} ${styles[size]} ${styles[color]} ${className}`}
      role="status"
      aria-label="Carregando..."
    >
      <div className={styles.inner}></div>
    </div>
  );
};

export default Spinner;