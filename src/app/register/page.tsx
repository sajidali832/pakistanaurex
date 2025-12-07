"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n, I18nProvider } from '@/lib/i18n';
import { authClient, useSession } from '@/lib/auth-client';
import { AurexLogo } from '@/components/AurexLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, Loader2 } from 'lucide-react';

type ErrorTypes = Partial<Record<keyof typeof authClient.$ERROR_CODES, string>>;
const errorCodes: ErrorTypes = {
  USER_ALREADY_EXISTS: "Email already registered",
};

function RegisterForm() {
  const { t, language, setLanguage, isRTL } = useI18n();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.user) {
      router.push('/dashboard');
    }
  }, [session, router]);

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

    setLoading(true);

    const { error: authError } = await authClient.signUp.email({
      email,
      name,
      password,
    });

    if (authError?.code) {
      const errorMessage = errorCodes[authError.code as keyof typeof errorCodes] || 'Registration failed';
      setError(errorMessage);
      setLoading(false);
      return;
    }

    router.push('/login?registered=true');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="absolute top-4 right-4 flex items-center gap-2">
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

      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <AurexLogo size="xl" variant="full" />
          <p className="text-muted-foreground text-center">{t('tagline')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('register')}</CardTitle>
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
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
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
                  autoComplete="off"
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
                  autoComplete="off"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
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