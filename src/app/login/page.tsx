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
import { Globe, Loader2 } from 'lucide-react';

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

  // If already signed in, go straight to dashboard
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
        console.log('Sign-in requires additional steps:', result);

        // Try to use email_code as additional verification factor
        const emailCodeFactor: any = result.supportedFirstFactors?.find(
          (factor: any) => factor.strategy === 'email_code'
        );

        if (emailCodeFactor) {
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: emailCodeFactor.emailAddressId,
          });

          setStep('code');
          setInfo('We sent a 6-digit code to your email. Please enter it below to finish signing in.');
        } else {
          setError('Additional verification required, but no email code factor is available.');
        }
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      const message = err?.errors?.[0]?.message || 'Invalid email or password.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLoaded || !signIn) {
      setError('Login service is not ready yet. Please wait a moment and try again.');
      return;
    }

    try {
      setLoading(true);

      const completeSignIn = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code,
      });

      if (completeSignIn.status === 'complete') {
        await setActive({ session: completeSignIn.createdSessionId });
        const redirectUrl = searchParams.get('redirect_url') || '/dashboard';
        router.push(redirectUrl);
      } else {
        console.log('Email-code verification not complete:', completeSignIn);
        setError('Verification not complete. Please try again.');
      }
    } catch (err: any) {
      console.error('Error verifying code:', err);
      const message = err?.errors?.[0]?.message || 'Invalid or expired code. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/50 p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
        >
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
            <CardTitle className="text-2xl">{t('login')}</CardTitle>
            <CardDescription>
              {step === 'password'
                ? t('welcomeBack')
                : 'Enter the 6-digit code we sent to your email.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {info && !error && (
              <Alert className="mb-4">
                <AlertDescription>{info}</AlertDescription>
              </Alert>
            )}

            {step === 'password' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    autoComplete="current-password"
                    className="h-11 bg-background/50"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                  disabled={loading}
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {t('signIn')}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">6-digit Code</Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                    disabled={loading}
                    className="h-11 bg-background/50 tracking-widest text-center"
                  />
                </div>

                <div className="flex justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 flex-1"
                    disabled={loading}
                    onClick={() => {
                      setStep('password');
                      setCode('');
                      setInfo('');
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="h-11 flex-1 text-base font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                    disabled={loading || code.length !== 6}
                  >
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Verify & Continue
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              {t('noAccount')}{' '}
              <Link href="/register" className="text-primary hover:underline font-medium">
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
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <LoginForm />
      </Suspense>
    </I18nProvider>
  );
}
