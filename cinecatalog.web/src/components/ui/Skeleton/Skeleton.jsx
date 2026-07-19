import React from 'react';
import styles from './Skeleton.module.css';

const Skeleton = ({
  variant = 'text',
  width,
  height,
  className = '',
  ...props
}) => {
  const inlineStyles = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      className={`${styles.skeleton} ${styles[variant]} ${className}`}
      style={inlineStyles}
      {...props}
    />
  );
};

export default Skeleton;