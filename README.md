This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# gtm-platform-website-frontend

This repository contains a Next.js 13 (App Router) project with TypeScript, ESLint, Zustand, React Query, Material UI (MUI), Jest for unit/integration tests, and Playwright for E2E tests.

## Project Structure

```plaintext
gtm-platform-website-frontend/
├─ .eslintrc.json
├─ .gitignore
├─ jest.config.js         # or jest.config.ts
├─ playwright.config.ts
├─ package.json
├─ tsconfig.json
├─ yarn.lock
├─ public/                # Static assets (images, icons, etc.)
├─ src/
│  ├─ app/                # Next.js App Router
│  │  ├─ layout.tsx       # Global layout (header, footer, etc.)
│  │  ├─ page.tsx         # Default root page
│  │  └─ ...              # Additional routes, e.g. (blog)/page.tsx
│  ├─ components/         # Shared React components
│  ├─ hooks/              # Custom hooks (React Query, Zustand, etc.)
│  ├─ services/           # API calls (REST, GraphQL, etc.)
│  │  ├─ userService.ts   # Example: user-related API functions
│  │  ├─ authService.ts   # Example: auth-related API functions
│  │  └─ ...
│  ├─ state/              # Zustand stores (global client-side state)
│  ├─ styles/             # MUI themes, global styles, etc.
│  ├─ utils/              # Utility functions or libs
│  └─ ...
├─ tests/                 # Jest unit/integration test files (optional)
└─ e2e/                   # Playwright E2E test files (optional)


	•	src/app/
This folder leverages the Next.js 13 App Router. You’ll typically create one layout.tsx per route segment to handle shared UI elements (like nav bars, footers, etc.). Each top-level directory under app/ corresponds to a route (e.g., app/about/page.tsx → /about).
	•	src/services/
Centralized location for API calls. Each file (e.g., userService.ts, authService.ts) contains functions that hit your backend endpoints. If you’re using React Query, these service functions can be imported into custom hooks.
	•	src/state/
Any global client-side state managed by Zustand. For example, useStore.ts files or other store slices.
	•	src/hooks/
Custom React hooks. Commonly used for logic that combines React Query calls and/or Zustand stores.
	•	src/styles/
MUI theme definitions, global CSS, or other style-related config.
	•	tests/
(Optional) Directory for Jest unit/integration test files. Some prefer co-locating tests with their components (e.g., a __tests__ folder right next to a component).
	•	e2e/
(Optional) Directory for Playwright test specs. By default, yarn create playwright creates a tests/ folder, but you can rename it to e2e/ or anything else you prefer.
```
