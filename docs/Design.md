# Design System — Astropixel Learn EdTech

Aesthetic direction: **Premium Editorial Glassmorphism** — dark-first, high-contrast, magazine-style typography, translucent glass cards over a subtle mesh background. Never generic (no purple/indigo gradients, no default Inter).

## 1. Color System
All colors are semantic HSL tokens defined in `src/index.css` (`--background`, `--foreground`, `--primary`, `--muted`, `--card`, `--border`, `--ring`, plus glass/mesh gradients). Components **must** use tokens (`bg-background`, `text-primary`) — never hex or `text-white`/`bg-black`.

Theme handled by `next-themes`; `html.dark` set by default. Logos react to theme via CSS filters (see `mem://branding/logos`).

## 2. Typography
- Headings: **Playfair Display** (editorial serif) — English titles
- Body / UI: **Hind Siliguri** for Bangla, system-safe sans for English body
- Loaded via `fonts.bunny.net` (`<link rel="preconnect">` in `index.html`)
- Never use Inter, Poppins, or generic sans as brand fonts.

## 3. Spacing & Grid
- Tailwind spacing scale, container `mx-auto px-4 md:px-8`.
- Section vertical padding `py-16 md:py-24`.
- Responsive breakpoints: default Tailwind (`sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`).

## 4. Components
| Element | Style |
|---|---|
| Buttons | shadcn `Button` variants; primary uses `--primary` token, glass ghost variant common |
| Cards | `.glass-card` utility — backdrop-blur, translucent bg, hairline border |
| Forms | react-hook-form + shadcn inputs, zod validation, error states use `--destructive` |
| Icons | `lucide-react` at 16/20/24 px |
| Navbar | Sticky, translucent, language switch + login CTA |
| Footer | CMS-driven, three-column, glass panel |
| Hero | Full-viewport, mesh background, animated headline (framer-motion / Splide) |

## 5. Motion
- Page transitions: `framer-motion` fade (0.35 s, custom easing) in `App.tsx`.
- Scroll: Lenis smooth scroll + custom `ScrollReveal` on marketing routes.
- Marquees: CSS `@keyframes marquee-left` (see courses page trainers strip).
- Micro-interactions: GSAP for logo/hero; tsparticles for accents.

## 6. Glassmorphism Rules
- Backdrop-blur `md`–`xl`
- Border `1px solid hsl(var(--border)/0.6)`
- Shadow: soft, low-elevation, no neon glow
- No horizontal stripes or background glows — clean mesh only.

## 7. Border Radius
- Cards & panels: `rounded-2xl`
- Buttons: `rounded-full` (pill) or `rounded-lg`
- Media: `rounded-xl`

## 8. Language-aware Display
Language toggle (English ↔ Bangla) replaces text, font, and hero images entirely. Never mix scripts in one component; use `useLanguage()` from `@/contexts/LanguageContext`.

## 9. Dark / Light
Dark is primary. Light mode supported via `next-themes`; every token has a light variant. Test all new UI in both themes.
