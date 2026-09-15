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

// Lazy-loaded LMS Dashboards & Features
const AdminDashboard = lazy(() => import("./views/AdminDashboard"));
const StudentDashboard = lazy(() => import("./views/StudentDashboard"));
const TeacherDashboard = lazy(() => import("./views/TeacherDashboard"));
const MyCertificatesPage = lazy(() => import("./views/MyCertificatesPage"));
const CourseViewerPage = lazy(() => import("./views/CourseViewerPage"));
const CertificatePage = lazy(() => import("./views/CertificatePage"));
const VerifyCertificatePage = lazy(() => import("./views/VerifyCertificatePage"));
const ForgotPasswordPage = lazy(() => import("./views/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./views/ResetPasswordPage"));
const PaymentCallbackPage = lazy(() => import("./views/PaymentCallbackPage"));
const PaymentCancelPage = lazy(() => import("./views/PaymentCancelPage"));
const CustomCheckoutPage = lazy(() => import("./views/CustomCheckoutPage"));
const CourseLandingPage = lazy(() => import("./views/CourseLandingPage"));
const FreeResourcesPage = lazy(() => import("./views/FreeResourcesPage"));
const SyllabusCalculatorPage = lazy(() => import("./views/SyllabusCalculatorPage"));
const EligibilityCalculatorPage = lazy(() => import("./views/EligibilityCalculatorPage"));

const TeacherLoginPage = lazy(() => import("./views/TeacherLoginPage"));
const AdminLoginPage = lazy(() => import("./views/AdminLoginPage"));

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
