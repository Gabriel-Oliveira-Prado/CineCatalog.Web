# CineCatalog Frontend 🎬

Interface moderna e responsiva para a CineCatalog API, desenvolvida com **React 19**, **Vite** e estilização via **CSS Modules**. O design adota a identidade visual "Cinema à noite" com tons profundos de azul-tinta, detalhes em dourado "luz de marquise" e perfurações decorativas de filme de 35mm como assinatura visual.

Este projeto consome a [CineCatalog API](https://github.com/Gabriel-Oliveira-Prado/CineCatalog-API).

---

## 🎨 Identidade Visual & Design System

*   **Fundo:** Azul-tinta profundo (`#0A0D14`)
*   **Superfícies/Cards:** Azul-petróleo escuro (`#141B29`) com bordas translúcidas
*   **Cor Primária (CTA/Foco):** Indigo (`#4C5FD5`)
*   **Destaques:** Dourado luz de marquise (`#E8A33D`)
*   **Fontes:**
    *   `Bebas Neue` para títulos e cabeçalhos em estilo marquise/pôster de cinema.
    *   `Manrope` para textos corridos, formulários e UI limpa e de fácil leitura.

---

## 🏗️ Estrutura do Projeto (Fase 1: Fundação)

```text
src/
├── assets/             # Recursos estáticos (imagens, svgs, etc.)
├── components/         # Componentes reutilizáveis
│   ├── Layout/         # Header, Footer com sprockets e container global
│   └── ui/             # Componentes primitivos (Button, Input, Card, Modal, Spinner, Skeleton)
├── pages/              # Páginas da aplicação (Placeholders na Fundação)
│   ├── Home/
│   ├── Login/
│   ├── Register/
│   ├── Catalog/
│   ├── MovieDetails/
│   ├── Favorites/
│   ├── Profile/
│   └── NotFound/
├── routes/             # Definição e proteção de rotas (PrivateRoute)
├── services/           # Cliente Axios e chamadas de APIs
│   └── api.js          # Axios configurado com interceptors e fila de refresh token
├── index.css           # Estilos globais e tokens de design do CSS
├── main.jsx            # Ponto de entrada (envelopa QueryClientProvider e Toaster)
└── App.jsx             # Router principal da aplicação
```

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# URL base para a API do CineCatalog
VITE_API_URL=http://localhost:5298
REACT_APP_API_URL=http://localhost:5298
```

---

## 🚀 Como Rodar o Projeto

1.  **Instalar as dependências:**
    ```bash
    npm install
    ```

2.  **Iniciar o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    A aplicação estará disponível em `http://localhost:5173`.

3.  **Compilar para produção:**
    ```bash
    npm run build
    ```

---

## 📡 Endpoints Consumidos (Fase 1)

*   `POST /api/Auth/refresh` — Utilizado silenciosamente pelo interceptor do Axios para revalidação de sessões expiradas.
