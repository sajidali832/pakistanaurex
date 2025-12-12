"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSignUp, useAuth } from '@clerk/nextjs';
import { useI18n, I18nProvider } from '@/lib/i18n';
import { AurexLogo } from '@/components/AurexLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Globe, Loader2, Mail, ArrowLeft, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function RegisterForm() {
  const { t, language, setLanguage, isRTL } = useI18n();
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      router.push('/activate');
    }
  }, [isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    if (password.length < 8) {
      setError(`${t('minLength')} 8`);
      return;
    }

    if (!isLoaded) return;

    setLoading(true);

    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || undefined,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      const errorMessage = err?.errors?.[0]?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (code: string) => {
    if (!isLoaded || code.length !== 6) return;

    setVerifying(true);
    setError('');

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });

      if (completeSignUp.status === 'complete') {
        setVerificationSuccess(true);
        await setActive({ session: completeSignUp.createdSessionId });
        await new Promise(resolve => setTimeout(resolve, 2000));
        router.push('/activate');
      } else {
        setError('Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      const errorMessage = err?.errors?.[0]?.message || 'Invalid verification code.';
      setError(errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded) return;
    setError('');
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    } catch (err: any) {
      setError('Failed to resend code. Please try again.');
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  if (verificationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-green-500/20 via-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl -z-10 opacity-60" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center"
          >
            <Check className="h-12 w-12 text-white" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-center bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent"
          >
            Account Created!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground"
          >
            Setting up your account...
          </motion.p>
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </motion.div>
      </div>
    );
  }

  if (pendingVerification) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-full blur-3xl -z-10 opacity-60 pointer-events-none animate-pulse duration-[5000ms]" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-gradient-to-bl from-pink-500/20 via-orange-500/20 to-yellow-500/20 rounded-full blur-3xl -z-10 opacity-40 pointer-events-none" />

        <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={toggleLanguage}>
            <Globe className="h-4 w-4 mr-2" />
            {language === 'en' ? 'اردو' : 'English'}
          </Button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-6 relative z-10"
        >
          <div className="flex flex-col items-center space-y-2">
            <AurexLogo size="md" variant="full" />
          </div>

          <Card className="border bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-xl">
            <CardHeader className="text-center pb-2">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-3"
              >
                <Mail className="h-8 w-8 text-white" />
              </motion.div>
              <CardTitle className="text-lg">Verify Your Email</CardTitle>
              <CardDescription className="text-sm">
                Enter the 6-digit code sent to
                <br />
                <span className="font-medium text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col items-center space-y-3">
                <InputOTP
                  maxLength={6}
                  value={verificationCode}
                  onChange={(value) => {
                    setVerificationCode(value);
                    if (value.length === 6) {
                      handleVerification(value);
                    }
                  }}
                  disabled={verifying}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-10 h-10 text-lg rounded-full border-2" />
                    <InputOTPSlot index={1} className="w-10 h-10 text-lg rounded-full border-2" />
                    <InputOTPSlot index={2} className="w-10 h-10 text-lg rounded-full border-2" />
                    <InputOTPSlot index={3} className="w-10 h-10 text-lg rounded-full border-2" />
                    <InputOTPSlot index={4} className="w-10 h-10 text-lg rounded-full border-2" />
                    <InputOTPSlot index={5} className="w-10 h-10 text-lg rounded-full border-2" />
                  </InputOTPGroup>
                </InputOTP>

                {verifying && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Verifying...</span>
                  </motion.div>
                )}
              </div>

              <div className="text-center">
                <Button variant="ghost" size="sm" onClick={handleResendCode} className="text-sm">
                  Resend Code
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pt-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPendingVerification(false)}
                className="text-muted-foreground text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign Up
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-full blur-3xl -z-10 opacity-60 pointer-events-none animate-pulse duration-[5000ms]" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-gradient-to-bl from-pink-500/20 via-orange-500/20 to-yellow-500/20 rounded-full blur-3xl -z-10 opacity-40 pointer-events-none" />

      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        <ThemeToggle />
        <Button variant="ghost" size="sm" onClick={toggleLanguage}>
          <Globe className="h-4 w-4 mr-2" />
          {language === 'en' ? 'اردو' : 'English'}
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6 relative z-10"
      >
        <div className="flex flex-col items-center space-y-2">
          <AurexLogo size="md" variant="full" />
          <p className="text-muted-foreground text-sm text-center">{t('tagline')}</p>
        </div>

        <Card className="border border-white/20 dark:border-white/10 bg-white/30 dark:bg-black/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent pointer-events-none" />
          <CardHeader className="text-center pb-4 relative z-10">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('register')}</CardTitle>
            <CardDescription className="text-sm">Create your business account</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium">{t('name')}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  className="h-10 bg-white/50 dark:bg-black/20 border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-10 bg-white/50 dark:bg-black/20 border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={8}
                  autoComplete="new-password"
                  className="h-10 bg-white/50 dark:bg-black/20 border-white/20 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">{t('confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  className="h-10 bg-white/50 dark:bg-black/20 border-white/20 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-10 text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/20 transition-all"
                disabled={loading || !isLoaded}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t('signUp')}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center pt-0 relative z-10">
            <p className="text-sm text-muted-foreground">
              {t('hasAccount')}{' '}
              <Link href="/login" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                {t('login')}
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <I18nProvider>
      <RegisterForm />
    </I18nProvider>
  );
}