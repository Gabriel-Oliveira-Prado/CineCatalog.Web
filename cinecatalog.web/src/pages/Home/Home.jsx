import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';

const HomePlaceholder = () => {
  return (
    <div className="page-fade-in" style={{ padding: '60px 24px', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '24px' }}>CineCatalog</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '600px', marginInline: 'auto' }}>
        Descubra, avalie e favorite seus filmes preferidos no catálogo mais elegante e completo para os amantes do cinema.
      </p>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <Link to="/catalogo">
          <Button variant="primary">Explorar Catálogo</Button>
        </Link>
        <Link to="/login">
          <Button variant="outline">Entrar na Conta</Button>
        </Link>
      </div>
    </div>
  );
};

export default HomePlaceholder;
