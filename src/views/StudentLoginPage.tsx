import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from 'next-themes';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { GraduationCap, ArrowLeft, Mail, Lock, User, Sun, Moon, Globe, ShieldCheck, Loader2, RefreshCw, Phone, Users, Eye, EyeOff, Sparkles, ArrowRight, Shield, Play } from 'lucide-react';
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
  
  // Teacher Signup States
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [selectedTeamMember, setSelectedTeamMember] = useState('');
  const [teacherSignupMode, setTeacherSignupMode] = useState<'select' | 'otp'>('select');
  
  // OTP States
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [isTeacherOtp, setIsTeacherOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Team members for teacher signup
  const teamMembers = null;
  const teamMembersLoading = false;
  
  const { user, role, session, isLoading: authLoading, signIn, signUp, signInAsRole } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const isBn = language === 'bn';
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleBypassLogin = async (targetRole: 'student' | 'teacher' | 'admin' = 'student') => {
    try {
      setIsLoading(true);
      await signInAsRole(targetRole);
      toast.success(
        targetRole === 'admin' 
          ? 'লগইন বাইপাস সফল! এডমিন প্যানেলে প্রবেশ করছেন...' 
          : targetRole === 'teacher'
          ? 'লগইন বাইপাস সফল! ইন্সট্রাক্টর প্যানেলে প্রবেশ করছেন...'
          : 'লগইন বাইপাস সফল! স্টুডেন্ট ড্যাশবোর্ডে প্রবেশ করছেন...'
      );
      if (targetRole === 'admin') {
        navigate('/admin');
      } else if (targetRole === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (err: any) {
      toast.error(err.message || 'Bypass failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loginSchema = z.object({
    email: z.string().email(t('login.invalidEmail')),
    password: z.string().min(6, t('login.passwordMin')),
  });

  const signupSchema = z.object({
    fullName: z.string().min(2, t('login.nameMin')),
    email: z.string().email(t('login.invalidEmail')),
    password: z.string().min(6, t('login.passwordMin')),
    phone: z.string().min(11, 'সঠিক মোবাইল নম্বর দিন').max(14, 'সঠিক মোবাইল নম্বর দিন'),
  });

  const teacherSignupSchema = z.object({
    fullName: z.string().min(2, t('login.nameMin')),
    email: z.string().email(t('login.invalidEmail')),
    password: z.string().min(6, t('login.passwordMin')),
    phone: z.string().min(11, 'সঠিক মোবাইল নম্বর দিন').max(14, 'সঠিক মোবাইল নম্বর দিন'),
    teamMemberId: z.string().min(1, 'Team member সিলেক্ট করুন'),
  });

  // OTP timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Only auto-redirect if there is an active real session and not on testing mode
  useEffect(() => {
    if (authLoading) return;
    // Don't auto-trap or blank screen if user is already visiting the login page
    // Only redirect if user has a real remote supabase session (not demo test)
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
        toast.error(t('login.invalidCredentials'));
      } else {
        toast.error(error.message);
      }
      return;
    }

    // Teacher/Admin login also allowed here — redirect handled by useEffect based on role


    setIsLoading(false);
    toast.success(t('login.loginSuccess'));
  };

  const sendOtp = async (forTeacher = false) => {
    if (forTeacher) {
      const validation = teacherSignupSchema.safeParse({ 
        fullName: teacherName, 
        email: teacherEmail, 
        password: teacherPassword,
        phone: teacherPhone,
        teamMemberId: selectedTeamMember
      });
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }
    } else {
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
    }

    const emailToUse = forTeacher ? teacherEmail : signupEmail;
    const nameToUse = forTeacher ? teacherName : signupName;

    setSendingOtp(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { email: emailToUse, name: nameToUse }
      });

      if (error) throw error;

      if (data?.success) {
        setShowOtpVerification(true);
        setIsTeacherOtp(forTeacher);
        setOtpTimer(120); // 2 minutes
        setOtp(['', '', '', '', '', '']);
        toast.success('✉️ ভেরিফিকেশন কোড আপনার ইমেইলে পাঠানো হয়েছে');
        
        // Focus first OTP input
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      } else {
        throw new Error(data?.error || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('OTP send error:', error);
      toast.error(error.message || 'OTP পাঠাতে সমস্যা হয়েছে');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last digit
    setOtp(newOtp);

    // Auto-focus next input
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
    
    // Focus the next empty input or last input
    const nextEmptyIndex = newOtp.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    otpInputRefs.current[focusIndex]?.focus();
  };

  const verifyOtpAndSignup = async () => {
    const enteredOtp = otp.join('');
    
    if (enteredOtp.length !== 6) {
      toast.error('সম্পূর্ণ ৬ সংখ্যার কোড দিন');
      return;
    }

    if (otpTimer === 0) {
      toast.error('কোডের মেয়াদ শেষ। নতুন কোড নিন');
      return;
    }

    const emailForVerify = isTeacherOtp ? teacherEmail : signupEmail;
    try {
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-otp', {
        body: { email: emailForVerify, otp: enteredOtp }
      });
      if (verifyError) throw verifyError;
      if (!verifyData?.success) {
        toast.error(verifyData?.error || 'ভুল কোড! আবার চেষ্টা করুন');
        setOtp(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
        return;
      }
    } catch (err: any) {
      toast.error(err.message || 'OTP যাচাই করতে সমস্যা হয়েছে');
      return;
    }

    setIsLoading(true);

    if (isTeacherOtp) {
      // Teacher signup flow
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: teacherEmail,
          password: teacherPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: teacherName,
            },
          },
        });

        if (authError) throw authError;

        if (authData.user) {
          // Create profile with is_teacher = true and linked_team_member_id
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: authData.user.id,
              full_name: teacherName,
              email: teacherEmail,
              phone_number: teacherPhone,
              is_teacher: true,
              teacher_approved: false,
              linked_team_member_id: selectedTeamMember,
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }

          // Assign student role initially (will be upgraded to teacher after approval)
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: authData.user.id,
              role: 'student',
            });

          if (roleError) {
            console.error('Role assignment error:', roleError);
          }

          setShowOtpVerification(false);
          setIsTeacherOtp(false);
          toast.success('🎓 Teacher আবেদন সফল! Admin approval এর পর আপনি Teacher হিসেবে login করতে পারবেন।');
        }
      } catch (error: any) {
        if (error.message.includes('User already registered')) {
          toast.error(t('login.userExists'));
        } else {
          toast.error(error.message);
        }
      }
    } else {
      // Regular student signup
      const { error } = await signUp(signupEmail, signupPassword, signupName, signupPhone);

      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error(t('login.userExists'));
        } else {
          toast.error(error.message);
        }
        setIsLoading(false);
        return;
      }

      setShowOtpVerification(false);
      toast.success('🎉 ' + t('login.accountCreated'));
    }

    setIsLoading(false);
  };

  const resendOtp = async () => {
    if (otpTimer > 90) { // Can resend after 30 seconds (120 - 30 = 90)
      toast.error('৩০ সেকেন্ড পর আবার চেষ্টা করুন');
      return;
    }
    await sendOtp(isTeacherOtp);
  };

  const handleStudentOtp = () => sendOtp(false);

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
        toast.error(error.message || 'Google লগইনে সমস্যা হয়েছে');
      }
    } catch (err: any) {
      toast.error(err.message || 'Google লগইনে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };
  const handleTeacherOtp = () => sendOtp(true);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // No loading screen - login page loads directly

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 w-full bg-cus-gray-50 dark:bg-background py-10 px-4">
      <div className="w-full max-w-[440px]">
        {/* Top Back Link */}
        <div className="flex items-center justify-between mb-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('login.backHome')}</span>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="rounded-xl bg-white dark:bg-card border border-gray-100 dark:border-border/50 shadow-cus_round overflow-hidden p-6 sm:p-8">
          <div className="text-center space-y-2 mb-4">
            <Link to="/" className="inline-block">
              <img 
                src={learnLogo} 
                alt="Astropixel Learn Logo" 
                className="w-28 mx-auto mb-1 brightness-0 dark:invert object-contain"
              />
            </Link>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Welcome to <span className="font-semibold text-brand-500">Astropixel</span>
              </p>
              <h1 className="text-xl font-bold text-foreground mt-1">
                {showOtpVerification ? 'Email Verification' : 'Sign in'}
              </h1>
            </div>
          </div>

          <div className="px-5 sm:px-6 pb-2">
            {showOtpVerification ? (
              /* OTP Verification UI */
              <div className="space-y-6">
                {/* OTP Input */}
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
                      className="w-11 h-14 text-center text-xl font-bold rounded-xl border-2 focus:border-primary transition-colors"
                    />
                  ))}
                </div>

                {/* Timer */}
                <div className="text-center">
                  {otpTimer > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Code expires in: <span className="font-mono font-bold text-primary">{formatTime(otpTimer)}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-destructive font-medium">Code expired</p>
                  )}
                </div>

                {/* Verify Button */}
                <Button 
                  onClick={verifyOtpAndSignup} 
                  className="w-full h-11 gap-2"
                  disabled={isLoading || otp.join('').length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Verify Email
                    </>
                  )}
                </Button>

                {/* Resend & Back */}
                <div className="flex items-center justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowOtpVerification(false)}
                    className="gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={resendOtp}
                    disabled={sendingOtp || otpTimer > 90}
                    className="gap-1"
                  >
                    {sendingOtp ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Resend Code
                  </Button>
                </div>
              </div>
            ) : (
              /* Login/Signup/Teacher Tabs */
              <div className="w-full">
                {/* 🚀 Skip Login / Testing Bypass Card */}
                <div className="mb-5 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-blue-500/10 border border-brand-500/30 dark:border-brand-500/20">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400">
                      <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
                      <span>{isBn ? 'টেস্টিং বাইপাস (লগইন ছাড়াই দেখুন)' : 'Testing Mode (Skip Login)'}</span>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-700 dark:text-brand-300">
                      Dev Preview
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-3 leading-snug">
                    {isBn 
                      ? 'ড্যাশবোর্ড, লাইভ ক্লাস ও কোর্স প্লেয়ার পরীক্ষা করার জন্য নিচের যেকোনো বাটনে ক্লিক করে সরাসরি প্রবেশ করুন:' 
                      : 'Bypass credentials to test Student Dashboard, Course Player, or Instructor Panel:'}
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleBypassLogin('student')}
                      disabled={isLoading}
                      className="h-8 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-xs rounded-lg"
                    >
                      🎓 {isBn ? 'স্টুডেন্ট' : 'Student'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleBypassLogin('teacher')}
                      disabled={isLoading}
                      className="h-8 text-xs font-semibold border-border hover:bg-muted text-foreground rounded-lg"
                    >
                      👨‍🏫 {isBn ? 'টিচার' : 'Teacher'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleBypassLogin('admin')}
                      disabled={isLoading}
                      className="h-8 text-xs font-semibold border-border hover:bg-muted text-foreground rounded-lg"
                    >
                      ⚡ {isBn ? 'এডমিন' : 'Admin'}
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login" className="text-sm">Login</TabsTrigger>
                    <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="your@email.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10 h-11"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10 pr-10 h-11"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Link 
                        to="/forgot-password" 
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <Button type="submit" className="w-full h-11 font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-md shadow-sm" disabled={isLoading}>
                      {isLoading ? 'Logging in...' : 'Sign in'}
                    </Button>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">OR</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 gap-2 rounded-lg border border-gray-300 dark:border-border text-foreground hover:bg-gray-50 dark:hover:bg-accent"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign in with Google
                    </Button>

                    {/* EdgeCourseBD Video Help Banner */}
                    <div className="w-full p-[8px] bg-[#17181D] border border-white/10 rounded-[8px] grid grid-cols-[1fr,88px] gap-2 items-center box-border mt-3">
                      <div className="flex items-center gap-2 text-white text-xs">
                        <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                          <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                        </div>
                        <span className="font-medium text-[13px] leading-tight">
                          {isBn ? "লগইন করতে সমস্যা হলে ভিডিওটি দেখো" : "Watch help video for signing in"}
                        </span>
                      </div>
                      <a
                        href="https://youtube.com/@astropixel_tech"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#DF6818] hover:bg-[#d46215] text-white text-[12px] font-semibold flex items-center justify-center py-[6px] px-[10px] rounded-[7px] transition-colors text-center"
                      >
                        Play Video
                      </a>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-sm">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Your Full Name"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          className="pl-10 h-11"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-phone" className="text-sm">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="01XXXXXXXXX"
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value)}
                          className="pl-10 h-11"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your@email.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="pl-10 h-11"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showSignupPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="pl-10 pr-10 h-11"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                        >
                          {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Password strength indicator */}
                      {signupPassword.length > 0 && (() => {
                        let strength = 0;
                        if (signupPassword.length >= 6) strength += 1;
                        if (signupPassword.length >= 8) strength += 1;
                        if (/[A-Z]/.test(signupPassword) || /[a-z]/.test(signupPassword)) strength += 1;
                        if (/[0-9]/.test(signupPassword) || /[^A-Za-z0-9]/.test(signupPassword)) strength += 1;

                        const colors = ['bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];
                        const labels = isBn ? ['দুর্বল', 'সাধারণ', 'ভালো', 'খুব শক্তিশালী'] : ['Weak', 'Fair', 'Good', 'Strong'];

                        return (
                          <div className="space-y-1.5 pt-1">
                            <div className="flex gap-1 h-1.5">
                              {[0, 1, 2, 3].map((idx) => (
                                <div
                                  key={idx}
                                  className={`flex-1 rounded-full transition-all duration-300 ${
                                    idx < strength ? colors[strength - 1] : 'bg-muted/40'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                              <span>{isBn ? 'পাসওয়ার্ড শক্তি:' : 'Password strength:'}</span>
                              <span className={`font-medium ${
                                strength === 1 ? 'text-red-400' :
                                strength === 2 ? 'text-amber-400' :
                                strength === 3 ? 'text-blue-400' : 'text-emerald-400'
                              }`}>
                                {labels[strength - 1] || (isBn ? 'দুর্বল' : 'Weak')}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <Button 
                      type="button" 
                      className="w-full h-11 gap-2 font-semibold" 
                      disabled={sendingOtp}
                      onClick={handleStudentOtp}
                    >
                      {sendingOtp ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending Code...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          Verify Email
                        </>
                      )}
                    </Button>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">OR</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 gap-2"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign up with Google
                    </Button>
                  </div>
                </TabsContent>

                {/* Teacher info removed - teachers use /teacher/login */}
              </Tabs>
              </div>
            )}
          </div>

          {!showOtpVerification && (
            <div className="text-center text-xs text-muted-foreground px-5 pb-5">
              <p>{t('login.autoPassCode')}</p>
            </div>
          )}
        </div>
        </motion.div>
      </div>
    </div>
  );
}
