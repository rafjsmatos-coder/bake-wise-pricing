# PreciBake

Sistema de gestão e precificação para confeiteiros.

## Sobre

PreciBake é uma plataforma web (PWA) para confeiteiros e doceiros que precisam calcular preços com precisão, gerenciar pedidos, controlar finanças e organizar receitas e ingredientes.

## Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS + shadcn/ui
- Supabase (auth, database, edge functions, storage)
- PWA com vite-plugin-pwa
- React Router, React Query, React Hook Form, Zod, Recharts

## Setup local

```bash
# 1. Clone o repositório
git clone <URL_DO_REPOSITORIO>
cd precibake

# 2. Instale as dependências (npm é o gerenciador padrão)
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Preencha os valores reais no .env

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

## Variáveis de ambiente

Veja `.env.example` para referência. As variáveis necessárias são:

| Variável | Descrição |
|----------|-----------|
| `VITE_SUPABASE_PROJECT_ID` | ID do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave anon/pública do Supabase |
| `VITE_SUPABASE_URL` | URL do projeto Supabase |

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run build:dev` | Build em modo desenvolvimento |
| `npm run preview` | Preview do build |
| `npm run lint` | Linting com ESLint |
| `npm run test` | Testes com Vitest |
| `npm run test:watch` | Testes em modo watch |
| `npm run typecheck` | Verificação de tipos (sem emitir) |

## Deploy

O deploy é feito via [Lovable](https://lovable.dev) → Share → Publish.

## Gerenciador de pacotes

Este projeto usa **npm**. Não utilize yarn, pnpm ou bun para evitar conflitos de lockfile.
