# Product Requirements Document — Astropixel Learn EdTech

## 1. Vision
Build Bangladesh's most trusted bilingual creative-agency + learning platform where local students, entrepreneurs and businesses can hire the agency **and** learn its craft — all under one brand.

## 2. Mission
Deliver premium branding, web and marketing services while simultaneously teaching those same skills through a fully-featured LMS in Bangla and English.

## 3. Target Users
| Segment | Needs |
|---|---|
| Bangladeshi students & aspiring designers/developers | Affordable, native-language courses, certificates, community |
| Small businesses & entrepreneurs | Branding, web design, social-media assets |
| Freelance teachers | Platform to sell recorded/live courses with revenue share |
| Agency admins | Central CMS to run marketing site, LMS content, payments, communications |

## 4. Business Goals
- Combine service revenue (agency projects) with recurring LMS revenue.
- Retain platform independence from Lovable subscription (decoupled architecture).
- Scale to unlimited teachers/courses without engineering intervention.

## 5. Learning Goals
- Complete video courses with progression gates (90 %).
- Auto-issued certificates for paid courses.
- Threaded Q&A per lesson, teacher-student chat, thumbs feedback.

## 6. Problems Solved
- No trusted Bangla-first LMS with integrated local payments (bKash/Nagad via UddoktaPay).
- Agencies rarely offer both service delivery and skill training in one product.
- Course platforms in BD lack anti-piracy video controls.

## 7. Modules
Marketing site · CMS (Homepage, Footer, Landing, Hero, Services, Works, Team) · Auth (student/teacher/admin) · Course catalog · Direct enrollment + payment · Course viewer · Live classes · Chat & Notices · Support tickets · Certificates · Teacher earnings · Admin AI Assistant · Analytics.

## 8. User Journeys
### Visitor
Landing → Explore services/works → Contact **or** switch to Learn → Browse courses → Enroll → Pay → Learn.

### Student
Signup (phone + OTP + Turnstile) → Dashboard → Watch videos (90 % gate) → Ask questions → Attend live classes → Earn certificate → Verify.

### Teacher
Login → Manage assigned courses → Upload videos (Cloudinary) → Schedule live classes → Reply to Q&A/tickets → View earnings (auto revenue split).

### Admin
Login → Dashboard → Create/assign courses → Manage teachers, team, coupons, APIs → Edit homepage/landing content → Approve enrollments → Broadcast notices → Use Alpha Assistant for content ops.

## 9. Non-Goals (Do Not Build)
- Pass-code enrollment (removed — direct DB assignment only)
- Video gallery module (removed)
- Anonymous signups
- Storing roles on `profiles` table (must use `user_roles`)
- Floating AIChatbot inside student area

## 10. Success Metrics
- Course completion rate ≥ 60 %
- Certificate issuance / paid enrollment ≥ 90 %
- Checkout success ≥ 95 %
- LCP < 2.5 s on marketing pages
- Support ticket first-response < 24 h

## 11. Monetization
- Recorded courses: 40 % teacher / 60 % agency
- Live classes: 70 % teacher / 30 % agency
- Paid work / agency projects: 80 % teacher / 20 % agency
- Free courses: no split
Coupons + UddoktaPay handle discounts and local BD payment rails.

## 12. Scalability
- Serverless (Supabase + Edge Functions) → no server ops.
- RLS-based multi-tenant isolation (teacher/student data).
- Cloudinary handles video delivery at any volume.

## 13. Roadmap
- ✔ Direct enrollment (v2 shipped)
- ✔ Dual-language courses
- ✔ Alpha Assistant (Gemini 2.5)
- ○ Mobile app wrapper
- ○ Bulk teacher onboarding
- ○ Advanced analytics dashboard
- ○ Group live classes with attendance analytics
