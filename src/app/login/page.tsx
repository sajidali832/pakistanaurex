"use client";

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSignIn, useAuth } from '@clerk/nextjs';
import { useI18n, I18nProvider } from '@/lib/i18n';
import { AurexLogo } from '@/components/AurexLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Globe, Loader2, Mail, ArrowLeft } from 'lucide-react';

type Step = 'password' | 'code';

function LoginForm() {
  const { t, language, setLanguage, isRTL } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [step, setStep] = useState<Step>('password');

  useEffect(() => {
    if (authLoaded && isSignedIn) {
      const redirectUrl = searchParams.get('redirect_url') || '/dashboard';
      router.push(redirectUrl);
    }
  }, [authLoaded, isSignedIn, router, searchParams]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!isLoaded || !signIn) {
      setError('Login service is not ready yet. Please wait a moment and try again.');
      return;
    }

    try {
      setLoading(true);

      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        const redirectUrl = searchParams.get('redirect_url') || '/dashboard';
        router.push(redirectUrl);
      } else {
        const emailCodeFactor: any = result.supportedFirstFactors?.find(
          (factor: any) => factor.strategy === 'email_code'
        );

        if (emailCodeFactor) {
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: emailCodeFactor.emailAddressId,
          });

          setStep('code');
          setInfo('We sent a 6-digit code to your email.');
        } else {
          setError('Additional verification required, but no email code factor is available.');
        }
      }
    } catch (err: any) {
      const message = err?.errors?.[0]?.message || 'Invalid email or password.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (codeValue: string) => {
    if (codeValue.length !== 6) return;
    
    setError('');

    if (!isLoaded || !signIn) {
      setError('Login service is not ready yet.');
      return;
    }

    try {
      setLoading(true);

      const completeSignIn = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code: codeValue,
      });

      if (completeSignIn.status === 'complete') {
        await setActive({ session: completeSignIn.createdSessionId });
        const redirectUrl = searchParams.get('redirect_url') || '/dashboard';
        router.push(redirectUrl);
      } else {
        setError('Verification not complete. Please try again.');
      }
    } catch (err: any) {
      const message = err?.errors?.[0]?.message || 'Invalid or expired code.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'code') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-full blur-3xl -z-10 opacity-60 pointer-events-none animate-pulse duration-[5000ms]" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-gradient-to-bl from-pink-500/20 via-orange-500/20 to-yellow-500/20 rounded-full blur-3xl -z-10 opacity-40 pointer-events-none" />
        
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={toggleLanguage}>
            <Globe className="h-4 w-4 mr-2" />
            {language === 'en' ? 'اردو' : 'English'}
          </Button>
        </div>

        <div className="w-full max-w-sm space-y-6 relative z-10">
          <div className="flex flex-col items-center space-y-2">
            <AurexLogo size="md" variant="full" />
          </div>

          <Card className="border bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                <Mail className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg">Check Your Email</CardTitle>
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
                  value={code}
                  onChange={(value) => {
                    setCode(value);
                    if (value.length === 6) {
                      handleVerifyCode(value);
                    }
                  }}
                  disabled={loading}
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

                {loading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Verifying...</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pt-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStep('password');
                  setCode('');
                  setInfo('');
                }}
                className="text-muted-foreground text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-full blur-3xl -z-10 opacity-60 pointer-events-none animate-pulse duration-[5000ms]" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-gradient-to-bl from-pink-500/20 via-orange-500/20 to-yellow-500/20 rounded-full blur-3xl -z-10 opacity-40 pointer-events-none" />

      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        <ThemeToggle />
        <Button variant="ghost" size="sm" onClick={toggleLanguage}>
          <Globe className="h-4 w-4 mr-2" />
          {language === 'en' ? 'اردو' : 'English'}
        </Button>
      </div>

      <div className="w-full max-w-sm space-y-6 relative z-10">
        <div className="flex flex-col items-center space-y-2">
          <AurexLogo size="md" variant="full" />
          <p className="text-muted-foreground text-sm text-center">{t('tagline')}</p>
        </div>

        <Card className="border border-white/20 dark:border-white/10 bg-white/30 dark:bg-black/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent pointer-events-none" />
          <CardHeader className="text-center pb-4 relative z-10">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('login')}</CardTitle>
            <CardDescription className="text-sm">{t('welcomeBack')}</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            {error && (
              <Alert variant="destructive" className="mb-4 bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  autoComplete="current-password"
                  className="h-10 bg-white/50 dark:bg-black/20 border-white/20 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-10 text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/20 transition-all"
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t('signIn')}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center pt-0 relative z-10">
            <p className="text-sm text-muted-foreground">
              {t('noAccount')}{' '}
              <Link href="/register" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                {t('register')}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <I18nProvider>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>} >
        <LoginForm />
      </Suspense>
    </I18nProvider>
  );
}