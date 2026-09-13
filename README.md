# 🦆 QuackSec — Frontend UI

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)

A interface web oficial do **QuackSec** — plataforma completa de **Application Security Posture Management (ASPM)** e **DevSecOps**. Desenvolvida com Next.js 14 (App Router), oferece uma experiência de usuário moderna, fluida e responsiva para monitoramento de segurança, triagem de vulnerabilidades, visualização de métricas de risco e aplicação de correções assistidas por Inteligência Artificial.

---

## 📸 Principais Recursos da UI

- **Dashboard Executivo e Operacional**:
  - Métricas de risco global da organização e pontuação de saúde de segurança (Security Score).
  - Gráficos interativos de severidade (Crítico, Alto, Médio, Baixo).
  - Resumo de vulnerabilidades ativas, pendentes de correção e resolvidas.
- **Gestão & Orquestração de Scans**:
  - Disparo manual e agendamento de varreduras SAST, DAST, SCA, Secret Scanning e Container.
  - Acompanhamento do progresso dos scans em tempo real via **Server-Sent Events (SSE)** / WebSockets.
  - Logs detalhados de execução para diagnóstico técnico.
- **Painel Interativo de Vulnerabilidades**:
  - Filtros dinâmicos por severidade, projeto, status do ciclo de vida e ferramenta detectora.
  - Modal de detalhes técnicos com explicação contextual da falha, arquivo afetado e trecho de código.
  - **IA Assistida (Auto-Fix)**: Exibição de trechos de código corrigidos e explicações geradas por Inteligência Artificial.
- **Internacionalização Native (i18n)**:
  - Suporte completo aos idiomas **Português (PT-BR)** e **Inglês (EN)** via `next-intl`.
- **Tema Claro / Escuro (Dark Mode)**:
  - Design sofisticado ajustável às preferências visuais do usuário.

---

## 🛠️ Stack Tecnológica

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [TailwindCSS](https://tailwindcss.com/) com design system baseado em tokens
- **Componentes**: Radix UI / Shadcn UI
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Internacionalização**: [`next-intl`](https://next-intl-docs.vercel.app/)
- **Gerenciamento de Requisições**: Axios & Fetch API envelopado
- **Gerenciamento de Formulários**: React Hook Form com validação Zod

---

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/                      # App Router do Next.js
│   │   └── [locale]/             # Suporte a rotas internacionalizadas (/pt, /en)
│   │       ├── dashboard/        # Painel principal de estatísticas e gráficos
│   │       ├── scans/            # Páginas de execução e histórico de scans
│   │       ├── vulnerabilidades/ # Lista e detalhes de falhas identificadas
│   │       ├── aplicacoes/       # Cadastro e gestão de projetos
│   │       └── configuracoes/    # Perfil, usuários, RBAC e integrações
│   ├── components/               # Componentes UI reutilizáveis
│   │   ├── layout/               # Sidebar, Header, Navbar e Footer
│   │   ├── ui/                   # Botões, Modais, Cards, Badges, Inputs (Shadcn/UI)
│   │   └── vulnerabilities/      # Tabelas interativas, filtros e modal de IA
│   ├── i18n/                     # Configurações e dicionários de tradução
│   │   ├── messages/             # Arquivos JSON de tradução (pt.json, en.json)
│   │   └── config.ts             # Idiomas suportados e roteamento i18n
│   ├── lib/                      # Cliente de API centralizado (Axios) e utilitários
│   └── middleware.ts             # Middleware de internacionalização e autenticação
├── public/                       # Ativos estáticos (Logos, favicons, imagens)
├── package.json
└── tailwind.config.js
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js**: v18.0.0 ou superior
- **npm** ou **yarn** / **pnpm**
- Instância da API Backend (`quackback`) em execução

### Step-by-Step

1. **Instale as dependências**:
   ```bash
   npm install
   ```

2. **Configure as Variáveis de Ambiente**:
   Crie um arquivo `.env.local` na raiz da pasta `frontend`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Acesse no navegador**:
   Abra [http://localhost:3000](http://localhost:3000)

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor Next.js em modo de desenvolvimento com hot-reload |
| `npm run build` | Compila o projeto para produção otimizando assets |
| `npm run start` | Inicia o servidor em modo de produção (após o build) |
| `npm run lint` | Executa o ESLint para verificar padrões e problemas no código |

---

## 📄 Licença
Este repositório faz parte da suíte **QuackSec**. Uso interno e comercial sujeito aos termos de licença da plataforma.
