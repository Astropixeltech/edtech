# Architecture Audit & Resolution Report

**Project:** AstroPixel Learn (AlphaZero Education)  
**Date:** September 4, 2026  
**Status:** Resolved & Verified (`tsc && vite build` passing)

---

## Executive Summary

An in-depth codebase audit verified that the project was suffering from severe architectural drift. The codebase had become fragmented across **three competing stacks**:
1. The **original documented foundation** (React SPA + Vite + Supabase PostgreSQL with 62 migrations and 31 Edge Functions).
2. An **incomplete Next.js / NextAuth / Prisma layer** (with a MySQL schema and monkey-patched routers).
3. An **unfinished Firebase migration layer** (which replaced the real Supabase client with a mock dummy client that silently broke 34 UI features).

All conflicting layers have been eliminated, the real Supabase client and AuthContext have been restored, package scripts and TypeScript configurations have been returned to standard Vite conventions, and the entire application now builds cleanly with zero TypeScript errors.

---

## 1. Problems the Application Previously Held

### Problem 1: Competing Frameworks & Broken Package Scripts
- **The Issue:** `package.json` had `"dev": "next dev"` and `"build": "prisma generate && next build"`, while `index.html` and `vite.config.ts` were configured for a Vite React SPA mounting `src/main.tsx` and `src/App.tsx`.
- **Impact:** Running `npm run dev` or `npm run build` tried to boot Next.js rather than the actual Vite application.

### Problem 2: Hijacked Router & Parallel Next.js App Tree
- **The Issue:** A parallel `src/app/` directory existed with a catch-all route `[...slug]/page.tsx` importing React views dynamically with `{ ssr: false }`.
- **Impact:** `tsconfig.json` was configured to map `"react-router-dom"` to `src/lib/router-adapter.tsx`, intercepting all standard routing and mounting individual `MemoryRouter` instances per page.

### Problem 3: Conflicting Database Schemas (MySQL Prisma vs. Postgres Supabase)
- **The Issue:** `prisma/schema.prisma` defined a MySQL schema (`User`, `Role` enum, `CourseSection`, `Lesson`, `Enrollment`, `Order`, `Payment`).
- **Impact:** This schema directly contradicted the 62 PostgreSQL migrations and 47 Supabase tables (`profiles`, `user_roles`, `courses`, `course_modules`, `videos`, `student_courses`). Moreover, `src/lib/prisma.ts` created a client-side mock proxy (`mockPrisma`) that returned fake IDs (`mock-123456...`), so any code calling Prisma in the browser silently faked data operations and saved nothing to any real database.

### Problem 4: Dummy Supabase Client Breaking 34 Features Silently
- **The Issue:** `src/integrations/supabase/client.ts` was replaced with a hardcoded mock object:
  ```ts
  // Fallback dummy client to prevent crashes while migrating to Firebase
  export const supabase = {
    auth: { ... },
    from: () => ({
      select: () => ({ limit: async () => ({ data: [], error: null }) }),
      insert: async () => ({ data: null, error: null }),
      ...
    })
  } as any;
  ```
- **Impact:** Over 34 components (Student Chat, Lesson Comments, Teacher Tickets, Coupon Management, Email Inbox, Teacher Management, etc.) called `supabase.from(...)`. Because this dummy client returned empty arrays and fake success responses, user comments, tickets, notices, and course management appeared to "succeed" in the UI while persisting nothing.

### Problem 5: Split Authentication & Role Escalation Hazards
- **The Issue:** `src/contexts/AuthContext.tsx` was rewritten to authenticate against Firebase Auth and query Firestore for profiles/roles, while the database, storage, RLS policies, and Edge Functions expected Supabase JWTs and PostgreSQL `user_roles`.
- **Impact:** Firestore role documents could not authenticate against Supabase Edge Functions or PostgREST endpoints protected by Supabase RLS policies.

### Problem 6: Hardcoded Fallback Secrets & Credentials
- **The Issue:** Source code contained multiple hardcoded secrets and demo credentials:
  - `middleware.ts`: `process.env.NEXTAUTH_SECRET || 'alphazero-lms-super-secret-key-2026'`
  - `src/lib/auth.ts`: hardcoded test logins (`admin@astropixel.online` / `admin123`, `teacher@astropixel.online` / `teacher123`, `student@astropixel.online` / `student123`).
  - `src/lib/seedAccounts.ts`: passwords `Admin@2026!`, `Teacher@2026!`, `Student@2026!`.
  - `src/integrations/firebase/config.ts`: hardcoded Firebase API keys.

### Problem 7: Stray & Ad-Hoc Scripts in Project Root
- **The Issue:** The repository root contained unmaintained, experimental scripts (`fixRoles.ts`, `fix_imports.cjs`, `migrate.py`, `removeSetup.cjs`, `runSeed.ts`, `search_supabase.js`, `scripts/revert.cjs`).

---

## 2. Solutions Implemented

### Solution 1: Consolidated Build & Dev Scripts to Vite
- Updated `package.json` scripts:
  - `"dev": "vite"`
  - `"build": "tsc && vite build"`
  - `"preview": "vite preview"`
  - `"lint": "eslint ."`
- Removed unused packages from `dependencies` and `devDependencies` (`@prisma/client`, `prisma`, `next`, `next-auth`, `bcryptjs`, `@types/bcryptjs`, `firebase`).
- Re-ran `npm install` to ensure clean node_modules and native Vite CLI binaries.

### Solution 2: Restored Clean TypeScript Configuration
- Restored `tsconfig.json` to properly reference `tsconfig.app.json` and `tsconfig.node.json`.
- Removed the router hijacking alias (`"react-router-dom": ["./src/lib/router-adapter.tsx"]`).
- Fixed deprecated `baseUrl` options for modern TypeScript bundler resolution.

### Solution 3: Removed Competing Next.js / Prisma / NextAuth Layers
- Permanently removed:
  - `src/app/` (all Next.js route handlers, layouts, and server actions)
  - `middleware.ts` (NextAuth middleware with fallback secret)
  - `src/lib/auth.ts` (NextAuth options with hardcoded credentials)
  - `src/lib/prisma.ts` & `prisma/` (mock Prisma client and MySQL schema)
  - `src/lib/payment.ts` (unused Prisma payment service)
  - `src/lib/router-adapter.tsx` & `src/components/AppRouterWrapper.tsx`
  - `next-env.d.ts`
- Cleaned `src/views/LearnContactPage.tsx` to remove dependencies on `@/app/actions/contact`.

### Solution 4: Restored Real Supabase Client with Strong Typing
- Replaced the mock client in `src/integrations/supabase/client.ts` with the authentic `@supabase/supabase-js` client typed against the generated `Database` schema in `src/integrations/supabase/types.ts`:
  ```ts
  import { createClient } from '@supabase/supabase-js';
  import type { Database } from './types';
  import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/lib/env';

  export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  });
  ```
- Updated `src/lib/env.ts` to be SSR- and browser-safe across Vite (`import.meta.env`) and Node (`process.env`).

### Solution 5: Restored Supabase Authentication & Role Authority
- Replaced Firebase Auth in `src/contexts/AuthContext.tsx` with native Supabase Auth:
  - Session initialization via `supabase.auth.getSession()` and realtime listener via `supabase.auth.onAuthStateChange()`.
  - Credentials sign-in via `supabase.auth.signInWithPassword()`.
  - User sign-up via `supabase.auth.signUp()` with automatic profile and `user_roles` insertion.
  - Role resolution directly querying `public.user_roles` (`has_role`).
- Restored hooks (`useCourses`, `useStudentCourses`, `useLiveClasses`, `usePublicCourses`, `useTeacherData`, etc.) to query Supabase PostgreSQL tables and Realtime channels.
- Deleted `src/integrations/firebase` and cleaned `src/lib/seedAccounts.ts` to use Supabase.

### Solution 6: Purged Temporary Scripts & Secrets
- Removed stray scripts: `fixRoles.ts`, `fix_imports.cjs`, `migrate.py`, `removeSetup.cjs`, `runSeed.ts`, `search_supabase.js`, and `scripts/`.
- Fixed login password visibility toggles (`Eye` / `EyeOff`) with correct JSX boolean attributes.

---

## 3. Verification & Results

1. **TypeScript Typecheck (`npx tsc --noEmit`):**
   - **Result:** PASSED with 0 errors.
2. **Production Build (`npm run build` -> `tsc && vite build`):**
   - **Result:** PASSED with 0 errors.
   - Built 3,967 transformed modules into optimized bundles in `dist/` within ~22 seconds.
3. **Dev Server Verification:**
   - Server configured on port `8088` via `vite.config.ts`.
