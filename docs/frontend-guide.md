## Viagens&Co — Guia de Desenvolvimento do Frontend (React + TypeScript)

Este documento é o trilho do nosso desenvolvimento. A ideia é você entender o porquê de cada escolha, como organizar as pastas, como criar os componentes e, principalmente, como conversar com o back end. Vamos construir por blocos. Nesta primeira parte cobrimos:

- Stack e decisões
- Estrutura de pastas e convenções
- Camada de comunicação com o back end (API layer)
- Sistema de componentes reutilizáveis
- Como implementar a Tela Principal (Home) exatamente como no print, explicando cada `div`/tag, cada componente e layout

Nas próximas partes, faremos: Login, Cadastro de Viagem e Listagem/Detalhe de Viagem.


### 1) Stack e decisões

- **React + TypeScript**: Tipagem dá segurança e clareza entre camadas (componentes, hooks, API).
- **Vite**: Dev server e build rápidos. Alternativa plausível seria Next.js, mas manteremos Vite para foco em UI + API.
- **React Router**: Gerenciar navegação entre `Home`, `Login`, `Nova Viagem`, `Minhas Viagens`.
- **Styling com Tailwind CSS**: Acelera a fidelidade visual (cores, espaçamentos, sombras) e reduz CSS "manual". Se preferir CSS Modules, a arquitetura abaixo continua válida — trocamos apenas as classes utilitárias.
- **React Query (TanStack Query)**: Cache e estados de requisição (loading/error/success) prontos para uso; desacopla UI da lógica de fetch.
- **Axios**: Cliente HTTP com interceptors para baseURL, headers, auth, e tratamento de erros.

Observação: podemos escrever tudo também sem Tailwind/React Query. Aqui usamos porque melhoram DX, padronizam e reduzem código cerimonial.


### 2) Estrutura de pastas

```txt
apps/
  love-travel-front/           # novo app React (Vite)
    src/
      app/
        routes/                # rotas (Home, Login, etc.)
        providers/             # React Query, ThemeProvider, etc.
        router.tsx             # definição de rotas
        App.tsx
        main.tsx
      shared/
        ui/                    # componentes reutilizáveis (Button, Badge, Card...)
        layout/                # wrappers de layout (Navbar, Container, Footer...)
        icons/                 # ícones SVG encapsulados
        styles/                # estilos globais, tokens (se aplicável)
        lib/                   # utilidades puras (formatters, masks, etc.)
      features/
        home/                  # pasta da feature Home
          components/          # blocos da tela (Hero, FeaturedDestinations, Benefits)
          api/                 # hooks/queries específicos da feature (se houver)
          HomePage.tsx
        auth/
          ...                  # (próximos blocos: Login)
        travel/
          ...                  # (Cadastro/Listagem de viagens)
      api/                     # camada de comunicação com back end (instância axios, tipos base)
        client.ts
        endpoints.ts           # enums/consts de rotas da API
        types.ts               # tipos compartilhados de respostas/erros
```

Por que separar por `features`? Assim agrupamos UI + lógica específica daquela página/fluxo, reduzindo “pastas gigantes” por tipo (components/, hooks/). `shared/` guarda peças genéricas realmente reutilizáveis.


### 3) API Layer (comunicação com o back end)

Objetivos:
- Um único ponto para configurar `baseURL`, autenticação e tratamento de erros.
- Tipos explícitos das respostas.
- Hooks finos para cada endpoint, usando React Query.

Arquivo `src/api/client.ts`:

```ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000', // ajuste conforme seu back
  withCredentials: true, // se usar cookies/sessão
});

// Interceptor para anexar token (se usar Bearer)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respostas para normalizar erros
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Aqui podemos mapear mensagens de erro do back, exibir toast, fazer logout em 401, etc.
    return Promise.reject(error);
  }
);
```

Arquivo `src/api/endpoints.ts`:

```ts
export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    me: '/auth/me',
  },
  destinations: {
    featured: '/destinations/featured', // para a Home
  },
  travels: {
    list: '/travels',
    create: '/travels',
    detail: (id: string | number) => `/travels/${id}`,
    photos: (id: string | number) => `/travels/${id}/photos`,
  },
} as const;
```

Tipos base `src/api/types.ts` (exemplo mínimo):

```ts
export type ApiError = {
  message: string;
  statusCode?: number;
  details?: unknown;
};

export type FeaturedDestination = {
  id: string;
  name: string;          // "Praias Tropicais"
  coverUrl: string;      // imagem da capa
  slug: string;          // "praias-tropicais"
};
```

Hook para featured destinations (poderia morar em `features/home/api`):

```ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { FeaturedDestination } from '@/api/types';

export function useFeaturedDestinations() {
  return useQuery({
    queryKey: ['featured-destinations'],
    queryFn: async () => {
      const { data } = await api.get<FeaturedDestination[]>(ENDPOINTS.destinations.featured);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
```

Por que React Query? Para a Home, poderíamos usar `useEffect` + `useState`. Mas, conforme o app cresce, cache, refetch inteligente e estados padrão fazem muita diferença.


### 4) Sistema de componentes reutilizáveis (UI)

Vamos criar 3 peças que aparecem nos prints e serão úteis depois:

1) `Button`: variantes (primary, ghost), tamanhos, ícone opcional.
2) `Badge`: pequenos rótulos (ex: “Concluída”, “Planejada”).
3) `Card`: container com sombra/suave, usado nas miniaturas de destinos.

Exemplos (Tailwind):

`src/shared/ui/Button.tsx`
```tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  className,
  children,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-shadow focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400',
    ghost: 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 focus:ring-blue-400',
  };
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-11 px-5 text-lg',
  };

  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
    </button>
  );
}
```

`src/shared/ui/Badge.tsx`
```tsx
import { HTMLAttributes } from 'react';
import clsx from 'clsx';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  color?: 'green' | 'blue' | 'gray';
};

export function Badge({ color = 'blue', className, ...props }: BadgeProps) {
  const colors = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800',
  };
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        colors[color],
        className
      )}
      {...props}
    />
  );
}
```

`src/shared/ui/Card.tsx`
```tsx
import { HTMLAttributes } from 'react';
import clsx from 'clsx';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('rounded-lg bg-white shadow-sm ring-1 ring-black/5', className)}
      {...props}
    />
  );
}
```

Por que estas abstrações? Elas encapsulam padrões visuais (bordas, sombras, foco) e nos deixam focar na regra de negócio das telas.


### 5) Tela Principal (Home) — passo a passo

Componentes visuais mapeados do print:
- `Navbar` (topo com logo, navegação e avatar)
- `Hero` (headline, subtítulo, CTAs)
- `FeaturedDestinations` (cards com 3 destaques)
- `Benefits` (bloco “Guarde cada momento especial” com ícones/lista)
- `Footer` (simples, opcional agora)

Componente `HomePage.tsx` organiza a composição usando tags semânticas: usamos `header` para a barra superior, `main` para conteúdo principal e `section` para blocos. O uso de `div` fica para agrupamentos puramente estilísticos, quando não há semântica melhor.

Estrutura de arquivos da feature:

```txt
src/features/home/
  components/
    Hero.tsx
    FeaturedDestinations.tsx
    Benefits.tsx
  HomePage.tsx
```

Navbar (em `shared/layout/Navbar.tsx`):

```tsx
import { Link, NavLink } from 'react-router-dom';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold text-blue-700">
          ✈ Viagens&Co
        </Link>
        <nav className="hidden md:flex gap-6 text-sm">
          <NavLink to="/travels" className={({ isActive }) => isActive ? 'text-blue-700' : 'text-gray-600 hover:text-gray-900'}>
            Minhas viagens
          </NavLink>
          <NavLink to="/travels/new" className={({ isActive }) => isActive ? 'text-blue-700' : 'text-gray-600 hover:text-gray-900'}>
            Cadastrar uma viagem
          </NavLink>
        </nav>
        <div className="flex items-center gap-3">
          {/* Avatar/Perfil – placeholder */}
          <div className="h-8 w-8 rounded-full bg-blue-100 grid place-items-center text-blue-700 text-xs">👤</div>
        </div>
      </div>
    </header>
  );
}
```

Notas de marcação:
- `header` é semântico para a barra superior do site (melhor que uma `div`).
- `nav` indica agrupamento de links de navegação; cada link é um `NavLink` para estado ativo.
- `div`s internas agrupam visualmente elementos (logo à esquerda, ações à direita), sem uma semântica própria além de layout.

Página `HomePage.tsx` (orquestração):

```tsx
import { Navbar } from '@/shared/layout/Navbar';
import { Hero } from './components/Hero';
import { FeaturedDestinations } from './components/FeaturedDestinations';
import { Benefits } from './components/Benefits';

export function HomePage() {
  return (
    <div className="min-h-dvh bg-blue-50">
      <Navbar />
      <main>
        <Hero />
        <FeaturedDestinations />
        <Benefits />
      </main>
    </div>
  );
}
```

Seções da Home:

`Hero.tsx` — reproduz o callout com título grande e CTAs. Aqui usamos `section` (bloco do documento) e elementos de texto semânticos (`h1`, `p`). As `div`s internas servem para grid/alinhamento apenas.

```tsx
import { Button } from '@/shared/ui/Button';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="bg-blue-50">
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <p className="mx-auto inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          Planeje sua próxima aventura
        </p>
        <h1 className="mt-4 text-4xl md:text-5xl font-extrabold text-slate-900">
          O mundo está esperando<br />por você
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-slate-600">
          Organize suas viagens, registre memórias inesquecíveis e descubra novos destinos com
          nossa plataforma focada em você.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/travels/new">
            <Button size="lg">Cadastrar uma viagem</Button>
          </Link>
          <Link to="/travels">
            <Button variant="ghost" size="lg">Ver minhas viagens</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
```

Por que `section`? Porque é um agrupamento temático do conteúdo. Por que `div` dentro? Para conter largura (`max-w-5xl`), centralizar e aplicar espaçamentos. `div` é neutra quando precisamos apenas de um “contêiner visual”.

`FeaturedDestinations.tsx` — cards com imagens. Aqui entra a comunicação com o back end via `useFeaturedDestinations`. Enquanto os endpoints não existirem, você pode mockar o retorno no próprio hook.

```tsx
import { Card } from '@/shared/ui/Card';
import { useFeaturedDestinations } from '@/features/home/api/useFeaturedDestinations';

export function FeaturedDestinations() {
  const { data, isLoading, isError } = useFeaturedDestinations();

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center">
          Destinos em destaque
        </h2>
        <p className="mt-2 text-center text-slate-600">
          Inspire-se para a sua próxima viagem com esses destinos incríveis em tons serenos.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading && (
            <>
              <div className="h-48 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-48 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-48 animate-pulse rounded-lg bg-slate-200" />
            </>
          )}
          {isError && (
            <div className="col-span-full text-center text-red-600">
              Não foi possível carregar os destinos.
            </div>
          )}
          {data?.map((d) => (
            <Card key={d.id} className="overflow-hidden">
              <div className="relative h-48">
                <img
                  src={d.coverUrl}
                  alt={d.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="p-3">
                <span className="inline-block rounded bg-white/90 px-2 py-1 text-xs font-medium shadow-sm ring-1 ring-black/5">
                  {d.name}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Notas de marcação:
- `section` delimita um bloco autônomo (destinos).
- `div` com `grid` organiza a responsividade. `Card` encapsula contorno e sombra; dentro dele usamos uma `div` “relativa” para permitir a imagem “absoluta” preencher corretamente — isso facilita manter o aspecto visual (sem distorção) e cortar o excesso com `overflow-hidden`.

`Benefits.tsx` — bloco com copy e lista com ícones (no print, lado esquerdo texto e bullets; à direita, imagem grande). Em telas pequenas, vira uma coluna; em grandes, grid 2 colunas. Optamos por `section` novamente pelo mesmo motivo.

```tsx
export function Benefits() {
  return (
    <section className="bg-blue-50">
      <div className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
            Guarde cada momento especial
          </h3>
          <p className="mt-3 text-slate-600">
            Ao cadastrar suas viagens, você cria um diário virtual com datas, locais e fotos...
          </p>
          <ul className="mt-6 space-y-3 text-slate-700">
            <li className="flex items-start gap-3">
              <span className="h-6 w-6 rounded bg-blue-100 text-blue-700 grid place-items-center text-xs">🗺</span>
              Mapeie seus roteiros detalhadamente
            </li>
            <li className="flex items-start gap-3">
              <span className="h-6 w-6 rounded bg-blue-100 text-blue-700 grid place-items-center text-xs">📷</span>
              Anexe fotos incríveis da sua viagem
            </li>
            <li className="flex items-start gap-3">
              <span className="h-6 w-6 rounded bg-blue-100 text-blue-700 grid place-items-center text-xs">🗂</span>
              Organize tudo por datas e eventos
            </li>
          </ul>
        </div>
        <div className="rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5">
          {/* Imagem ilustrativa; substitua pela sua */}
          <img
            src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop"
            alt="Explorar novos horizontes"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
```

Observações:
- A `ul` expressa lista semântica. Cada `li` contém um pequeno ícone (pode virar componente futuro).
- A imagem do lado direito está dentro de um contêiner com bordas arredondadas + sombra para aproximar do visual do print.


### 6) Navegação (Router) e Providers

`src/app/router.tsx`:

```tsx
import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '@/features/home/HomePage';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  // Próximas telas:
  // { path: '/login', element: <LoginPage /> },
  // { path: '/travels', element: <TravelsListPage /> },
  // { path: '/travels/new', element: <CreateTravelPage /> },
]);
```

`src/app/providers/AppProviders.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

`src/app/App.tsx`:

```tsx
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AppProviders } from './providers/AppProviders';

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
```


### 7) Acessibilidade e responsividade

- Use hierarquia de cabeçalhos correta (`h1` na hero, `h2`/`h3` nas seções inferiores).
- Links de navegação devem ser `a`/`NavLink` — não `div` clicável.
- Imagens com `alt` descritivo.
- Teste em mobile-first: os grids são ajustados com `grid-cols-1` → `md:grid-cols-2/3`.


### 8) Estados de rede (Home)

- `isLoading`: skeletons de cartões.
- `isError`: mensagem curta amigável; registre erros nos devtools se necessário.
- `empty` (quando `data?.length === 0`): exiba CTA para explorar destinos ou recarregar.


### 9) Próximos blocos (planejamento)

Na continuação do documento, faremos:
- Login: formulário, validação, `POST /auth/login`, persistência de token/cookies, `api.interceptors`.
- Cadastro de Viagem: formulário com campos (datas, destino, status, orçamento, descrição, upload de fotos com pré-visualização), `POST /travels` e upload (mesmo que o endpoint ainda não exista).
- Minhas Viagens: lista com filtros/busca, estados (planejada, concluída), card/row layout e página de detalhe com galeria de fotos.

Se quiser, me diga se prefere Tailwind ou CSS Modules que adapto os exemplos mantendo a mesma arquitetura.


### 10) Checklist do que você pode implementar agora

1) Criar o app com Vite + React + TS e instalar dependências: `react-router-dom`, `@tanstack/react-query`, `axios`, `clsx`, `tailwindcss` (opcional, se optar por usar).
2) Subir os arquivos base (`App.tsx`, `router.tsx`, `AppProviders.tsx`).
3) Implementar `Navbar`, `Button`, `Badge`, `Card`.
4) Montar `HomePage` com `Hero`, `FeaturedDestinations`, `Benefits`.
5) Criar o hook `useFeaturedDestinations` apontando para `ENDPOINTS.destinations.featured`. Enquanto não existir no back, retorne um array mockado.

Com isso, a página principal estará funcional e pronta para evoluir.

