import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import SmoothScroll from "@/components/SmoothScroll";
import ErrorBoundary from "@/components/ErrorBoundary";

// Primary Learn Pages
import CoursesPage from "./views/CoursesPage";
import AllCoursesCatalogPage from "./views/AllCoursesCatalogPage";
import LearnAboutPage from "./views/LearnAboutPage";
import LearnContactPage from "./views/LearnContactPage";
import StudentLoginPage from "./views/StudentLoginPage";
import NotFound from "./views/NotFound";

// Helper for robust chunk loading and graceful auto-recovery
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err: any) {
      console.warn("Chunk load error in lazy route, attempting recovery:", err);
      const isPreloadErr =
        err?.message?.includes("preload") ||
        err?.message?.includes("Failed to fetch dynamically imported module") ||
        err?.message?.includes("dynamically imported module") ||
        err?.message?.includes("loading chunk");

      if (isPreloadErr) {
        const key = `lazy_retry_${window.location.pathname}`;
        const hasRetried = sessionStorage.getItem(key);
        if (!hasRetried) {
          sessionStorage.setItem(key, "true");
          window.location.reload();
        }
      }
      throw err;
    }
  });
}

// Lazy-loaded LMS Dashboards & Features with self-healing retries
const AdminDashboard = lazyWithRetry(() => import("./views/AdminDashboard"));
const StudentDashboard = lazyWithRetry(() => import("./views/StudentDashboard"));
const TeacherDashboard = lazyWithRetry(() => import("./views/TeacherDashboard"));
const MyCertificatesPage = lazyWithRetry(() => import("./views/MyCertificatesPage"));
const CourseViewerPage = lazyWithRetry(() => import("./views/CourseViewerPage"));
const CertificatePage = lazyWithRetry(() => import("./views/CertificatePage"));
const VerifyCertificatePage = lazyWithRetry(() => import("./views/VerifyCertificatePage"));
const ForgotPasswordPage = lazyWithRetry(() => import("./views/ForgotPasswordPage"));
const ResetPasswordPage = lazyWithRetry(() => import("./views/ResetPasswordPage"));
const PaymentCallbackPage = lazyWithRetry(() => import("./views/PaymentCallbackPage"));
const PaymentCancelPage = lazyWithRetry(() => import("./views/PaymentCancelPage"));
const CustomCheckoutPage = lazyWithRetry(() => import("./views/CustomCheckoutPage"));
const CourseLandingPage = lazyWithRetry(() => import("./views/CourseLandingPage"));
const FreeResourcesPage = lazyWithRetry(() => import("./views/FreeResourcesPage"));
const SyllabusCalculatorPage = lazyWithRetry(() => import("./views/SyllabusCalculatorPage"));
const EligibilityCalculatorPage = lazyWithRetry(() => import("./views/EligibilityCalculatorPage"));

const TeacherLoginPage = lazyWithRetry(() => import("./views/TeacherLoginPage"));
const AdminLoginPage = lazyWithRetry(() => import("./views/AdminLoginPage"));

const queryClient = new QueryClient();

function AppContent() {
  return (
    <ErrorBoundary>
      <SmoothScroll />
      <ScrollToTop />

      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" /></div>}>
        <Routes>
          {/* Core Public Pages */}
          <Route path="/" element={<CoursesPage />} />
          <Route path="/courses" element={<AllCoursesCatalogPage />} />
          <Route path="/courses/all" element={<AllCoursesCatalogPage />} />
          <Route path="/catalog" element={<AllCoursesCatalogPage />} />
          <Route path="/free-resources" element={<FreeResourcesPage />} />
          <Route path="/syllabus-calculator" element={<SyllabusCalculatorPage />} />
          <Route path="/eligibility-calculator" element={<EligibilityCalculatorPage />} />
          <Route path="/about" element={<LearnAboutPage />} />
          <Route path="/contact" element={<LearnContactPage />} />

          {/* Dedicated Login Portals */}
          <Route path="/login" element={<StudentLoginPage />} />
          <Route path="/auth" element={<StudentLoginPage />} />
          <Route path="/student/login" element={<StudentLoginPage />} />
          <Route path="/teacher/login" element={<TeacherLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Core Dashboards & LMS Features */}
          <Route path="/student/course/:courseId" element={<CourseViewerPage />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/*" element={<StudentDashboard />} />

          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/*" element={<TeacherDashboard />} />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />

          {/* Certificates System */}
          <Route path="/my-certificates" element={<MyCertificatesPage />} />
          <Route path="/certificate/:certificateId" element={<CertificatePage />} />
          <Route path="/verify-certificate" element={<VerifyCertificatePage />} />

          {/* Course Landing Pages */}
          <Route path="/courses/:slug" element={<CourseLandingPage />} />

          {/* Payments & Checkout */}
          <Route path="/pay/:invoiceId" element={<CustomCheckoutPage />} />
          <Route path="/payment/callback" element={<PaymentCallbackPage />} />
          <Route path="/payment/cancel" element={<PaymentCancelPage />} />

          {/* Auth Recovery */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
