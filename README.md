# Stride – Issue Manager

A modern project management app built with React 19, TypeScript, and Material UI v9.

## Features

- **Kanban Board** – drag & drop task cards across columns (dnd kit)
- **Backlog** – list view with filtering and sprint planning
- **Task Detail** – rich text description (TipTap editor), assignee, priority, due date, subtasks, comments, worklog
- **Dashboard** – project overview and statistics
- **My Work** – personal task inbox
- **Team** – member management with roles and invite flow
- **Reports** – project progress and metrics
- **Authentication** – JWT-based login with protected routes

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 + TypeScript (strict) |
| Component Library | Material UI v9 |
| Date Pickers | @mui/x-date-pickers v9 + dayjs |
| Server State | TanStack Query v5 |
| Client State | Zustand v5 |
| Routing | React Router v7 |
| Forms & Validation | React Hook Form v7 + Zod v4 |
| Rich Text Editor | TipTap v3 |
| Drag & Drop | dnd kit |
| HTTP Client | Axios |
| Build Tool | Vite + esbuild |
| Package Manager | Yarn v4 (PnP) |

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn 4 (`corepack enable`)
- Backend API running at `http://localhost:8080` (Spring Boot), or mock data is used automatically

### Installation

```bash
yarn install
```

### Development

```bash
yarn dev
```

App runs at `http://localhost:5173`.

### Build

```bash
yarn build
```

### Lint & Type Check

```bash
yarn lint
yarn build   # tsc -b runs as part of build
```

### E2E Tests (Playwright)

Pre-requisite (one-time): `yarn playwright install chromium`.

E2E suite expects both BE (`:8080`) and FE (`:5173`) to be running.

```bash
yarn e2e        # headless
yarn e2e:ui     # Playwright UI mode (debug)
```

Scénáře jsou v `e2e/` (Playwright spec) a `docs/test-scenarios/` (lidsky čitelný popis).

## Project Structure

```
src/
├── api/          # Axios instance + API clients (one file per resource)
├── components/   # Shared reusable components (editor, icons, ui)
├── layouts/      # AppLayout, sidebar, global header
├── pages/        # Route-mapped pages (board, backlog, dashboard, ...)
├── store/        # Zustand slices (auth, ui)
├── types/        # TypeScript interfaces and enums
├── mocks/        # Mock data for development without backend
├── theme.ts      # MUI createTheme — all design tokens live here
└── main.tsx      # Entry point
```

## Backend Integration

The app connects to a Spring Boot REST API with JWT authentication. Every request includes a `Bearer` token in the `Authorization` header (managed by the Axios instance in `src/api/`).

When the backend is unavailable, all data falls back to mock fixtures in `src/mocks/`.

## License

MIT — see [LICENSE](LICENSE).