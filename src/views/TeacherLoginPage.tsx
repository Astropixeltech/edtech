import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Lock, GraduationCap, Loader2, Eye, EyeOff, Sparkles, BookOpen, Users, Award } from 'lucide-react';
import { z } from 'zod';
import learnLogoAssetJson from "@/assets/learn-with-alphazero-logo.png.asset.json";
const learnLogo = learnLogoAssetJson.url;

export default function TeacherLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { user, role, session, isLoading: authLoading, signIn, signInAsRole } = useAuth();
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const navigate = useNavigate();

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
