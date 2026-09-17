# Architecture — Astropixel Learn EdTech

## Overall
Decoupled SPA + BaaS.

```
   ┌────────────────────┐         ┌────────────────────────┐
   │  React SPA (Vite)  │  HTTPS  │  Supabase (Lovable Cloud) │
   │  Vercel / Netlify  │◀───────▶│  Postgres · Auth · Storage │
   └────────────────────┘         │  Realtime · Edge Functions │
            │                     └────────────────────────┘
            │  Cloudinary (signed uploads for video/large media)
            │  UddoktaPay (payments)  ·  Resend (email)  ·  Telegram (notify)
```

Frontend can be redeployed anywhere; backend persists independently (see `mem://technical/architecture-decoupling-v1`).

## Frontend Architecture
- `main.tsx` → `<App />` inside `QueryClientProvider`, `ThemeProvider`, `LanguageProvider`, `AuthProvider`, `TooltipProvider`, `BrowserRouter`.
- `App.tsx` computes LMS-route flag, mounts Preloader / SmoothScroll / ScrollReveal only on marketing routes, wraps routes in `AnimatePresence` fade.
- Route table lives in `App.tsx`. `/`, `/about`, `/contact` swap components when hostname starts with `learn.`.

## Component Architecture
- `components/ui/*` – primitive shadcn/Radix components (never edited to add business logic).
- `components/admin|student|teacher|live/*` – feature modules mounted inside dashboard tabs.
- Top-level `components/*` – shared shell (Navbar, Footer, Preloader, ScrollToTop, PageTransition, SecureVideoPlayer, SearchModal, AIChatbot).

## State & Data
- Server state → **@tanstack/react-query** via hooks in `src/hooks/`.
- Auth session → `AuthContext` (subscribes to Supabase `onAuthStateChange`).
- Language → `LanguageContext` (localStorage-persisted).
- Site scope (main vs learn) → `SiteScopeContext` / `AdminSiteScopeContext`.

## Authentication Flow
1. User submits phone + password / email OTP on `/student/login|/teacher/login|/admin/login`.
2. Supabase Auth issues JWT → stored in browser via supabase-js.
3. `AuthContext` fetches role from `public.user_roles` via `has_role()` SECURITY DEFINER function.
4. Route guards redirect based on role hierarchy: **admin > teacher > student**.
5. Cloudflare Turnstile validated on signup, phone required, disposable-email domains blocked.

## Request Flow
Client → supabase-js → PostgREST (RLS enforced) → Postgres. For custom logic → Edge Function → returns JSON. Server-only secrets never leave Edge Functions.

## Database Flow
See [`Database.md`](./Database.md). All 47 public tables have RLS + GRANTs. Role checks always via `has_role(auth.uid(), 'admin'|'teacher'|'student')`.

## API Flow
See [`API.md`](./API.md). 30 Edge Functions cover payments, OTP, uploads, admin ops, welcome emails, notifications, AI.

## Caching
- Browser: react-query with stale/gc defaults.
- CDN: static assets on hosting CDN; Cloudinary edge caching for media.
- No custom service-worker.

## File Upload
- Small (avatars, page images) → Supabase Storage via `ImageUploader`.
- Large (course videos, up to 10 MB chunked) → **signed** Cloudinary uploads via `sign-upload` + `upload-video` Edge Functions.

## Storage Buckets
- `avatars` – public
- `media-uploads` – public (used by AI chatbot, CMS images)

## Error Handling
- UI errors surfaced via `sonner` toasts.
- Edge Functions return `{ error }` JSON with HTTP status; client hooks throw and react-query surfaces to toast.
- Supabase auth errors handled in `AuthContext`.

## Logging
- Client console + GA4 events.
- Edge Function logs viewable in Supabase → Edge Functions.
- Telegram bot pings admin on new enrollment (`student-enrollment-notify`).

## Deployment
See [`Deployment.md`](./Deployment.md).
