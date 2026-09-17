import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Lock, GraduationCap, Loader2, Eye, EyeOff, Sparkles, BookOpen, Users, Award, AlertTriangle, ExternalLink } from 'lucide-react';
import { z } from 'zod';
import learnLogoAssetJson from "@/assets/learn-with-alphazero-logo.png.asset.json";
const learnLogo = learnLogoAssetJson.url;

export default function TeacherLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [domainAlert, setDomainAlert] = useState<{ isUnauth: boolean; domain: string } | null>(null);

  const { user, role, session, isLoading: authLoading, signIn, signInAsRole, signInWithGoogle } = useAuth();
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const navigate = useNavigate();

  const handleGoogleTeacherLogin = async () => {
    setIsLoading(true);
    setDomainAlert(null);
    try {
      const res = await signInWithGoogle();
      if (res.isUnauthorizedDomain) {
        const currentHost = res.domainName || (typeof window !== 'undefined' ? window.location.hostname : 'edtech.astropixel.tech');
        setDomainAlert({ isUnauth: true, domain: currentHost });
        toast.error(isBn ? 'ডোমেনটি Firebase-এ অনুমোদিত নয়' : 'Domain not authorized in Firebase');
      } else if (res.error) {
        toast.error(res.error.message || (isBn ? 'Google লগইনে সমস্যা হয়েছে' : 'Google sign-in failed'));
      } else {
        toast.success(isBn ? 'Google ভেরিফিকেশন সফল!' : 'Authenticated with Google!');
        navigate('/teacher');
      }
    } catch (err: any) {
      toast.error(err.message || (isBn ? 'Google লগইনে সমস্যা হয়েছে' : 'Google sign-in failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBypassLogin = async () => {
    try {
      setIsLoading(true);
      await signInAsRole('teacher');
      toast.success(isBn ? 'ইন্সট্রাক্টর ড্যাশবোর্ডে প্রবেশ করছেন...' : 'Entering Teacher Dashboard...');
      navigate('/teacher');
    } catch (err: any) {
      toast.error(err.message || 'Bypass failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loginSchema = z.object({
    email: z.string().email(isBn ? 'সঠিক ইমেইল দিন' : 'Valid email required'),
    password: z.string().min(6, isBn ? 'কমপক্ষে ৬ ডিজিটের পাসওয়ার্ড দিন' : 'Password must be 6+ characters'),
  });

  useEffect(() => {
    if (authLoading) return;
    if (user && role === 'teacher' && session && !user.id?.startsWith('demo-')) {
      navigate('/teacher');
    }
  }, [user, role, session, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);

    if (error) {
      setIsLoading(false);
      toast.error(error.message.includes('Invalid') ? (isBn ? 'ভুল ইমেইল বা পাসওয়ার্ড' : 'Invalid credentials') : error.message);
      return;
    }

    setIsLoading(false);
    toast.success(isBn ? 'স্বাগতম! ইন্সট্রাক্টর প্যানেলে প্রবেশ করছেন...' : 'Welcome back!');
    navigate('/teacher');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 w-full bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="w-full max-w-[420px]">
        
        {/* Top Back Link */}
        <div className="flex items-center justify-between mb-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isBn ? 'হোমপেজে ফিরে যান' : 'Back to Home'}</span>
          </Link>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            {isBn ? 'শিক্ষক ও মেন্টর পোর্টাল' : 'Instructor Portal'}
          </span>
        </div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className="rounded-2xl bg-card border border-border/80 shadow-md overflow-hidden p-6 sm:p-8">
            
            {/* Header */}
            <div className="text-center space-y-1.5 mb-6">
              <Link to="/" className="inline-block">
                <img 
                  src={learnLogo} 
                  alt="Astropixel Learn Logo" 
                  className="w-28 mx-auto mb-2 brightness-0 dark:invert object-contain"
                />
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                {isBn ? 'ইন্সট্রাক্টর লগইন' : 'Teacher Sign In'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {isBn ? 'আপনার কোর্স, ক্লাস, অ্যাসাইনমেন্ট ও শিক্ষার্থী পরিচালনা করুন' : 'Manage your courses, classes, assignments and earnings'}
              </p>
            </div>



            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="teacher-email" className="text-xs font-semibold">
                  {isBn ? 'শিক্ষক ইমেইল' : 'Teacher Email'}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="teacher-email"
                    type="email"
                    placeholder="teacher@institution.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11 rounded-xl text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="teacher-password" className="text-xs font-semibold">
                    {isBn ? 'পাসওয়ার্ড' : 'Password'}
                  </Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    {isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="teacher-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 h-11 rounded-xl text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {isBn ? 'প্রবেশ করা হচ্ছে...' : 'Signing in...'}
                  </>
                ) : (
                  isBn ? 'টিচার প্যানেলে প্রবেশ করুন' : 'Sign in to Teacher Panel'
                )}
              </Button>
            </form>

            {/* Firebase Google Auth */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-medium">
                  {isBn ? 'অথবা Firebase দিয়ে' : 'Or via Firebase'}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleTeacherLogin}
              disabled={isLoading}
              className="w-full h-11 rounded-xl font-medium border-border hover:bg-muted/50 text-foreground flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{isBn ? 'Google দিয়ে শিক্ষক প্রবেশ' : 'Sign in with Google (Firebase)'}</span>
            </Button>

            {/* Domain Alert if unauthorized in Firebase */}
            {domainAlert && (
              <motion.div 
                initial={{ opacity: 0, y: 8 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs space-y-2.5 text-left"
              >
                <div className="flex items-start gap-2 font-bold text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{isBn ? 'Firebase ডোমেন অনুমোদন প্রয়োজন' : 'Firebase Domain Authorization Needed'}</span>
                </div>
                <p className="leading-relaxed text-muted-foreground">
                  {isBn 
                    ? `আপনার ডোমেন (${domainAlert.domain}) Firebase-এ এখনও Authorize করা নেই। Google লগইন চালু করতে নিচের লিঙ্কে গিয়ে ডোমেনটি যোগ করুন:` 
                    : `Domain (${domainAlert.domain}) must be added to Authorized domains in Firebase:`}
                </p>
                <div className="bg-background/80 p-2 rounded-lg border border-border font-mono text-[11px] text-foreground break-all select-all flex items-center justify-between">
                  <span>{domainAlert.domain}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-sans">কপি</span>
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <a 
                    href="https://console.firebase.google.com/project/gen-lang-client-0312248785/authentication/settings" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-sm text-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{isBn ? 'Firebase Console সেটিংস খুলুন' : 'Open Firebase Console Settings'}</span>
                  </a>
                  <Button 
                    type="button" 
                    onClick={handleBypassLogin}
                    className="w-full h-8 rounded-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                  >
                    {isBn ? '🚀 তাত্ক্ষণিক ইন্সট্রাক্টর প্যানেলে প্রবেশ করুন' : '🚀 Enter Instructor Panel Instantly'}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Become an Instructor / Info */}
            <div className="mt-5 p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span>{isBn ? 'শিক্ষক হিসেবে যুক্ত হতে চান?' : 'Want to become an Instructor?'}</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {isBn 
                  ? 'বুয়েট, মেডিকেল বা ঢাবির মেধাবী শিক্ষার্থীদের পাঠদানের জন্য আমাদের সাথে যোগাযোগ করুন:'
                  : 'Join our elite academic faculty. Contact us to apply:'}
              </p>
              <a 
                href="mailto:instructors@astropixel.com" 
                className="inline-block text-primary font-semibold hover:underline text-[11px]"
              >
                instructors@astropixel.com
              </a>
            </div>

            {/* Bottom Links */}
            <div className="pt-4 mt-4 border-t border-border/70 flex items-center justify-between text-xs text-muted-foreground">
              <Link 
                to="/student/login" 
                className="hover:text-primary transition-colors flex items-center gap-1 font-medium"
              >
                <span>← {isBn ? 'শিক্ষার্থী লগইন' : 'Student Login'}</span>
              </Link>
              <Link 
                to="/admin/login" 
                className="hover:text-primary transition-colors font-medium"
              >
                <span>{isBn ? 'অ্যাডমিন' : 'Admin'} →</span>
              </Link>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
