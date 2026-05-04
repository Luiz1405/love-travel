# Love Travel

Aplicação web para planejar e gerenciar viagens pessoais: cadastro, autenticação (e-mail e Google), CRUD de viagens com fotos, listagem paginada e busca. Monorepo **npm workspaces** com API em **NestJS** e interface em **React**.

---

## O que o projeto faz

| Área                      | Funcionalidade                                                                                                                                        |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Público**               | Página inicial com hero, carrossel de destinos em destaque (dados estáticos) e seção de benefícios.                                                   |
| **Autenticação**          | Login (JWT), cadastro de usuário, recuperação de senha, login com **Google OAuth** (redirect com token para o front).                                 |
| **Viagens (área logada)** | Criar viagem (com upload de até 10 fotos), listar com paginação, buscar, ver detalhe, atualizar e excluir — sempre vinculadas ao usuário autenticado. |
| **Usuários (API)**        | Listagem, detalhe, criação pública (registro), atualização e exclusão protegidas por JWT.                                                             |
| **Feature flags**         | Ex.: listagem de viagens pode depender da flag `travels_list` no PostgreSQL.                                                                          |
| **Documentação da API**   | **Swagger** em `/api/docs` (Bearer JWT).                                                                                                              |

O front também define tipos e serviço para `/destinations/featured` e `/auth/me`; o carrossel da home usa dados locais hoje — a integração com esses endpoints pode ser evolução futura da API.

---

## Stack tecnológica

### Backend (`apps/love-travel-back`)

- **Node.js 20**, **NestJS 11**, **TypeScript**
- **PostgreSQL** + **TypeORM** (usuários, feature flags; migrações; `synchronize: false`)
- **MongoDB** + **Mongoose** (documentos de viagem)
- **Redis** (cache da listagem paginada de viagens por usuário)
- **Supabase** (armazenamento de arquivos / fotos das viagens)
- **Passport**: JWT + **Google OAuth 2.0**
- **class-validator** / **class-transformer**, **Joi** (validação de variáveis de ambiente)
- **Swagger** (`@nestjs/swagger`)
- Testes: **Jest** (unitários; fluxo separado para integração e e2e)

### Frontend (`apps/love-travel-front`)

- **React 19**, **Vite 7**, **TypeScript**
- **React Router 7** (rotas e layout protegido para `/travels`)
- **TanStack Query** (ex.: hooks de dados)
- **Axios** (cliente HTTP)
- **Tailwind CSS 4** (estilização)
- **Lucide React**, **clsx**
- **react-dropzone** (upload de fotos nas viagens)
- Cliente **Supabase** no projeto (upload/utilitários)
- Testes: **Vitest**

### Infra local

- **Docker Compose**: API, front, PostgreSQL, MongoDB, Redis e **Dozzle** (visualização de logs dos containers; UI em `http://localhost:8081` quando compose sobe)

### Raiz do monorepo

- **concurrently**: comando `npm run dev` sobe back e front juntos

---

## Estrutura de pastas (resumo)

```
love-travel/
├── apps/
│   ├── love-travel-back/    # API NestJS
│   └── love-travel-front/   # SPA React + Vite
├── docker-compose.yml
├── render.yaml
├── package.json             # workspaces + scripts agregados
└── .env.example             # base para Docker/local
```

---

## Pré-requisitos

- **Node.js 20.x** (alinhado ao `engines` e ao CI)
- **npm** (workspaces)
- Para stack completa local: **Docker** / Docker Compose (recomendado para bancos e Redis)

Variáveis obrigatórias da API estão validadas em `apps/love-travel-back/src/config/env.validation.ts` (PostgreSQL, Mongo, Redis, JWT, Google OAuth, Supabase, `FRONTEND_URL`, etc.). Use `.env.example` como ponto de partida e preencha o que faltar para desenvolvimento.

Front: em desenvolvimento costuma usar `VITE_API_URL` apontando para a API (no deploy Render o `render.yaml` injeta a URL do serviço).

---

## Como rodar

### Desenvolvimento (back + front na máquina)

Na raiz:

```bash
npm install
npm run dev
```

- API: porta padrão **3000** (Swagger: `http://localhost:3000/api/docs`)
- Front (Vite): geralmente **5173** (CORS do back já inclui `localhost:5173` e `8080`)

Scripts úteis na raiz:

| Comando                            | Descrição                |
| ---------------------------------- | ------------------------ |
| `npm run start:backend`            | Só o Nest em watch       |
| `npm run start:frontend`           | Só o Vite                |
| `npm run dev`                      | Back e front em paralelo |
| `npm run test` / `test:cov`        | Testes back + front      |
| `npm run test:back` / `test:front` | Testes isolados por app  |

### Docker Compose

```bash
docker compose up --build
```

Serviços típicos: back **3000**, front **8080**, Postgres **5433**→5432 no host, Mongo **27018**→27017, Redis **6379**, Dozzle **8081**. Ajuste `.env` conforme `docker-compose.yml`.

Migrações TypeORM no back: scripts `migration:*` em `apps/love-travel-back/package.json`. Em produção/hospedagem, pode-se usar `RUN_MIGRATIONS=true` para rodar migrações na subida (ver `main.ts`).

---

## CI/CD

Fluxo completo: validação no GitHub e deploy na **Render**.

| Etapa | Ferramenta | O que faz |
| ----- | ----------- | ----------- |
| **CI** (integração contínua) | **GitHub Actions** (`.github/workflows/main.yml`) | Em `push` nas branches `main` e `dev` e em `pull_request` para `main`: instala dependências, **lint** do front, **build** do front e **build** do back (job do back sobe **Postgres** como serviço para o pipeline). |
| **CD** (entrega contínua) | **Render** | Em `push` na `main`, após os jobs de CI concluírem com sucesso, o workflow dispara o deploy via **hook** (`RENDER_DEPLOY_HOOK_URL` no repositório). O arquivo `render.yaml` declara a API (**Web Service** Node) e o front (**Static Site** com rewrite SPA para `index.html`); variáveis como `VITE_API_URL` e `FRONTEND_URL` são encadeadas entre os serviços no Render. |

---

## Ferramentas e práticas no desenvolvimento

Uso de **Trello** com quadro Kanban para organizar o trabalho, **Conventional Commits** nas mensagens de commit, **Cursor** como apoio no desenvolvimento e **IA Banani** como apoio no design inicial das telas.

---

## Licença

Desenvolvido por Luiz Augusto de Souza Kubaszewski.
