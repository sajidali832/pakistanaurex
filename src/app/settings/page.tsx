"use client";

import React, { useState, useEffect } from 'react';
import { I18nProvider, useI18n } from '@/lib/i18n';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Loader2, Building2, Globe, CreditCard } from 'lucide-react';

interface Company {
  id: number;
  name: string;
  nameUrdu: string | null;
  ntnNumber: string | null;
  strnNumber: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankIban: string | null;
  defaultCurrency: string;
}

function SettingsContent() {
  const { t, language, setLanguage } = useI18n();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({});

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const res = await fetch('/api/companies');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCompany(data[0]);
        setFormData(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    if (!company) return;
    
    setSaving(true);
    try {
      await fetch(`/api/companies?id=${company.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setCompany({ ...company, ...formData } as Company);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            {t('companySettings')}
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Globe className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('companySettings')}</CardTitle>
              <CardDescription>
                Update your company details for invoices and quotations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('companyName')} (English)</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameUrdu">{t('companyName')} (Urdu)</Label>
                  <Input
                    id="nameUrdu"
                    name="nameUrdu"
                    value={formData.nameUrdu || ''}
                    onChange={handleChange}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ntnNumber">{t('ntn')}</Label>
                  <Input
                    id="ntnNumber"
                    name="ntnNumber"
                    value={formData.ntnNumber || ''}
                    onChange={handleChange}
                    placeholder="1234567-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="strnNumber">{t('strnNumber')}</Label>
                  <Input
                    id="strnNumber"
                    name="strnNumber"
                    value={formData.strnNumber || ''}
                    onChange={handleChange}
                    placeholder="08-00-1234-567-89"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t('address')}</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{t('city')}</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('phone')}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <Separator />

              {/* Bank Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t('bankDetails')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">{t('bankName')}</Label>
                    <Input
                      id="bankName"
                      name="bankName"
                      value={formData.bankName || ''}
                      onChange={handleChange}
                      placeholder="Habib Bank Limited"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankAccountNumber">{t('accountNumber')}</Label>
                    <Input
                      id="bankAccountNumber"
                      name="bankAccountNumber"
                      value={formData.bankAccountNumber || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bankIban">{t('iban')}</Label>
                    <Input
                      id="bankIban"
                      name="bankIban"
                      value={formData.bankIban || ''}
                      onChange={handleChange}
                      placeholder="PK36HABB0000001234567890"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  {t('save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Language / زبان</CardTitle>
              <CardDescription>
                Choose your preferred language for the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant={language === 'en' ? 'default' : 'outline'}
                  onClick={() => setLanguage('en')}
                  className="flex-1"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  English
                </Button>
                <Button
                  variant={language === 'ur' ? 'default' : 'outline'}
                  onClick={() => setLanguage('ur')}
                  className="flex-1"
                  dir="rtl"
                >
                  <Globe className="h-4 w-4 ml-2" />
                  اردو
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {language === 'ur' 
                  ? 'اردو میں انوائس اور رپورٹس دکھائی جائیں گی۔ دائیں سے بائیں لے آؤٹ استعمال ہوگا۔'
                  : 'Invoices and reports will be displayed in English. Left-to-right layout will be used.'}
              </p>
            </CardContent>
          </Card>

          {/* Currency Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t('currency')}</CardTitle>
              <CardDescription>
                Default currency for invoices and quotations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium">Pakistani Rupee (PKR)</p>
                  <p className="text-sm text-muted-foreground">
                    روپیہ - Default currency for all transactions
                  </p>
                </div>
                <Button variant="outline" disabled>
                  PKR ₨
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Defaults</CardTitle>
              <CardDescription>
                Default settings for new invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="font-medium">Default Tax Rate</p>
                  <p className="text-2xl font-bold">17%</p>
                  <p className="text-sm text-muted-foreground">Standard GST rate in Pakistan</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="font-medium">Payment Terms</p>
                  <p className="text-2xl font-bold">30 days</p>
                  <p className="text-sm text-muted-foreground">Default invoice due period</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <I18nProvider>
      <AppLayout>
        <SettingsContent />
      </AppLayout>
    </I18nProvider>
  );
}
