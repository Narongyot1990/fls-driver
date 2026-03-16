# Repository Guidelines

## Project Structure & Module Organization
Core application code lives in `src/`. Use `src/app/` for App Router pages and API route handlers, `src/components/` for shared UI, `src/lib/` for utilities and auth/database helpers, `src/models/` for Mongoose schemas, `src/services/` for backend business logic, and `src/hooks/` for reusable client hooks. Static assets belong in `public/`. Utility scripts live in `scripts/`. Reference docs such as `PROJECT_STRUCTURE.md` and `CODEBASE_INDEX.md` describe deeper architecture when needed.

## Build, Test, and Development Commands
Run `npm run dev` to start the local Next.js server. Run `npm run build` to produce the production build and catch route or type issues surfaced during bundling. Run `npm run start` to serve the built app. Run `npm run lint` to apply the shared ESLint config from `eslint.config.mjs`. There is no dedicated test runner in `package.json` today, so linting and targeted manual verification are the default checks.

## Coding Style & Naming Conventions
This repo uses TypeScript with `strict` mode and the `@/*` import alias. Prefer `.ts` for logic and `.tsx` for React components. Follow the existing file naming patterns: `PascalCase` for React components and Mongoose models (`UserAvatar.tsx`, `Attendance.ts`), `camelCase` for hooks and utilities (`usePusher.ts`, `date-utils.ts`), and route folders that match URL structure under `src/app/`. Match the surrounding style in each file; most newer app code uses double quotes and semicolons.

## Testing Guidelines
Before opening a PR, run `npm run lint` and `npm run build`. For UI or workflow changes, manually verify the affected flows, especially role-based routes under `src/app/leader/`, `src/app/admin/`, and related API handlers in `src/app/api/`. If you add complex business logic, keep it in `src/services/` or `src/lib/` so it is easier to validate and extend with tests later.

## Commit & Pull Request Guidelines
Recent history favors Conventional Commit prefixes such as `feat:`, `fix:`, `refactor:`, and `style:`. Keep the subject specific, for example `fix: resolve ghost records in leader history`. Pull requests should include a short summary, impacted routes or modules, manual verification steps, linked issues if available, and screenshots for visible UI changes.

## Security & Configuration Tips
Secrets are environment-driven; do not hardcode credentials or tokens. Treat `.env.local` and deployment config as local-only inputs, and document any new variables in the PR. Changes touching auth, JWT helpers, MongoDB access, or upload paths should call out risk and rollback considerations explicitly.
