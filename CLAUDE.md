# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Code-type is a typing test application for code snippets, built with TanStack Start (full-stack React framework) and a PostgreSQL backend via Drizzle ORM.

## Commands

```bash
# Development
pnpm dev          # Start dev server on port 3000
pnpm build        # Production build
pnpm preview      # Preview production build

# Testing
pnpm test         # Run Vitest tests

# Code Quality
pnpm lint         # Run ESLint
pnpm format       # Run Prettier
pnpm check        # Run Prettier and ESLint with auto-fix

# Database (Drizzle)
pnpm db:generate  # Generate migrations from schema changes
pnpm db:migrate   # Run migrations
pnpm db:push      # Push schema directly to database (dev)
pnpm db:pull      # Pull schema from database
pnpm db:studio    # Open Drizzle Studio GUI
```

## Architecture

### Tech Stack
- **Framework**: TanStack Start (SSR-capable React with file-based routing)
- **Routing**: TanStack Router with file-based routes in `src/routes/`
- **Data Fetching**: TanStack Query with SSR integration
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS v4 with shadcn/ui components (new-york style)
- **Forms**: TanStack Form
- **Tables**: TanStack Table
- **Compiler**: React Compiler (babel-plugin-react-compiler)

### Directory Structure
- `src/routes/` - File-based routes; `__root.tsx` is the app shell
- `src/components/ui/` - shadcn/ui components
- `src/components/` - App-level components
- `src/db/` - Drizzle schema and database connection
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utilities (includes shadcn `cn()` helper)
- `src/integrations/` - Framework integrations (TanStack Query provider)
- `features/` - Feature specifications with `feature.json` files defining status, dependencies, and priorities

### Routing Conventions
- Routes are auto-generated from files in `src/routes/`
- API routes use `.ts` extension (e.g., `api.names.ts` creates `/api/names`)
- Page routes use `.tsx` extension
- The route tree is generated at `src/routeTree.gen.ts`

### Path Aliases
Use `@/*` to import from `src/*` (configured in tsconfig.json).

### Adding shadcn Components
```bash
pnpm dlx shadcn@latest add <component-name>
```

## Key Patterns

- Router is created in `src/router.tsx` and wraps the app with TanStack Query provider
- Database schema is defined in `src/db/schema.ts`
- Environment variables: `DATABASE_URL` is required for PostgreSQL connection
- Demo files (prefixed with `demo`) are example code that can be safely removed
