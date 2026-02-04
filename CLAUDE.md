# CLAUDE.md

This file contains learnings and patterns discovered while working on this codebase.

## Project Structure

This is a pnpm monorepo with workspaces under `packages/`:

- `packages/services/*` - GraphQL microservices (users, projects, content, etc.)
- `packages/client-admin` - Next.js admin panel with Chakra UI
- `packages/graph` - Shared GraphQL types and client utilities
- `packages/api-base` - Shared utilities for services (auth, dataloaders, etc.)
- `packages/db` - Prisma database client and schema

## Local Development Setup

### 1. Start local PostgreSQL database

```bash
pnpm db:local        # Starts PostgreSQL 14.1 in Docker on port 5789
pnpm db:local:rm     # Stop and remove the database container
```

The database runs at `postgresql://postgres:postgres@localhost:5789/postgres`

### 2. Environment files

Copy `.env` to configure environment variables. Key files:

- `.env` (root) - Main environment variables
- `packages/db/prisma/.env` - Database URL for Prisma
- `packages/client-admin/.env.local` - Frontend Auth0 config

Required variables for local development:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5789/postgres
AUTH0_DOMAIN=learner-model-gql.us.auth0.com
AUTH0_CLIENT=<your-client-id>
AUTH0_SECRET=<your-client-secret>
ADMIN_USER_EMAIL=<your-email>
```

### 3. Run database migrations

```bash
pnpm migrate         # Run Prisma migrations in dev mode (creates migration files)
# Or for specific package:
pnpm -C packages/db migrate:dev      # Dev migrations (interactive)
pnpm -C packages/db migrate:deploy   # Deploy migrations (CI/production)
pnpm -C packages/db migrate:push     # Push schema without migrations (prototyping)
```

### 4. Generate types and start dev server

```bash
pnpm generate        # Generate Prisma client + GraphQL types
pnpm dev             # Start all services and clients
```

The dev server runs at:

- GraphQL API: `http://localhost:8080/graphql`
- Admin panel: `http://localhost:3000` (via Next.js)

## Common Commands

```bash
pnpm generate        # Run codegen (Prisma + GraphQL) - run after schema changes
pnpm dev             # Start all services and clients in development mode
pnpm tsc --noEmit    # Type check the entire project
pnpm test            # Run tests with c8 coverage
pnpm test:watch      # Run tests in watch mode
```

## GraphQL Architecture

### Services use graphql-ez with module pattern

Each service defines modules in `src/modules/*.ts` using:

```typescript
export const myModule = registerModule(
  gql`
    # Schema definitions here
  `,
  {
    id: "ModuleName",
    dirname: import.meta.url,
    resolvers: {
      // Resolvers here
    },
  }
);
```

### Admin mutations require authorization

Admin mutations are nested under `adminUsers` or similar namespaces. The resolver must call `await authorization.expectAdmin` before returning the mutation object:

```typescript
Mutation: {
  async adminUsers(_root, _args, { authorization }) {
    await authorization.expectAdmin;
    return {};
  },
},
```

### Use pMap for concurrent database/API operations

The codebase uses `p-map` for controlled concurrency:

```typescript
import pMap from "p-map";

const results = await pMap(
  items,
  async (item) => {
    // process item
  },
  { concurrency: 2 }
);
```

## Frontend Patterns

### Admin panel uses Chakra UI + valtio + react-query

- State management: `valtio` with `proxy` and `useSnapshot`
- Data fetching: Custom hooks wrapping react-query (`useGQLQuery`, `useGQLMutation`)
- Forms: `FormModal` component for modal-based forms
- Reusable hooks: `useSelectMultiProjects`, `useTagsSelect` for common select patterns

### GraphQL operations are defined inline with gql tag

```typescript
const MyMutation = gql(/* GraphQL */ `
  mutation MyMutation($input: MyInput!) {
    myMutation(input: $input) {
      id
    }
  }
`);

const { mutateAsync, isLoading } = useGQLMutation(MyMutation, {
  async onSuccess() {
    await queryClient.invalidateQueries();
  },
});
```

## Environment Variables

- `AUTH0_DOMAIN` - Auth0 tenant domain (e.g., `learner-model-gql.us.auth0.com`)
- `AUTH0_CLIENT` - Auth0 client ID for API verification
- `AUTH0_SECRET` - Auth0 client secret
- `DATABASE_URL` - PostgreSQL connection string

Frontend uses `NEXT_PUBLIC_` prefix for client-side env vars.

## Auth0 Integration

- Auth0 Management API tokens are short-lived (24 hours)
- User creation endpoint: `POST https://${AUTH0_DOMAIN}/api/v2/users`
- Required scopes for user management: `create:users`, `read:users`
- Connection name for password auth: `"Username-Password-Authentication"`

## Database Patterns

### Upsert with optional relations

```typescript
await prisma.user.upsert({
  create: {
    email,
    projects: projectIds?.length
      ? { connect: projectIds.map((id) => ({ id })) }
      : undefined,
    tags: tags?.length ? { set: tags } : undefined,
  },
  where: { email },
  update: {
    projects: projectIds?.length
      ? { connect: projectIds.map((id) => ({ id })) }
      : undefined,
    tags: tags?.length ? { push: tags } : undefined,
  },
});
```

Note: `set` replaces all values, `push` appends to array fields.

## HTTP Requests

Use `undici` for HTTP requests in Node.js services:

```typescript
import { request } from "undici";

const response = await request(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(data),
});

const body = await response.body.json();
```
