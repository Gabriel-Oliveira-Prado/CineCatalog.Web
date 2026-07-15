import React from 'react';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';
import { Button } from '../../components/ui';
import styles from './NotFound.module.css';

const NotFound = () => {
  return (
    <div className={`page-fade-in ${styles.container}`}>
      <div className={styles.errorCode}>404</div>
      <h2 className={styles.title}>Cena Não Encontrada</h2>
      <p className={styles.text}>
        O rolo de filme que você está procurando sumiu da projeção ou a página foi movida para outra sala do cinema.
      </p>
      <Link to="/">
        <Button 
          variant="primary" 
          className={styles.homeBtn}
          leftIcon={<Film size={18} />}
        >
          Voltar para a Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
