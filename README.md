# Twisted's Command Center

A production-ready inventory management dashboard built with the NEXUS dark aesthetic. Track inventory, monitor stock levels, and manage items through a visually striking, responsive interface.

## Tech Stack

- **React 19** + **TypeScript** — Type-safe component architecture
- **Vite 8** — Lightning-fast build tooling
- **Tailwind CSS 4** — Utility-first styling with NEXUS dark theme
- **Vitest** + **Testing Library** — Component and hook testing

## Getting Started

> **Requires Node.js `^20.19.0` or `>=22.12.0`** (Vite 8 requirement)

```bash
npm install
npm run dev
```

## Scripts

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Start development server       |
| `npm run build`   | Type-check and production build |
| `npm run preview` | Preview production build       |
| `npm run lint`    | Run ESLint                     |
| `npm test`        | Run tests                      |

## Project Structure

```
src/
  types/          # TypeScript interfaces
  data/           # Mock inventory data
  hooks/          # Custom React hooks (useInventory)
  components/
    Layout/       # Sidebar, Header, Layout wrapper
    Dashboard/    # Stats cards, recent activity
    Inventory/    # Inventory table, add item modal, status badges
  __tests__/      # Unit tests
```
