# Astropixel Learn EdTech Platform

A bilingual (Bangla / English) academic & admission preparation learning-management platform built for **Astropixel Learn** (Bangladesh). The platform powers a full EdTech LMS with paid enrollment, live and recorded classes, certificates, and teacher management.

---

## Overview

Astropixel Learn is a dedicated EdTech platform:

- **Learning platform (Astropixel Learn)** – course catalog, checkout via UddoktaPay/bKash/Nagad, secured YouTube-based video player, live YouTube classes, comments/Q&A, feedback, certificates, teacher earnings, admin CMS.

Both experiences share one React SPA, one Supabase backend, and a language toggle that swaps every string, image, and route hero.

---

## Features

### Public / Marketing
- Home (agency)
- About
- Services & Pricing
- Works / Portfolio
- Team + Join Team
- Contact
- CMS-driven Homepage, Footer, Page Hero, Landing Pages
- Global bilingual search (SearchModal with AI edge fallback)
- Preloader, smooth scroll (Lenis), scroll reveal, page transitions

### Learning (Students)
- Course catalog (`/courses`) with carousel of instructors
- Course landing (`/vibe-coding`, `/courses/vibe-coding`)
- Custom checkout (`/pay/:invoiceId`) → UddoktaPay redirect
- Student dashboard: My Courses, Live Classes, Recorded Classes, Notices, Chat, Support, Certificates, Profile, ID Card
- Course viewer with **SecureVideoPlayer** (VideoJS + YouTube plugin, anti-seek, 90 % completion gate)
- Lesson comments / threaded Q&A, thumbs up/down feedback
- Auto certificate generation (html2canvas + jsPDF) with public `/verify-certificate`

### Teaching (Teachers)
- Teacher dashboard: Courses, Students, Live Classes, Recorded Classes, Paid Works, Earnings (40/70/80 % splits), Notices, Chat, Support Tickets, Profile
- Video manager, live-class scheduler

### Administration
- Admin dashboard with 20+ management modules (Courses, Teachers, Team, Homepage, Landing pages, Footer, Services, Works, Coupons, Comments, Feedback, Contact info, API keys, Payment APIs, Email inbox/outbox, Site settings, About/Learn page editors, Hero editors, Page content, **Alpha Assistant** – Gemini 2.5 vibe-coding assistant)

### Cross-cutting
- Phone-mandatory signup, email OTP, Cloudflare Turnstile
- Roles via `user_roles` table (`admin > teacher > student`)
- Notices, Chat rooms (one per teacher-student pair), Support tickets, Email threads
- Telegram admin notifications, Resend transactional email
- Cloudinary signed uploads for large media, Supabase Storage for avatars

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 · Vite 5 · TypeScript 5 |
| Routing | react-router-dom v7 |
| Styling | Tailwind CSS v3 · tailwindcss-animate · semantic tokens in `src/index.css` |
| UI kit | shadcn/ui (Radix primitives) |
| State / data | @tanstack/react-query · React Context (`Auth`, `Language`, `SiteScope`, `AdminSiteScope`) |
| Forms | react-hook-form · zod · @hookform/resolvers |
| Animation | framer-motion · GSAP · Lenis · tsparticles · Swiper · Splide · embla-carousel |
| Icons | lucide-react |
| Docs / PDF | html2canvas · jsPDF · qrcode.react · react-barcode |
| Backend | Lovable Cloud (Supabase: Postgres, Auth, Storage, Edge Functions, Realtime) |
| Media | Cloudinary (signed) + Supabase Storage buckets `avatars`, `media-uploads` |
| Email | Resend (custom domain) |
| Payments | UddoktaPay (bKash / Nagad / cards) |
| Analytics | Google Analytics 4 – `G-TKCXDY69Q9` |
| Deployment | Vercel/Netlify for frontend, Supabase for backend (decoupled) |
| Package manager | Bun (`bun.lock`) |

---

## Folder Structure

```
.
├── docs/                     # ← this documentation
├── public/                   # static assets, favicons, _redirects
├── src/
│   ├── assets/               # images, logos, brand marks
│   ├── components/
│   │   ├── admin/            # admin dashboard modules
│   │   ├── student/          # student dashboard tabs
│   │   ├── teacher/          # teacher dashboard tabs
│   │   ├── live/             # YouTube live embed & badge
│   │   ├── ui/               # shadcn/ui primitives
│   │   └── *.tsx             # layout, navbar, footer, preloader, chatbot…
│   ├── contexts/             # Auth, Language, SiteScope, AdminSiteScope
│   ├── data/                 # static data (pricing.ts)
│   ├── hooks/                # data-fetching hooks (useCourses, usePageContent…)
│   ├── integrations/
│   │   ├── supabase/         # AUTO-GENERATED client + types (do not edit)
│   │   └── lovable/
│   ├── lib/                  # utils.ts (cn helper)
│   ├── pages/                # route components
│   ├── utils/                # emailValidation, etc.
│   ├── App.tsx / main.tsx    # entry + router
│   └── index.css             # design tokens + globals
├── supabase/functions/       # 30 Edge Functions
├── index.html                # SEO tags, GA, favicons
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

See [`FolderStructure.md`](./FolderStructure.md) for the full annotated tree.

---

## Installation

```bash
bun install       # or: npm install
bun run dev       # Vite on http://localhost:8080
```

Requires Node ≥ 18 and a `.env` (see below). The Supabase backend is already provisioned by Lovable Cloud – no local Supabase needed.

---

## Environment Variables

All variables are **publishable** and live in project root `.env` (auto-managed by Lovable Cloud):

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase Data API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon / publishable key (RLS-protected) |
| `VITE_SUPABASE_PROJECT_ID` | Project ref |

Server-only secrets (used by Edge Functions) are stored in Supabase Vault:
`CLOUDINARY_API_KEY/SECRET/CLOUD_NAME`, `RESEND_API_KEY`, `UDDOKTAPAY_API_KEY`, `UDDOKTAPAY_BASE_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `LOVABLE_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

Never expose secrets client-side. See [`Security.md`](./Security.md).

---

## Build

```bash
bun run build         # production build → dist/
bun run build:dev     # dev-mode build
bun run preview       # serve dist/
bun run lint          # eslint
```

---

## Deployment

Frontend is deployed as a static SPA (Vercel / Netlify / Lovable hosting). Backend (Supabase) is provisioned and outlives any hosting subscription. See [`Deployment.md`](./Deployment.md).

Domains:
- Preview: `id-preview--<id>.lovable.app`
- Published: `alphazero00.lovable.app`
- Sub-brand: `learn.<domain>` triggers Learn variant of `/`, `/about`, `/contact`

---

## Credits

- **Project Owner:** AlphaZero BD — Sofiullah Ahammad (Founder), Rajshahi, Bangladesh
- **Organization:** AlphaZero Creative Agency & AlphaZero Learn
- **Backend:** Lovable Cloud (Supabase)
- **AI Assistants:** Google Gemini via Lovable AI Gateway

---

## Writer

Documentation prepared automatically based on the existing project architecture.

**Project Owner:** AlphaZero
**Documentation:** AI-generated from project analysis (July 2026)
