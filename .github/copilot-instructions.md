# Copilot Instructions for sando-website

## Project Overview

Vue 3 + TypeScript frontend for a home network IDS (Intrusion Detection System). Displays hosts, alerts, traffic stats, and threat scores from a separate backend API. Uses real-time updates via Socket.IO.

## Commands

- `npm run dev` — Start dev server on port 3030
- `npm run build` — Type-check with vue-tsc then build with Vite
- No test runner or linter is configured

## Architecture

```
src/
├── services/    — Axios API wrappers (one file per domain: hosts, alerts, stats, etc.)
├── stores/      — Pinia stores using Composition API (setup syntax)
├── types/       — TypeScript interfaces for API response shapes
├── views/       — Page-level components mapped to routes
├── components/  — UI components organized by feature (dashboard/, explore/, host-details/, etc.)
├── router/      — Vue Router with routes split into public, private, and error
├── plugins/     — Vuetify config with custom dark theme
├── constants/   — App-wide constants
└── utils/       — Small utility functions (date, debounce, filesize, protocol, svgLoader)
```

The backend API base URL is set via `VITE_API_BASE_URL` env var. All API calls go through `src/services/api.ts` which creates a shared Axios instance pointing to `${VITE_API_BASE_URL}/api`.

## Key Conventions

- **Composition API only** — All components and stores use `<script setup lang="ts">` and Pinia's setup store syntax (`defineStore("name", () => {...})`).
- **Path alias** — Use `@/` to reference `src/` (configured in vite.config.ts and tsconfig).
- **UI framework** — Vuetify 3 with Material Design Icons (`@mdi/font`). Use `v-` prefixed Vuetify components, not custom equivalents.
- **Theme colors** — Custom dark theme defined in `src/plugins/vuetify-plugin.ts` with named colors: `blush`, `orange`, `rose`, `burgundy`, `background-100`, `background-200`.
- **Service pattern** — Each service file exports individual async functions that call `api.get/post/put/delete`. Errors are caught, logged with `console.error`, and re-thrown.
- **Charts** — ApexCharts via `vue3-apexcharts`.
- **Routing** — IP addresses are used as route params for host detail pages (`/host/:ip_address`).
- **Global notifications** — Use `useNotificationStore()` to trigger snackbar notifications from anywhere.
