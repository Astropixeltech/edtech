import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Lock, ShieldCheck, Loader2, Eye, EyeOff, Sparkles, ShieldAlert } from 'lucide-react';
import { z } from 'zod';
import learnLogoAssetJson from "@/assets/learn-with-alphazero-logo.png.asset.json";
const learnLogo = learnLogoAssetJson.url;

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { user, role, session, isLoading: authLoading, signIn, signInAsRole, signInWithGoogle } = useAuth();
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const navigate = useNavigate();

  const handleGoogleAdminLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.message || (isBn ? 'Google লগইনে সমস্যা হয়েছে' : 'Google sign-in failed'));
      } else {
        toast.success(isBn ? 'Google অ্যাডমিন ভেরিফিকেশন সফল!' : 'Admin authenticated with Google!');
        navigate('/admin');
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
      await signInAsRole('admin');
      toast.success(isBn ? 'অ্যাডমিন প্যানেলে প্রবেশ করছেন...' : 'Entering Admin Panel...');
      navigate('/admin');
    } catch (err: any) {
      toast.error(err.message || 'Bypass failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loginSchema = z.object({
    email: z.string().email(isBn ? 'সঠিক অ্যাডমিন ইমেইল দিন' : 'Valid admin email required'),
    password: z.string().min(6, isBn ? 'কমপক্ষে ৬ ডিজিটের পাসওয়ার্ড দিন' : 'Password must be 6+ characters'),
  });

  useEffect(() => {
    if (authLoading) return;
    if (user && role === 'admin' && session && !user.id?.startsWith('demo-')) {
      navigate('/admin');
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
      toast.error(error.message.includes('Invalid') ? (isBn ? 'ভুল অ্যাডমিন ক্রেডেনশিয়াল' : 'Invalid admin credentials') : error.message);
      return;
    }

    setIsLoading(false);
    toast.success(isBn ? 'অ্যাডমিন ভেরিফিকেশন সফল! প্রবেশ করছেন...' : 'Admin authenticated!');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 w-full bg-slate-50 py-10 px-4 text-slate-900">
      <div className="w-full max-w-[400px]">
        
        {/* Top Back Link */}
        <div className="flex items-center justify-between mb-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isBn ? 'হোমপেজে ফিরে যান' : 'Back to Home'}</span>
          </Link>
          <span className="text-[11px] font-mono font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>{isBn ? 'অ্যাডমিন সিকিউর পোর্টাল' : 'Admin Security'}</span>
          </span>
        </div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8">
            
            {/* Header */}
            <div className="text-center space-y-1.5 mb-6">
              <Link to="/" className="inline-block">
                <img 
                  src={learnLogo} 
                  alt="Astropixel Learn Logo" 
                  className="w-28 mx-auto mb-2 object-contain"
                />
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <span>{isBn ? 'অ্যাডমিন লগইন' : 'Admin Sign In'}</span>
              </h1>
              <p className="text-xs text-slate-500">
                {isBn ? 'প্ল্যাটফর্ম ও সিস্টেম পরিচালনার জন্য অনুমোদিত প্রবেশ' : 'Authorized personnel only for platform governance'}
              </p>
            </div>



            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="admin-email" className="text-xs font-semibold text-slate-700">
                  {isBn ? 'অ্যাডমিন ইমেইল' : 'Admin Email'}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@astropixel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11 rounded-xl text-sm bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="admin-password" className="text-xs font-semibold text-slate-700">
                    {isBn ? 'মাস্টার পাসওয়ার্ড' : 'Master Password'}
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 h-11 rounded-xl text-sm bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-md transition-colors" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {isBn ? 'যাচাই করা হচ্ছে...' : 'Authenticating...'}
                  </>
                ) : (
                  isBn ? 'সিকিউর প্যানেলে প্রবেশ করুন' : 'Authenticate & Enter'
                )}
              </Button>
            </form>

            {/* Firebase Google Auth */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500 font-medium">
                  {isBn ? 'অথবা Firebase দিয়ে' : 'Or via Firebase'}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleAdminLogin}
              disabled={isLoading}
              className="w-full h-11 rounded-xl font-medium border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{isBn ? 'Google দিয়ে অ্যাডমিন প্রবেশ' : 'Sign in with Google (Firebase)'}</span>
            </Button>

            {/* Bottom Links */}
            <div className="pt-5 mt-5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <Link 
                to="/student/login" 
                className="hover:text-slate-300 transition-colors"
              >
                ← {isBn ? 'শিক্ষার্থী পোর্টাল' : 'Student Portal'}
              </Link>
              <Link 
                to="/teacher/login" 
                className="hover:text-slate-300 transition-colors"
              >
                {isBn ? 'টিচার পোর্টাল' : 'Teacher Portal'} →
              </Link>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
