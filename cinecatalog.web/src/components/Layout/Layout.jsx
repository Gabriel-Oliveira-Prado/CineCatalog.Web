import React, { Suspense } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Film, Heart, User, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../ui';
import styles from './Layout.module.css';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Extrai o primeiro nome para exibir na nav bar
  const getFirstName = (fullName) => {
    if (!fullName) return '';
    return fullName.split(' ')[0];
  };

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={`container ${styles.headerContent}`}>
          <Link to="/" className={styles.logo}>
            CINE<span>CATALOG</span>
          </Link>
          
          <nav className={styles.nav}>
            <Link 
              to="/catalogo" 
              className={`${styles.navLink} ${isActive('/catalogo') ? styles.active : ''}`}
            >
              <Film size={18} />
              <span>Catálogo</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link 
                  to="/favoritos" 
                  className={`${styles.navLink} ${isActive('/favoritos') ? styles.active : ''}`}
                >
                  <Heart size={18} />
                  <span>Favoritos</span>
                </Link>
                <Link 
                  to="/perfil" 
                  className={`${styles.navLink} ${isActive('/perfil') ? styles.active : ''}`}
                >
                  <User size={18} />
                  <span>{getFirstName(user?.name) || 'Perfil'}</span>
                </Link>
                <button onClick={handleLogout} className={styles.logoutBtn} aria-label="Sair da conta">
                  <LogOut size={18} />
                  <span>Sair</span>
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className={`${styles.loginBtn} ${isActive('/login') ? styles.active : ''}`}
              >
                <LogIn size={18} />
                <span>Entrar</span>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Elemento de Assinatura - Perfuração de Filme no topo da página principal */}
      <div className="sprocket-divider">
        <div className="sprocket-holes">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="sprocket-hole"></div>
          ))}
        </div>
      </div>

      <main className={styles.main}>
        <div className="container">
          <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <Spinner size="lg" color="primary" />
            </div>
          }>
            <Outlet />
          </Suspense>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className="sprocket-divider" style={{ marginBottom: '20px' }}>
          <div className="sprocket-holes">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="sprocket-hole"></div>
            ))}
          </div>
        </div>
        <div className={`container ${styles.footerContent}`}>
          <span className={styles.logo}>
            CINE<span>CATALOG</span>
          </span>
          <p className={styles.copy}>
            &copy; {new Date().getFullYear()} CineCatalog. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
