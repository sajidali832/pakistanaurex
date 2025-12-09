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
import { Globe, Loader2, Mail, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';

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

  // Verification state
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard');
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

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      console.error('Sign up error:', err);
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
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push('/dashboard');
      } else {
        setError('Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
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

  // Verification Code UI
  if (pendingVerification) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/50 p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={toggleLanguage}>
            <Globe className="h-4 w-4 mr-2" />
            {language === 'en' ? 'اردو' : 'English'}
          </Button>
        </div>

        <div className="w-full max-w-md space-y-6 relative z-10">
          <div className="flex flex-col items-center space-y-3">
            <AurexLogo size="xl" variant="full" />
          </div>

          <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Check Your Email</CardTitle>
              <CardDescription className="text-base">
                We've sent a verification code to
                <br />
                <span className="font-medium text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col items-center space-y-4">
                <Label className="text-sm text-muted-foreground">
                  Enter the 6-digit code
                </Label>
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
                  className="gap-2"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-12 h-14 text-xl font-semibold border-2 rounded-lg" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-xl font-semibold border-2 rounded-lg" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-xl font-semibold border-2 rounded-lg" />
                    <InputOTPSlot index={3} className="w-12 h-14 text-xl font-semibold border-2 rounded-lg" />
                    <InputOTPSlot index={4} className="w-12 h-14 text-xl font-semibold border-2 rounded-lg" />
                    <InputOTPSlot index={5} className="w-12 h-14 text-xl font-semibold border-2 rounded-lg" />
                  </InputOTPGroup>
                </InputOTP>

                {verifying && (
                  <div className="flex items-center gap-2 text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Verifying...</span>
                  </div>
                )}
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendCode}
                  className="text-primary hover:text-primary/80"
                >
                  Resend Code
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pt-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPendingVerification(false)}
                className="text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign Up
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Main Registration Form
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/50 p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <ThemeToggle />
        <Button variant="ghost" size="sm" onClick={toggleLanguage}>
          <Globe className="h-4 w-4 mr-2" />
          {language === 'en' ? 'اردو' : 'English'}
        </Button>
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="flex flex-col items-center space-y-3">
          <AurexLogo size="xl" variant="full" />
          <p className="text-muted-foreground text-center">{t('tagline')}</p>
        </div>

        <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center mb-2 shadow-lg">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">{t('register')}</CardTitle>
            <CardDescription>Create your business account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">{t('name')}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
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
                  className="h-11 bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  className="h-11 bg-background/50"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                disabled={loading || !isLoaded}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t('signUp')}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              {t('hasAccount')}{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                {t('login')}
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
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