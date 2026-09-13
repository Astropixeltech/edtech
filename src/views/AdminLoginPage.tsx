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

  const { user, role, session, isLoading: authLoading, signIn, signInAsRole } = useAuth();
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const navigate = useNavigate();

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
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 w-full bg-slate-950 py-10 px-4 text-slate-100">
      <div className="w-full max-w-[400px]">
        
        {/* Top Back Link */}
        <div className="flex items-center justify-between mb-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isBn ? 'হোমপেজে ফিরে যান' : 'Back to Home'}</span>
          </Link>
          <span className="text-[11px] font-mono font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>{isBn ? 'অ্যাডমিন সিকিউর পোর্টাল' : 'Admin Security'}</span>
          </span>
        </div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8">
            
            {/* Header */}
            <div className="text-center space-y-1.5 mb-6">
              <Link to="/" className="inline-block">
                <img 
                  src={learnLogo} 
                  alt="Astropixel Learn Logo" 
                  className="w-28 mx-auto mb-2 invert object-contain"
                />
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <span>{isBn ? 'অ্যাডমিন লগইন' : 'Admin Sign In'}</span>
              </h1>
              <p className="text-xs text-slate-400">
                {isBn ? 'প্ল্যাটফর্ম ও সিস্টেম পরিচালনার জন্য অনুমোদিত প্রবেশ' : 'Authorized personnel only for platform governance'}
              </p>
            </div>

            {/* Admin Testing Mode Bypass */}
            <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-200">
                  {isBn ? 'অ্যাডমিন প্রিভিউ (লগইন ছাড়াই)' : 'Admin Preview'}
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleBypassLogin}
                disabled={isLoading}
                className="h-7 px-3 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono rounded-lg shrink-0 shadow-xs"
              >
                ⚡ {isBn ? 'অ্যাডমিন প্রবেশ' : 'Admin Demo'}
              </Button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="admin-email" className="text-xs font-semibold text-slate-300">
                  {isBn ? 'অ্যাডমিন ইমেইল' : 'Admin Email'}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@astropixel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11 rounded-xl text-sm bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="admin-password" className="text-xs font-semibold text-slate-300">
                    {isBn ? 'মাস্টার পাসওয়ার্ড' : 'Master Password'}
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 h-11 rounded-xl text-sm bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
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
