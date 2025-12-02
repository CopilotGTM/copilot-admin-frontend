# CopilotGTM Admin Frontend - Modularization Plan

## Executive Summary

This document outlines a comprehensive plan to modularize the CopilotGTM Admin Frontend codebase. The goal is to improve code organization, maintainability, scalability, and developer experience while keeping all existing functionality intact.

**Reference**: This plan aligns with the architecture pattern used in `copilot-app-frontend` which uses a `modules/` based structure.

---

## Table of Contents

1. [Current Structure Analysis](#current-structure-analysis)
2. [Issues with Current Structure](#issues-with-current-structure)
3. [Reference: copilot-app-frontend Architecture](#reference-copilot-app-frontend-architecture)
4. [Proposed Modular Architecture](#proposed-modular-architecture)
5. [Proposed Folder Structure (Tree)](#proposed-folder-structure-tree)
6. [Feature-Based Module Structure](#feature-based-module-structure)
7. [Migration Strategy](#migration-strategy)
8. [File Movement Mapping](#file-movement-mapping)
9. [Implementation Phases](#implementation-phases)

---

## Current Structure Analysis

### Current Folder Structure

```text
src/
├── middleware.ts
├── app/
│   ├── chakra-provider.tsx
│   ├── globals.css
│   ├── head.tsx
│   ├── layout.tsx
│   ├── providers.tsx
│   ├── utils.ts
│   ├── (auth)/
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── signin/page.tsx
│   ├── (root)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── organizations/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   ├── schemas/
│   │   ├── auth.ts
│   │   ├── organizations.ts
│   │   └── users.ts
│   └── stores/
│       └── use-auth-store.tsx
├── components/
│   ├── auth-provider.tsx
│   ├── custom-scrollbar.tsx
│   ├── markdown-renderer.tsx
│   ├── page-header.tsx
│   ├── password-input.tsx
│   ├── sidebar-close.tsx
│   ├── sidebar.tsx
│   ├── user-menu.tsx
│   ├── auth/
│   │   ├── forgot-password-card.tsx
│   │   ├── reset-password-card.tsx
│   │   └── signin-card.tsx
│   ├── HOC/
│   │   └── restQueryClientProvider/
│   └── organizations/
│       └── dialogs/
│           ├── create-org-dialog.tsx
│           ├── create-user-dialog.tsx
│           ├── edit-org-dialog.tsx
│           ├── edit-user-dialog.tsx
│           ├── view-org-dialog.tsx
│           └── view-user-dialog.tsx
├── ui/
│   ├── alert-dialog.tsx
│   ├── carousel.tsx
│   ├── color-mode.tsx
│   ├── custom-table.tsx
│   ├── loading-cursor.tsx
│   ├── prose.tsx
│   ├── toaster.tsx
│   └── tooltip.tsx
├── contexts/
├── core/
│   └── rest-client/
│       ├── rest-client.axios.ts
│       ├── rest-client.constant.ts
│       └── rest-client.tanStack.ts
└── lib/
    ├── auth.ts
    ├── CONSTANTS.ts
    ├── org-member.ts
    ├── organizations.ts
    ├── password.ts
    └── remember-me.ts
```

### Current Technology Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: Chakra UI v3
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod
- **Language**: TypeScript

---

## Issues with Current Structure

### 1. **Mixed Concerns in `lib/` folder**

- Contains API service functions, types, utility functions, and constants all mixed together
- `auth.ts` has both types and API calls
- `organizations.ts` and `org-member.ts` mix types with service functions

### 2. **Scattered Types/Interfaces**

- Types are defined inline within API service files
- Zod schemas in `app/schemas/` but related types in `lib/`
- No centralized type definitions

### 3. **Inconsistent Component Organization**

- Some components at root level (`sidebar.tsx`, `page-header.tsx`)
- Feature-specific components in feature folders (`components/organizations/`)
- UI components scattered between `components/ui/` and root

### 4. **Misplaced Schemas**

- Zod validation schemas in `app/schemas/` instead of with related features
- Should be co-located with their feature modules

### 5. **Store Location**

- Auth store in `app/stores/` instead of with auth feature module
- Should be in a centralized store location or within feature module

### 6. **No Hooks Folder**

- Custom hooks are embedded in components
- No extraction of reusable logic

### 7. **Core/Infrastructure Confusion**

- `rest-client` is in `core/` but query client provider is in `components/HOC/`
- Infrastructure code is not consolidated

### 8. **No Clear API Layer**

- API calls scattered in `lib/` files
- No clear separation between services, types, and utilities

---

## Reference: copilot-app-frontend Architecture

The `copilot-app-frontend` project uses a well-organized modular structure that we will follow:

```text
copilot-app-frontend/src/
├── middleware.ts
├── app/                    # Next.js App Router (routes only)
├── components/             # Shared/global components
├── core/                   # Core infrastructure
├── lib/                    # Utilities and helpers
├── modules/                # Feature modules ⭐ KEY PATTERN
├── tdeck/                  # Specialized module
└── types/                  # Global type definitions
```

### Key Patterns to Adopt

1. **`modules/` folder**: Contains feature-based modules (auth, organizations, users)
2. **`core/`**: Infrastructure code (API clients, providers)
3. **`components/`**: Shared components used across modules
4. **`lib/`**: Utility functions and helpers
5. **`types/`**: Global TypeScript type definitions

This aligns the admin frontend with the main app's architecture for consistency across the codebase.

---

## Proposed Modular Architecture

### Architecture Principles

1. **Feature-First Organization**: Group code by feature/domain
2. **Separation of Concerns**: Clear boundaries between layers
3. **Co-location**: Keep related code together
4. **Scalability**: Easy to add new features
5. **Discoverability**: Easy to find code
6. **Consistency**: Match `copilot-app-frontend` architecture

### Layer Definitions

| Layer | Purpose | Examples |
|-------|---------|----------|
| `modules/` | Feature modules with all related code | auth, organizations, users |
| `components/` | Shared/reusable components across modules | ui, layout components |
| `core/` | Application infrastructure | API client, query client, providers |
| `lib/` | Utilities, helpers, and shared logic | formatters, validators |
| `types/` | Global type definitions | API response types, common types |

---

## Proposed Folder Structure (Tree)

```text
src/
├── middleware.ts
│
├── app/                                    # Next.js App Router (routes only)
│   ├── globals.css
│   ├── layout.tsx
│   ├── favicon.ico
│   │
│   ├── (auth)/                             # Auth route group
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   └── signin/
│   │       └── page.tsx
│   │
│   └── (root)/                             # Main app route group
│       ├── layout.tsx
│       ├── page.tsx
│       └── organizations/
│           ├── page.tsx
│           └── [id]/
│               └── page.tsx
│
├── core/                                   # Application infrastructure
│   ├── api/
│   │   ├── axios-instance.ts               # Axios instance with interceptors
│   │   ├── query-client.ts                 # TanStack Query client
│   │   └── index.ts
│   │
│   ├── providers/
│   │   ├── app-providers.tsx               # Combined providers wrapper
│   │   ├── chakra-provider.tsx             # Chakra UI provider
│   │   ├── query-provider.tsx              # React Query provider
│   │   └── index.ts
│   │
│   └── guards/
│       ├── auth-guard.tsx                  # Auth protection wrapper
│       └── index.ts
│
├── modules/                                # Feature modules ⭐ (matches copilot-app-frontend)
│   │
│   ├── auth/                               # Authentication module
│   │   ├── api/
│   │   │   ├── auth.api.ts                 # Auth API service functions
│   │   │   ├── password.api.ts             # Password reset API
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── signin-card.tsx
│   │   │   ├── forgot-password-card.tsx
│   │   │   ├── reset-password-card.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── use-login.ts                # Login mutation hook
│   │   │   ├── use-forgot-password.ts
│   │   │   ├── use-reset-password.ts
│   │   │   └── index.ts
│   │   ├── schemas/
│   │   │   ├── login.schema.ts
│   │   │   ├── forgot-password.schema.ts
│   │   │   ├── reset-password.schema.ts
│   │   │   └── index.ts
│   │   ├── store/
│   │   │   ├── auth.store.ts               # Zustand auth store
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── auth.types.ts               # Auth-specific types
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── remember-me.ts              # Remember me utility
│   │   │   └── index.ts
│   │   └── index.ts                        # Module barrel export
│   │
│   ├── organizations/                      # Organizations module
│   │   ├── api/
│   │   │   ├── organizations.api.ts        # Org CRUD API
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── org-list/
│   │   │   │   └── org-list.tsx            # Organization list view
│   │   │   ├── org-details/
│   │   │   │   └── org-details.tsx         # Organization details view
│   │   │   ├── dialogs/
│   │   │   │   ├── create-org-dialog.tsx
│   │   │   │   ├── edit-org-dialog.tsx
│   │   │   │   ├── view-org-dialog.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── use-organizations.ts        # List orgs query
│   │   │   ├── use-organization.ts         # Single org query
│   │   │   ├── use-create-organization.ts  # Create mutation
│   │   │   ├── use-update-organization.ts  # Update mutation
│   │   │   ├── use-delete-organization.ts  # Delete mutation
│   │   │   └── index.ts
│   │   ├── schemas/
│   │   │   ├── organization.schema.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── organization.types.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   └── users/                              # Users module
│       ├── api/
│       │   ├── users.api.ts                # User CRUD API
│       │   └── index.ts
│       ├── components/
│       │   ├── user-list/
│       │   │   └── users-section.tsx       # Users section component
│       │   ├── dialogs/
│       │   │   ├── create-user-dialog.tsx
│       │   │   ├── edit-user-dialog.tsx
│       │   │   ├── view-user-dialog.tsx
│       │   │   └── index.ts
│       │   └── index.ts
│       ├── hooks/
│       │   ├── use-users.ts
│       │   ├── use-create-user.ts
│       │   ├── use-update-user.ts
│       │   └── index.ts
│       ├── schemas/
│       │   ├── user.schema.ts
│       │   └── index.ts
│       ├── types/
│       │   ├── user.types.ts
│       │   └── index.ts
│       └── index.ts
│
├── components/                             # Shared components (matches copilot-app-frontend)
│   ├── layout/
│   │   ├── sidebar/
│   │   │   ├── sidebar.tsx
│   │   │   ├── sidebar-close.tsx
│   │   │   ├── nav-item.tsx
│   │   │   └── index.ts
│   │   ├── page-header.tsx
│   │   ├── user-menu.tsx
│   │   └── index.ts
│   ├── ui/
│   │   ├── alert-dialog.tsx
│   │   ├── carousel.tsx
│   │   ├── color-mode.tsx
│   │   ├── custom-table.tsx
│   │   ├── loading-cursor.tsx
│   │   ├── password-input.tsx
│   │   ├── prose.tsx
│   │   ├── toaster.tsx
│   │   ├── tooltip.tsx
│   │   └── index.ts
│   ├── custom-scrollbar.tsx
│   ├── markdown-renderer.tsx
│   └── index.ts
│
├── lib/                                    # Utilities and helpers
│   ├── utils/
│   │   ├── format-date.ts                  # Date formatting utilities
│   │   └── index.ts
│   └── index.ts
│
└── types/                                  # Global types
    ├── api.types.ts                        # Generic API response types
    ├── constants.ts                        # App constants
    └── index.ts
```

---

## Feature-Based Module Structure

Each module follows this pattern (consistent with `copilot-app-frontend`):

```text
module-name/
├── api/                    # API service functions
│   ├── module.api.ts       # API calls
│   └── index.ts
├── components/             # Module-specific components
│   ├── ComponentA.tsx
│   ├── ComponentB.tsx
│   └── index.ts
├── hooks/                  # Module-specific hooks
│   ├── use-module.ts       # Query hooks
│   └── index.ts
├── schemas/                # Zod validation schemas
│   ├── module.schema.ts
│   └── index.ts
├── store/                  # Zustand store (if needed)
│   ├── module.store.ts
│   └── index.ts
├── types/                  # Module-specific types
│   ├── module.types.ts
│   └── index.ts
├── utils/                  # Module-specific utilities
│   └── index.ts
└── index.ts               # Barrel export
```

### Benefits of Module-Based Structure

1. **Self-contained modules**: Each module has everything it needs
2. **Easy code navigation**: Find related code quickly
3. **Clear boundaries**: Prevents coupling between modules
4. **Scalable**: Add new modules without touching existing code
5. **Testable**: Easy to write tests for isolated modules
6. **Consistent**: Matches `copilot-app-frontend` architecture

---

## Migration Strategy

### Phase 1: Foundation Setup (Non-Breaking)

1. Create new folder structure (`core/`, `modules/`, `components/`, `lib/`, `types/`)
2. Create barrel export files (`index.ts`)
3. No file movements yet

### Phase 2: Core Infrastructure

1. Move API clients to `core/api/`
2. Move providers to `core/providers/`
3. Move auth guard to `core/guards/`
4. Update imports

### Phase 3: Shared Components

1. Move UI components to `components/ui/`
2. Move layout components to `components/layout/`
3. Update imports

### Phase 4: Auth Module

1. Create `modules/auth/` module
2. Move auth API, components, store, schemas
3. Create custom hooks for auth operations
4. Update imports

### Phase 5: Organizations Module

1. Create `modules/organizations/` module
2. Move org API, components, types
3. Create custom hooks for org operations
4. Update imports

### Phase 6: Users Module

1. Create `modules/users/` module
2. Move user API, components, types
3. Create custom hooks for user operations
4. Update imports

### Phase 7: Cleanup

1. Remove old folders
2. Update all remaining imports
3. Run full test suite
4. Final code review

---

## File Movement Mapping

### Core/Infrastructure

| Current Location | New Location |
|-----------------|--------------|
| `src/core/rest-client/rest-client.axios.ts` | `src/core/api/axios-instance.ts` |
| `src/core/rest-client/rest-client.tanStack.ts` | `src/core/api/query-client.ts` |
| `src/core/rest-client/rest-client.constant.ts` | `src/types/constants.ts` |
| `src/app/providers.tsx` | `src/core/providers/app-providers.tsx` |
| `src/app/chakra-provider.tsx` | `src/core/providers/chakra-provider.tsx` |
| `src/components/HOC/restQueryClientProvider/` | `src/core/providers/query-provider.tsx` |
| `src/components/auth-provider.tsx` | `src/core/guards/auth-guard.tsx` |

### Auth Module

| Current Location | New Location |
|-----------------|--------------|
| `src/lib/auth.ts` | `src/modules/auth/api/auth.api.ts` + `src/modules/auth/types/auth.types.ts` |
| `src/lib/password.ts` | `src/modules/auth/api/password.api.ts` |
| `src/lib/remember-me.ts` | `src/modules/auth/utils/remember-me.ts` |
| `src/app/schemas/auth.ts` | `src/modules/auth/schemas/` (split into login, forgot, reset) |
| `src/app/stores/use-auth-store.tsx` | `src/modules/auth/store/auth.store.ts` |
| `src/components/auth/signin-card.tsx` | `src/modules/auth/components/signin-card.tsx` |
| `src/components/auth/forgot-password-card.tsx` | `src/modules/auth/components/forgot-password-card.tsx` |
| `src/components/auth/reset-password-card.tsx` | `src/modules/auth/components/reset-password-card.tsx` |

### Organizations Module

| Current Location | New Location |
|-----------------|--------------|
| `src/lib/organizations.ts` | `src/modules/organizations/api/organizations.api.ts` + `src/modules/organizations/types/organization.types.ts` |
| `src/app/schemas/organizations.ts` | `src/modules/organizations/schemas/organization.schema.ts` |
| `src/components/organizations/dialogs/create-org-dialog.tsx` | `src/modules/organizations/components/dialogs/create-org-dialog.tsx` |
| `src/components/organizations/dialogs/edit-org-dialog.tsx` | `src/modules/organizations/components/dialogs/edit-org-dialog.tsx` |
| `src/components/organizations/dialogs/view-org-dialog.tsx` | `src/modules/organizations/components/dialogs/view-org-dialog.tsx` |

### Users Module

| Current Location | New Location |
|-----------------|--------------|
| `src/lib/org-member.ts` | `src/modules/users/api/users.api.ts` + `src/modules/users/types/user.types.ts` |
| `src/app/schemas/users.ts` | `src/modules/users/schemas/user.schema.ts` |
| `src/components/organizations/dialogs/create-user-dialog.tsx` | `src/modules/users/components/dialogs/create-user-dialog.tsx` |
| `src/components/organizations/dialogs/edit-user-dialog.tsx` | `src/modules/users/components/dialogs/edit-user-dialog.tsx` |
| `src/components/organizations/dialogs/view-user-dialog.tsx` | `src/modules/users/components/dialogs/view-user-dialog.tsx` |

### Shared Components

| Current Location | New Location |
|-----------------|--------------|
| `src/components/sidebar.tsx` | `src/components/layout/sidebar/sidebar.tsx` |
| `src/components/sidebar-close.tsx` | `src/components/layout/sidebar/sidebar-close.tsx` |
| `src/components/page-header.tsx` | `src/components/layout/page-header.tsx` |
| `src/components/user-menu.tsx` | `src/components/layout/user-menu.tsx` |
| `src/components/password-input.tsx` | `src/components/ui/password-input.tsx` |
| `src/components/custom-scrollbar.tsx` | `src/components/custom-scrollbar.tsx` |
| `src/components/markdown-renderer.tsx` | `src/components/markdown-renderer.tsx` |
| `src/components/ui/*` | `src/components/ui/*` (reorganize) |

### Utilities & Constants

| Current Location | New Location |
|-----------------|--------------|
| `src/lib/CONSTANTS.ts` | `src/types/constants.ts` |

---

## Implementation Phases

### Phase 1: Foundation (Estimated: 1-2 hours)

- [ ] Create folder structure
- [ ] Create all `index.ts` barrel files
- [ ] No functionality changes

### Phase 2: Core Infrastructure (Estimated: 2-3 hours)

- [ ] Migrate API infrastructure
- [ ] Migrate providers
- [ ] Migrate auth guard
- [ ] Update imports in affected files
- [ ] Test: Login, navigation, API calls

### Phase 3: Shared Components (Estimated: 2-3 hours)

- [ ] Migrate UI components
- [ ] Migrate layout components
- [ ] Update imports
- [ ] Test: All UI interactions

### Phase 4: Auth Module (Estimated: 3-4 hours)

- [ ] Create auth module structure
- [ ] Migrate API services
- [ ] Migrate components
- [ ] Migrate store
- [ ] Migrate schemas
- [ ] Create custom hooks
- [ ] Update page imports
- [ ] Test: Login, logout, forgot password, reset password

### Phase 5: Organizations Module (Estimated: 3-4 hours)

- [ ] Create organizations module structure
- [ ] Migrate API services
- [ ] Migrate components
- [ ] Migrate schemas
- [ ] Create custom hooks
- [ ] Update page imports
- [ ] Test: List, create, edit, delete organizations

### Phase 6: Users Module (Estimated: 3-4 hours)

- [ ] Create users module structure
- [ ] Migrate API services
- [ ] Migrate components
- [ ] Migrate schemas
- [ ] Create custom hooks
- [ ] Update page imports
- [ ] Test: List, create, edit users

### Phase 7: Cleanup & Verification (Estimated: 2-3 hours)

- [ ] Remove old folders
- [ ] Final import verification
- [ ] Run linting
- [ ] Run type checking
- [ ] Full E2E test
- [ ] Documentation update

### Total Estimated Time: 16-24 hours

---

## Example: Custom Hooks Pattern

### Before (Inline in component)

```tsx
// In organizations/page.tsx
const { data, isLoading } = useQuery({
  queryKey: ["organizations", { limit: 50 }],
  queryFn: () => listOrganizations({ limit: 50 }),
});

const createOrgMutation = useMutation({
  mutationFn: (payload) => createOrganization(payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["organizations"] });
  },
});
```

### After (Extracted hook)

```tsx
// modules/organizations/hooks/use-organizations.ts
export function useOrganizations(params: { limit?: number } = {}) {
  return useQuery({
    queryKey: organizationKeys.list(params),
    queryFn: () => organizationsApi.list(params),
  });
}

// modules/organizations/hooks/use-create-organization.ts
export function useCreateOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: organizationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.all });
    },
  });
}

// Usage in page
const { data, isLoading } = useOrganizations({ limit: 50 });
const createMutation = useCreateOrganization();
```

---

## Naming Conventions

### Files

- Components: `PascalCase.tsx` or `kebab-case.tsx`
- Hooks: `use-module-name.ts`
- Types: `module.types.ts`
- API: `module.api.ts`
- Schemas: `module.schema.ts`
- Store: `module.store.ts`

### Exports

- Named exports preferred over default exports
- Barrel exports via `index.ts`

### Query Keys

```typescript
// modules/organizations/hooks/keys.ts
export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  list: (params: ListParams) => [...organizationKeys.lists(), params] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
};
```

---

## Final Notes

### What Will Change

- Folder structure and file locations
- Import paths
- Code organization

### What Will NOT Change

- Functionality
- Component behavior
- API contracts
- User experience

### Rollback Strategy

- Keep git branches for each phase
- Each phase should be independently deployable
- Full rollback possible by reverting to pre-migration commit

---

## Architecture Comparison

### Before vs After (Side by Side)

| Before (Current) | After (Proposed) |
|------------------|------------------|
| `src/lib/auth.ts` | `src/modules/auth/api/auth.api.ts` |
| `src/lib/organizations.ts` | `src/modules/organizations/api/organizations.api.ts` |
| `src/app/schemas/auth.ts` | `src/modules/auth/schemas/login.schema.ts` |
| `src/app/stores/use-auth-store.tsx` | `src/modules/auth/store/auth.store.ts` |
| `src/components/auth/*` | `src/modules/auth/components/*` |
| `src/components/organizations/*` | `src/modules/organizations/components/*` |
| `src/components/ui/*` | `src/components/ui/*` |
| `src/components/sidebar.tsx` | `src/components/layout/sidebar/sidebar.tsx` |

### Consistency with copilot-app-frontend

| copilot-app-frontend | copilot-admin-frontend (proposed) |
|---------------------|-----------------------------------|
| `src/modules/` | `src/modules/` ✅ |
| `src/components/` | `src/components/` ✅ |
| `src/core/` | `src/core/` ✅ |
| `src/lib/` | `src/lib/` ✅ |
| `src/types/` | `src/types/` ✅ |

---

## Approval Required

Before proceeding with implementation, please review and confirm:

1. ✅ Proposed folder structure
2. ✅ Feature module organization
3. ✅ Implementation phases
4. ✅ Estimated timeline

**Ready to proceed?** Reply with confirmation and we'll start with Phase 1.
