# Estrutura de Pastas e Arquivos - CineCatalog.Web

Este documento descreve detalhadamente a arquitetura de pastas e arquivos do **Frontend** (CineCatalog.Web) construído em React, explicando a responsabilidade de cada diretório e componente.

---

## Estrutura do Projeto Principal (`cinecatalog.web`)

O frontend é uma SPA (Single Page Application) desenvolvida em **React** e gerenciada pelo **Vite**, utilizando **TanStack Query** (React Query) para sincronização de estado com a API do backend, **Lucide React** para ícones, e **TailwindCSS/CSS Modules** para estilização.

Abaixo está o detalhamento dos arquivos e pastas na raiz de `/cinecatalog.web`:

* `index.html` - Ponto de entrada do documento HTML carregado pelo navegador. Contém a div `#root` onde a árvore React é renderizada.
* `package.json` - Declaração de dependências do projeto (React, Axios, React Router, TanStack Query, Lucide, etc.) e scripts de desenvolvimento (`npm run dev`, `npm run build`).
* `vite.config.js` - Arquivo de configuração do Vite que define plugins e o servidor de desenvolvimento.
* `eslint.config.js` - Configurações do linter para garantir boas práticas e padrão de código Javascript/React.
* `.env` / `.env.example` - Configurações de variáveis de ambiente do frontend (ex: `VITE_API_URL` que aponta para `http://localhost:5298`).

---

## Estrutura do Código-Fonte (`/src`)

A lógica, componentes e visualizações residem inteiramente na pasta `/src`. Abaixo está a descrição das subpastas:

### 1. Componentes (`/components`)
Contém os componentes reutilizáveis compartilhados por múltiplas páginas da aplicação.
* **/ui**: Componentes estruturais e genéricos:
  * `Button`: Componente personalizado de botão (suporta variantes como primary, secondary, outline).
  * `Card`: Estrutura de container estilizada.
  * `Input`: Campo de texto padronizado (com suporte a ícones internos).
  * `Modal`: Componente de pop-up responsivo.
  * `Skeleton`: Componente visual de transição ("skeleton loader") usado para indicar carregamento de texto ou blocos de imagem.
  * `Spinner`: Indicador circular de carregamento.
* **/Layout**: Estrutura geral das páginas:
  * `Layout.jsx` / `Layout.module.css`: Define o cabeçalho fixo (Header) com menu de navegação responsivo, o rodapé (Footer) e a área de conteúdo central (`<Outlet />`).
* **/MovieCard**: Cartão individual de exibição de filme:
  * `MovieCard.jsx` / `MovieCard.module.css`: Mostra o poster do filme, o título, ano de lançamento, duração, diretor e badges especiais (se o usuário já avaliou o filme ou a média de estrelas).
* **/ScrollToTop**: Componente utilitário:
  * `ScrollToTop.jsx`: Escuta mudanças nas rotas do navegador e força a tela a subir de volta para o topo (`window.scrollTo(0,0)`), garantindo que novas páginas nunca iniciem no meio da tela.

### 2. Páginas (`/pages`)
Componentes que representam as telas/rotas individuais do site.
* **/Home**: Página inicial (`Home.jsx`):
  * Exibe um banner (Hero Carousel) com filmes populares em alta (trending) consumidos da API pública do TMDb e uma seção em grade contendo os filmes mais recentes cadastrados localmente no banco de dados.
* **/Catalog**: Página do catálogo geral (`Catalog.jsx`):
  * Listagem paginada de filmes com campo de pesquisa dinâmico e painel de filtros avançados por gênero, diretor, ano de lançamento, avaliação mínima e duração mínima. Contém rolagem suave automática para o topo ao trocar de página.
* **/MovieDetails**: Tela de detalhes do filme (`MovieDetails.jsx`):
  * Mostra as informações completas da obra (elenco, sinopse, classificação), exibe e gerencia as avaliações e críticas dos usuários, permite que o usuário escreva, edite ou exclua sua própria crítica e disponibiliza o trailer do filme, bem como a busca de plataformas onde assisti-lo.
* **/Favorites**: Página de favoritos (`Favorites.jsx`):
  * Mostra apenas os filmes que o usuário autenticado favoritou clicando no ícone de coração.
* **/Profile**: Página do perfil do usuário (`Profile.jsx`):
  * Permite ao usuário editar suas informações cadastrais (nome, e-mail e URL do avatar) com validação Zod e atualizar a senha com as mesmas regras estritas exigidas no backend.
* **/Login** e **/Register**: Telas de controle de sessão (`Login.jsx` e `Register.jsx`):
  * Formulários limpos para entrar na conta e cadastrar um novo usuário.
* **/NotFound**: Tela de erro 404 (`NotFound.jsx`):
  * Exibida de forma amigável quando uma rota inexistente é digitada.

### 3. Contexto de Autenticação (`/context`)
* `AuthContext.jsx`: Provê o estado global de autenticação (se o usuário está logado, informações do payload do token de usuário e funções auxiliares de `login`, `logout` e `updateProfileState`). Gerencia a gravação segura dos tokens JWT (`accessToken` e `refreshToken`) no `localStorage` do navegador.

### 4. Rotas (`/routes`)
* `PrivateRoute.jsx`: Middleware de rota que verifica se o usuário está logado. Se não estiver, redireciona-o automaticamente para `/login` guardando a rota original na memória (redireciona de volta após o login bem-sucedido).

### 5. Serviços (`/services`)
* `api.js`: Configuração global da instância do **Axios** apontando para a URL do backend. Contém o interceptor de requisições que insere o token Bearer JWT e o interceptor de respostas que renova automaticamente os tokens expirados chamando a rota de refresh token (`/api/Auth/refresh`), evitando deslogar o usuário durante o uso.

### 6. Testes (`/test`)
Contém todos os arquivos de testes de unidade e de integração configurados com o **Vitest** e **React Testing Library** para testar componentes, esquemas Zod, rotas e interceptadores da API.

### 7. Utilitários (`/utils`)
* `slugify.js`: Função utilitária que converte títulos de filmes (ex: "Matrix Reloaded!") em URLs limpas e otimizadas para SEO (ex: "matrix-reloaded").