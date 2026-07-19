import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import PrivateRoute from './routes/PrivateRoute';
import { Spinner } from './components/ui';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';

// Lazy loading das páginas para reduzir o bundle inicial do JS
const Home = lazy(() => import('./pages/Home/Home'));
const Login = lazy(() => import('./pages/Login/Login'));
const Register = lazy(() => import('./pages/Register/Register'));
const Catalog = lazy(() => import('./pages/Catalog/Catalog'));
const MovieDetails = lazy(() => import('./pages/MovieDetails/MovieDetails'));
const Favorites = lazy(() => import('./pages/Favorites/Favorites'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Rotas Públicas */}
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="cadastro" element={<Register />} />
          <Route path="catalogo" element={<Catalog />} />
          <Route path="filme/:id/:slug?" element={<MovieDetails />} />
          
          {/* Rotas Privadas (Protegidas) */}
          <Route 
            path="favoritos" 
            element={
              <PrivateRoute>
                <Favorites />
              </PrivateRoute>
            } 
          />
          <Route 
            path="perfil" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
          
          {/* Rota 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
