# Project Rules

Hard rules. Violating any of these breaks the product, security, or theming.

## Code
- TypeScript strict — every new file typed.
- Small, focused components — never dump multiple responsibilities in one file.
- Reuse existing shadcn primitives; never duplicate.
- Never hardcode strings that should be bilingual — use `LanguageContext`.
- Never hardcode colors — use semantic tokens from `src/index.css`.
- No `text-white`, `bg-black`, `bg-[#hex]` in components.
- Never use Inter / Poppins / generic sans — Playfair Display + Hind Siliguri only.

## Naming
- Components: `PascalCase.tsx`.
- Hooks: `useCamelCase.ts`.
- Utilities: `camelCase.ts`.
- Tables/columns: `snake_case`.
- Route paths: `kebab-case`.

## Folders
- Feature admin/student/teacher components under `components/<role>/`.
- Reusable primitives under `components/ui/`.
- Business hooks under `hooks/`.
- Never invent new top-level folders without a doc update.

## Backend / Database
- Every new `public.<table>` migration must include: `CREATE TABLE` → `GRANT` → `ENABLE RLS` → `CREATE POLICY` — in that exact order.
- Roles **only** in `user_roles`. Never on `profiles`.
- Role checks always through `has_role()` SECURITY DEFINER (avoid recursive RLS).
- Never edit auto-generated files (`src/integrations/supabase/client.ts`, `types.ts`).
- Never `ALTER DATABASE postgres`.
- No FKs to `auth.users` — reference `profiles.user_id` instead.
- Do not touch schemas `auth`, `storage`, `realtime`, `supabase_functions`, `vault`.

## Auth
- Phone mandatory on signup.
- Email OTP + Cloudflare Turnstile required.
- Disposable email domains blocked (`disposable_email_domains`).
- No anonymous signups.
- Teacher access requires `teacher_approved`.

## LMS
- Course Viewer layout locked (video fixed, sidebar scrolls).
- Video: VideoJS + YouTube custom player with full forward/backward seek freedom (+10s/-10s buttons, speed popover, hover timeline preview, double-click gestures, PiP, shortcuts dialog), 90% completion threshold.
- Chat: single room per teacher-student pair; teacher sees student profile name.
- Pass-code enrollment permanently removed — do not re-introduce.
- No floating AIChatbot inside student area.

## Media
- All uploads via `ImageUploader` (`media-uploads` bucket) or Cloudinary signed uploads.
- Videos ≤ 10 MB chunked to Cloudinary.
- Images use `no-referrer` + `crossOrigin`.

## API / Secrets
- Publishable/anon keys allowed in code.
- All private secrets in Supabase Vault; never in git.
- Admin edge functions must re-verify `has_role(auth.uid(), 'admin')`.

## Design
- Every UI change goes through semantic tokens.
- Dark mode is primary; light mode must be tested.
- No horizontal stripes / neon glows in backgrounds.
- Responsive from 320 px up; test at `sm/md/lg/xl`.

## SEO
- `<title>` < 60 chars, `<meta description>` < 160 chars.
- Single `<h1>` per page. Semantic HTML. Alt text on all images.
- JSON-LD (Organization + founder) on relevant pages.
- Never leave placeholder "Lovable App" / "Lovable Generated Project".

## Performance
- Lazy-load heavy pages/components where practical.
- Preload only truly critical assets (logo).
- Preloader skipped on LMS routes.
- Use react-query cache instead of duplicate fetches.

## Docs
- Update `docs/*.md` and `mem://index.md` when a project decision changes.
- Never leave a doc file with template placeholder text.

## Commits (recommendation)
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- One logical change per commit.
