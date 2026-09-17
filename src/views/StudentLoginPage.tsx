import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Lock, User, ShieldCheck, Loader2, RefreshCw, Phone, Eye, EyeOff, Sparkles, GraduationCap, Shield } from 'lucide-react';
import { z } from 'zod';
import learnLogoAssetJson from "@/assets/learn-with-alphazero-logo.png.asset.json";
const learnLogo = learnLogoAssetJson.url;

export default function StudentLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupPhone, setSignupPhone] = useState('');
  
  // OTP States
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const { user, role, session, isLoading: authLoading, signIn, signUp, signInAsRole } = useAuth();
  const { language, t } = useLanguage();
  const isBn = language === 'bn';
  const navigate = useNavigate();

  const handleBypassLogin = async () => {
    try {
      setIsLoading(true);
      await signInAsRole('student');
      toast.success(isBn ? 'স্টুডেন্ট ড্যাশবোর্ডে প্রবেশ করছেন...' : 'Entering Student Dashboard...');
      navigate('/student');
    } catch (err: any) {
      toast.error(err.message || 'Bypass failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loginSchema = z.object({
    email: z.string().email(t('login.invalidEmail') || 'সঠিক ইমেইল দিন'),
    password: z.string().min(6, t('login.passwordMin') || 'কমপক্ষে ৬ ডিজিটের পাসওয়ার্ড দিন'),
  });

  const signupSchema = z.object({
    fullName: z.string().min(2, t('login.nameMin') || 'সঠিক নাম দিন'),
    email: z.string().email(t('login.invalidEmail') || 'সঠিক ইমেইল দিন'),
    password: z.string().min(6, t('login.passwordMin') || 'কমপক্ষে ৬ ডিজিটের পাসওয়ার্ড দিন'),
    phone: z.string().min(11, 'সঠিক মোবাইল নম্বর দিন').max(14, 'সঠিক মোবাইল নম্বর দিন'),
  });

  // OTP timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Redirect if logged in
  useEffect(() => {
    if (authLoading) return;
    if (user && role && session && !user.id?.startsWith('demo-')) {
      if (role === 'admin') navigate('/admin');
      else if (role === 'teacher') navigate('/teacher');
      else navigate('/student');
    }
  }, [user, role, session, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      setIsLoading(false);
      if (error.message.includes('Invalid login credentials')) {
        toast.error(t('login.invalidCredentials') || 'ভুল ইমেইল বা পাসওয়ার্ড');
      } else {
        toast.error(error.message);
      }
      return;
    }

    setIsLoading(false);
    toast.success(t('login.loginSuccess') || 'সফলভাবে লগইন হয়েছে!');
  };

  const sendOtp = async () => {
    const validation = signupSchema.safeParse({ 
      fullName: signupName, 
      email: signupEmail, 
      password: signupPassword, 
      phone: signupPhone 
    });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setSendingOtp(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { email: signupEmail, name: signupName }
      });

      if (error) throw error;

      if (data?.success) {
        setShowOtpVerification(true);
        setOtpTimer(120);
        setOtp(['', '', '', '', '', '']);
        toast.success(isBn ? '✉️ ভেরিফিকেশন কোড আপনার ইমেইলে পাঠানো হয়েছে' : 'Verification code sent to your email');
        
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      } else {
        // Fallback direct signup
        const { error: directError } = await signUp(signupEmail, signupPassword, signupName, signupPhone);
        if (directError) throw directError;
        toast.success(isBn ? '🎉 অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!' : 'Account successfully created!');
      }
    } catch (error: any) {
      console.warn('OTP fallback error:', error);
      const { error: signUpError } = await signUp(signupEmail, signupPassword, signupName, signupPhone);
      if (signUpError) {
        toast.error(signUpError.message);
      } else {
        toast.success(isBn ? '🎉 অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!' : 'Account created successfully!');
      }
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    const nextEmptyIndex = newOtp.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    otpInputRefs.current[focusIndex]?.focus();
  };

  const verifyOtpAndSignup = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      toast.error(isBn ? 'সম্পূর্ণ ৬ সংখ্যার কোড দিন' : 'Enter 6 digit code');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signUp(signupEmail, signupPassword, signupName, signupPhone);
      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error(t('login.userExists') || 'এই ইমেইলে আগেই অ্যাকাউন্ট খোলা হয়েছে');
        } else {
          toast.error(error.message);
        }
        setIsLoading(false);
        return;
      }
      setShowOtpVerification(false);
      toast.success('🎉 ' + (t('login.accountCreated') || 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!'));
    } catch (err: any) {
      toast.error(err.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        toast.error(error.message || 'Google লগইনে সমস্যা হয়েছে');
      }
    } catch (err: any) {
      toast.error(err.message || 'Google লগইনে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
          <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
            {isBn ? 'শিক্ষার্থী পোর্টাল' : 'Student Portal'}
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
                {showOtpVerification 
                  ? (isBn ? 'ইমেইল ভেরিফিকেশন' : 'Email Verification') 
                  : (isBn ? 'শিক্ষার্থী লগইন' : 'Student Sign In')}
              </h1>
              <p className="text-xs text-muted-foreground">
                {isBn ? 'এইচএসসি ও ভর্তি পরীক্ষার ক্লাসে যোগ দিন' : 'Access your academic courses and live classes'}
              </p>
            </div>

            {/* OTP Verification UI */}
            {showOtpVerification ? (
              <div className="space-y-6">
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => { otpInputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className="w-11 h-12 text-center text-xl font-bold rounded-xl border-2 focus:border-primary transition-colors"
                    />
                  ))}
                </div>

                <div className="text-center">
                  {otpTimer > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {isBn ? 'কোডের মেয়াদ বাকি: ' : 'Code expires in: '}
                      <span className="font-mono font-bold text-primary">{formatTime(otpTimer)}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-destructive font-medium">
                      {isBn ? 'কোডের মেয়াদ শেষ হয়েছে' : 'Code expired'}
                    </p>
                  )}
                </div>

                <Button 
                  onClick={verifyOtpAndSignup} 
                  className="w-full h-11 font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white"
                  disabled={isLoading || otp.join('').length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {isBn ? 'যাচাই করা হচ্ছে...' : 'Verifying...'}
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      {isBn ? 'ভেরিফাই ও সম্পন্ন করুন' : 'Verify & Complete'}
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-between text-xs">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowOtpVerification(false)}
                    className="gap-1 text-muted-foreground"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    {isBn ? 'ফিরে যান' : 'Go Back'}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={sendOtp}
                    disabled={sendingOtp || otpTimer > 90}
                    className="gap-1 text-primary"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {isBn ? 'নতুন কোড পাঠান' : 'Resend Code'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">

                {/* Tabs for Login & Sign Up */}
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-5 rounded-xl bg-muted/50 p-1">
                    <TabsTrigger value="login" className="rounded-lg text-xs font-bold">
                      {isBn ? 'লগইন' : 'Sign In'}
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="rounded-lg text-xs font-bold">
                      {isBn ? 'রেজিস্ট্রেশন' : 'Register'}
                    </TabsTrigger>
                  </TabsList>

                  {/* 1. STUDENT LOGIN */}
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="login-email" className="text-xs font-semibold">
                          {isBn ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="student@example.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="pl-9 h-11 rounded-xl text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="login-password" className="text-xs font-semibold">
                            {isBn ? 'পাসওয়ার্ড' : 'Password'}
                          </Label>
                          <Link 
                            to="/forgot-password" 
                            className="text-xs text-primary hover:underline font-medium"
                          >
                            {isBn ? 'ভুলে গেছেন?' : 'Forgot password?'}
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="login-password"
                            type={showLoginPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="pl-9 pr-10 h-11 rounded-xl text-sm"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-11 font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            {isBn ? 'লগইন হচ্ছে...' : 'Signing in...'}
                          </>
                        ) : (
                          isBn ? 'লগইন করুন' : 'Sign In'
                        )}
                      </Button>

                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-border/80" />
                        </div>
                        <div className="relative flex justify-center text-[11px] uppercase">
                          <span className="bg-card px-2 text-muted-foreground font-semibold">
                            {isBn ? 'অথবা' : 'OR'}
                          </span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11 gap-2 rounded-xl border-border text-foreground hover:bg-muted font-semibold text-xs"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        {isBn ? 'গুগল দিয়ে প্রবেশ করুন' : 'Sign in with Google'}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* 2. STUDENT SIGN UP (Clean & Minimal) */}
                  <TabsContent value="signup">
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <Label htmlFor="signup-name" className="text-xs font-semibold">
                          {isBn ? 'আপনার পূর্ণ নাম' : 'Full Name'}
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder={isBn ? 'যেমন: সাকিব আহমেদ' : 'e.g. Shakib Ahmed'}
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            className="pl-9 h-10.5 rounded-xl text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="signup-phone" className="text-xs font-semibold">
                          {isBn ? 'মোবাইল নম্বর' : 'Phone Number'}
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="signup-phone"
                            type="tel"
                            placeholder="01XXXXXXXXX"
                            value={signupPhone}
                            onChange={(e) => setSignupPhone(e.target.value)}
                            className="pl-9 h-10.5 rounded-xl text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="signup-email" className="text-xs font-semibold">
                          {isBn ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="student@example.com"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            className="pl-9 h-10.5 rounded-xl text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="signup-password" className="text-xs font-semibold">
                          {isBn ? 'পাসওয়ার্ড' : 'Password'}
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type={showSignupPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            className="pl-9 pr-10 h-10.5 rounded-xl text-sm"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <Button 
                        type="button" 
                        className="w-full h-11 font-bold rounded-xl bg-primary hover:bg-primary/90 text-white mt-1" 
                        disabled={sendingOtp}
                        onClick={sendOtp}
                      >
                        {sendingOtp ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            {isBn ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating Account...'}
                          </>
                        ) : (
                          isBn ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create Student Account'
                        )}
                      </Button>

                      <div className="relative my-3">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-border/80" />
                        </div>
                        <div className="relative flex justify-center text-[11px] uppercase">
                          <span className="bg-card px-2 text-muted-foreground font-semibold">
                            {isBn ? 'অথবা' : 'OR'}
                          </span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-10 gap-2 rounded-xl border-border text-foreground hover:bg-muted font-semibold text-xs"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        {isBn ? 'গুগল দিয়ে সাইন আপ করুন' : 'Sign up with Google'}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Bottom Links to Teacher and Admin Portals */}
            <div className="pt-5 mt-5 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
              <Link 
                to="/teacher/login" 
                className="hover:text-primary transition-colors flex items-center gap-1 font-medium"
              >
                <GraduationCap className="w-3.5 h-3.5 text-primary" />
                <span>{isBn ? 'শিক্ষক বা মেন্টর পোর্টাল' : 'Teacher Portal'}</span>
              </Link>
              <Link 
                to="/admin/login" 
                className="hover:text-primary transition-colors flex items-center gap-1 font-medium"
              >
                <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{isBn ? 'অ্যাডমিন পোর্টাল' : 'Admin Portal'}</span>
              </Link>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
