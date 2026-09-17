# Syscor — Frontend React

Projeto React (Vite) do sistema Syscor, convertido a partir do protótipo HTML/CSS/JS.

## Rodar localmente

```bash
npm install
npm run dev
```

Acesse http://localhost:5173 — qualquer usuário e senha entram no sistema (modo de demonstração com dados locais).

## Build de produção

```bash
npm run build
npm run preview
```

## Estrutura

- `src/pages/` — uma tela por arquivo (Login, Dashboard, Venda, Clientes, Estoque, EntradaEstoque, Financeiro, Conciliacao, Documental, Fiscal, Integracoes, Relatorios, Config)
- `src/components/` — Sidebar, AuthModal, ToastContext (toasts globais)
- `src/data/demoData.js` — dados de demonstração compartilhados
- `src/index.css` — design system (mesmas variáveis/cores do protótipo original)
- Roteamento com `react-router-dom` (HashRouter, funciona em qualquer hospedagem estática)

## Conectar ao backend

Hoje todos os dados são mockados em `src/data/demoData.js`. Para plugar no backend Spring Boot, crie um `src/services/` com chamadas `fetch`/`axios` para a API e substitua os dados importados de `demoData.js` por chamadas via `useEffect`/`useState` (ou React Query) em cada página.
