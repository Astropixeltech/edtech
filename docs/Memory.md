# Project Memory (Living)

Consolidated persistent decisions. Mirrors `mem://index.md`. Update whenever a decision changes.

## Core Decisions
- **Bilingual (Bangla/English)** with total isolation per language — never mix scripts.
- **Aesthetic:** Premium Editorial Glassmorphism (glass cards + mesh bg), Playfair Display + Hind Siliguri, no purple/indigo gradients, no default Inter.
- **Decoupled architecture:** React SPA hostable anywhere; Supabase backend outlives Lovable subscription.
- **Auth hierarchy:** Admin > Teacher > Student. Phone-mandatory signup, email OTP, Turnstile.
- **LMS:** direct DB enrollment (pass-code system removed). Courses → Modules → Videos.
- **Video player UX:** VideoJS + YouTube custom player with full forward/backward seek freedom (+10s/-10s buttons, speed popover, hover timeline preview, double-click gestures, PiP, shortcuts dialog), 90 % completion threshold.
- **Media upload:** `ImageUploader` → `media-uploads` bucket, or Cloudinary signed uploads for large.
- **Source of truth:** `docs/*.md` — read before non-trivial change; update when decisions shift.

## Why these choices
| Decision | Reason |
|---|---|
| Supabase / Lovable Cloud | Zero-ops Postgres + Auth + Storage + Functions + Realtime |
| RLS + `user_roles` (not on profiles) | Prevents privilege escalation |
| SECURITY DEFINER `has_role` | Avoids recursive RLS on `user_roles` |
| Cloudinary for video | Bandwidth + transformation + signed uploads |
| UddoktaPay | Only reliable bKash/Nagad gateway for BD |
| Resend | Simple domain-based email + inbound webhook |
| react-query | Server state cache; matches Supabase realtime updates |
| framer-motion + Lenis + GSAP | Match editorial motion language |
| Tailwind semantic tokens | Enforces theming, prevents hard-coded colors |
| Sub-brand via hostname (`learn.*`) | Single codebase, two brands |

## Why folders exist
See [`FolderStructure.md`](./FolderStructure.md).

## Removed / Forbidden
- ❌ Pass-code enrollment (system + UI)
- ❌ Video gallery module
- ❌ Floating AIChatbot inside `/student|/teacher|/admin`
- ❌ Roles on `profiles` table
- ❌ Hardcoded colors bypassing tokens
- ❌ Editing `src/integrations/supabase/client.ts` or `types.ts` (auto-gen)
- ❌ Anonymous signups
- ❌ Placeholder Laravel / template metadata

## Locked layouts
- Course Viewer: video fixed top, only sidebar scrolls.
- Chat: single room per teacher-student pair; teacher sees student profile names.
- Floating Navbar: fixed top-0, `max-w-6xl mx-auto`, search & language toggle removed, permanently pinned on scroll.
- Hero Section: framed 2-column layout strictly contained in `max-w-6xl mx-auto`, zero bleed behind floating navbar background.
- Landing Page Containers: all sections aligned to `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8` matching navbar width.

## Known Issues / Tech Debt
- Legacy `pass_codes`, `pass_code_courses`, `gallery_videos` tables retained but unused.
- `page_content` uses Bengali keys — good for CMS UX, requires care in code lookups.
- `useCourses` / `usePublicCourses` overlap — candidate for consolidation.
- Duplicate `use-toast` in `src/hooks/` and `src/components/ui/` — historical shadcn split.

## Recent Milestones Completed
- **Interactive MCQ Exam Engine**: Full timer, negative marking (-0.25), anti-cheat tab-switch detection, automated merit ranking, and solution review sheets.
- **Teacher MCQ Quiz / Model Test Builder**: Teachers can create, configure, and publish MCQ model tests directly to student dashboard catalogues (`TeacherExamBuilderTab.tsx`).
- **Admin Central Notice Broadcaster**: Real-time announcement broadcasting to global or course-specific student/teacher dashboards (`AdminNoticeManagement.tsx`).
- **Admin Teacher Withdrawal Approvals**: Instant approval/rejection of teacher earnings payout requests under Payments & Requests.
- **Student Data Export**: Full UTF-8 BOM CSV export for Excel compatibility in Admin Students tab.
- **PWA Support**: Full web manifest and install prompts for mobile learners.
- **PDF Formula Notes Generator**: Client-side jsPDF formula revision sheet generator with dynamic student watermark.
- **Enhanced Video Player & Open Walkthrough**: Completely removed 10s/forward seeking restriction and sequential lesson locks for enrolled students. Added dedicated +10s/-10s buttons, speed popover, hover timeline preview, double-click gestures with HUD ripple, PiP, and bilingual shortcuts modal across YouTube and HTML5 players.

## Pending / Future
- Mobile app wrapper (Capacitor / TWA).
- Deep video analytics (heatmap of student replay hotspots).
- Automated SMS notifications on enrollment approval.

## Developer Notes
- Never touch `src/integrations/supabase/*` — auto-generated.
- `.env` is auto-managed; do not blank Supabase vars to "fix" publish.
- Every new public table must ship with GRANTs + RLS + policies in the same migration.
- All admin edge functions must re-check `has_role(auth.uid(), 'admin')`.
- Preloader disabled on all LMS routes (see `LMS_ROUTES` in `App.tsx`).

## References
- `mem://index.md` (live memory index — always in context)
- `docs/RULES.md` for hard rules
- `docs/ARCHITECTURE.md` for structural decisions
