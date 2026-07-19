# CineCatalog Web

Interface React do CineCatalog para descobrir, avaliar e favoritar filmes.

## Destaques da interface

- Carrossel de destaque na página inicial, com a capa usada como fundo do card grande.
- Badge **Avaliado** nos cards de filmes que o usuário logado já avaliou.
- Cards com dimensões reservadas antes das imagens: posteres são carregados com baixa prioridade, sem causar deslocamento visual.
- Catálogo paginado (24 itens por página) e transições que mantêm os resultados anteriores enquanto filtros mudam.
- “Onde assistir” carregado apenas ao abrir o modal do filme; mostra assinatura, grátis, anúncios, aluguel e compra para o Brasil.

## Requisitos

- Node.js 20 ou superior.
- A [CineCatalog API](../../CineCatalog-API/README.md) em execução.

## Configuração

Crie `.env` na raiz deste projeto:

```env
VITE_API_URL=http://localhost:5298
```

## Executar

```bash
npm install
npm run dev
```

O Vite mostrará a URL local no terminal (por padrão, `http://localhost:52011`).

## Verificação

```bash
npm run lint
npm run build
```

## Organização

```text
src/
├── components/  # layout, cards de filmes e componentes de interface
├── context/     # autenticação
├── hooks/       # hooks reutilizáveis
├── pages/       # Home, Catálogo, Detalhes, Favoritos e Perfil
├── routes/      # proteção de rotas
└── services/    # cliente da API
```

## Decisões Técnicas

### Autenticação

O token de acesso é armazenado em `localStorage` por simplicidade de
implementação com a API stateless via header `Authorization: Bearer`.
Em um cenário de produção real, a alternativa mais segura seria usar
cookies `httpOnly` (protege contra roubo de token via XSS), o que exigiria
a API devolver `Set-Cookie` no login/refresh em vez de JSON, além de
configurar `SameSite`/CSRF — uma mudança de arquitetura maior que ficou
fora do escopo deste projeto de portfólio.