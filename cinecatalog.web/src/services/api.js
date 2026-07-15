import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:5298';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor de Requisição - Injeta o JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@CineCatalog:accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Resposta - Refresh Token e ProblemDetails
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 e não for uma tentativa de login/registro/refresh
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/Auth/login') && !originalRequest.url.includes('/Auth/register')) {
      if (isRefreshing) {
        // Adiciona à fila de espera
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const accessToken = localStorage.getItem('@CineCatalog:accessToken');
      const refreshToken = localStorage.getItem('@CineCatalog:refreshToken');

      if (accessToken && refreshToken) {
        try {
          // Chamada direta para o refresh para evitar loops
          const response = await axios.post(`${API_URL}/api/Auth/refresh`, {
            accessToken,
            refreshToken,
          });

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

          localStorage.setItem('@CineCatalog:accessToken', newAccessToken);
          localStorage.setItem('@CineCatalog:refreshToken', newRefreshToken);

          api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          isRefreshing = false;

          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;

          // Limpa tokens se falhar o refresh
          localStorage.removeItem('@CineCatalog:accessToken');
          localStorage.removeItem('@CineCatalog:refreshToken');
          
          // Força redirecionamento ou evento de logout
          window.dispatchEvent(new Event('auth:logout'));
          
          return Promise.reject(parseError(refreshError));
        }
      } else {
        window.dispatchEvent(new Event('auth:logout'));
      }
    }

    return Promise.reject(parseError(error));
  }
);

// Função para mapear o erro para o formato ProblemDetails ou amigável
function parseError(error) {
  const customError = {
    message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
    status: error.response?.status || 500,
    errors: null,
    title: 'Erro no servidor',
  };

  if (error.response?.data) {
    const data = error.response.data;

    // Se for formato ProblemDetails do ASP.NET
    if (data.title || data.detail) {
      customError.title = data.title || customError.title;
      customError.message = data.detail || customError.message;
    } 
    
    // Se for erro de validação (FluentValidation) que retorna dicionário de erros
    // O ASP.NET retorna validation errors em data.errors ou no próprio data se retornar BadRequest(validationResult.ToDictionary())
    if (data.errors) {
      customError.errors = data.errors;
      // Pega a primeira mensagem de erro de validação para colocar na mensagem principal
      const firstErrorKey = Object.keys(data.errors)[0];
      if (firstErrorKey && Array.isArray(data.errors[firstErrorKey]) && data.errors[firstErrorKey].length > 0) {
        customError.message = data.errors[firstErrorKey][0];
      }
    } else if (typeof data === 'object') {
      // Caso seja um dicionário retornado diretamente por BadRequest(validationResult.ToDictionary())
      const keys = Object.keys(data).filter(k => k !== 'title' && k !== 'status' && k !== 'detail' && k !== 'type' && k !== 'instance');
      if (keys.length > 0) {
        customError.errors = data;
        const firstKey = keys[0];
        if (Array.isArray(data[firstKey]) && data[firstKey].length > 0) {
          customError.message = data[firstKey][0];
        } else if (typeof data[firstKey] === 'string') {
          customError.message = data[firstKey];
        }
      }
    }
  } else if (error.request) {
    customError.message = 'Não foi possível se conectar ao servidor. Verifique sua conexão.';
    customError.title = 'Erro de Conexão';
  }

  return customError;
}

export default api;
