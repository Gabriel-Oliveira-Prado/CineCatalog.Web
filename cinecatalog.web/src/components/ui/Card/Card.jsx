import React from 'react';
import styles from './Card.module.css';

const Card = ({
  children,
  as: Component = 'div',
  hoverable = false,
  padding = 'md',
  className = '',
  ...props
}) => {
  return (
    <Component
      className={`${styles.card} ${hoverable ? styles.hoverable : ''} ${styles[`padding-${padding}`]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;