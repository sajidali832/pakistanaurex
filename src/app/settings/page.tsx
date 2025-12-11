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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, Loader2, Building2, Globe, CreditCard, Settings2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

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
  defaultTaxRate: number;
  paymentTermsDays: number;
}

function SettingsContent() {
  const { t, language, setLanguage } = useI18n();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({});
  const [hasCompany, setHasCompany] = useState(false);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const res = await fetch('/api/companies');

      if (res.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        window.location.href = `/login?redirect_url=${encodeURIComponent('/settings')}`;
        return;
      }
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setCompany(data[0]);
        setFormData(data[0]);
        setHasCompany(true);
      } else {
        // Initialize empty form for new company
        setFormData({
          name: '',
          nameUrdu: '',
          ntnNumber: '',
          strnNumber: '',
          address: '',
          city: '',
          phone: '',
          email: '',
          bankName: '',
          bankAccountNumber: '',
          bankIban: '',
          defaultCurrency: 'PKR',
          defaultTaxRate: 17,
          paymentTermsDays: 30,
        });
        setHasCompany(false);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Company name is required');
      return;
    }
    
    setSaving(true);
    try {
      if (hasCompany && company) {
        // Update existing company
        await fetch(`/api/companies?id=${company.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        setCompany({ ...company, ...formData } as Company);
        toast.success('Company settings saved successfully');
      } else {
        // Create new company
        const res = await fetch('/api/companies', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            createdAt: new Date().toISOString(),
          }),
        });
        if (res.status === 401) {
          toast.error('Your session has expired. Please log in again.');
          window.location.href = `/login?redirect_url=${encodeURIComponent('/settings')}`;
          return;
        }
        const newCompany = await res.json();

        setCompany(newCompany);
        setHasCompany(true);
        toast.success('Company created successfully! You can now create invoices and quotations.');
      }
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!company) return;
    
    setSavingPrefs(true);
    try {
      await fetch(`/api/companies?id=${company.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          defaultTaxRate: formData.defaultTaxRate,
          paymentTermsDays: formData.paymentTermsDays,
        }),
      });
      setCompany({ ...company, defaultTaxRate: formData.defaultTaxRate!, paymentTermsDays: formData.paymentTermsDays! });
      toast.success('Preferences saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSavingPrefs(false);
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
      {!hasCompany && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Welcome!</strong> Please fill in your company details below to start creating invoices and quotations. 
            All fields should contain your actual business information.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            {t('companySettings')}
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="language" className="gap-2">
            <Globe className="h-4 w-4" />
            Language
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('companySettings')}</CardTitle>
              <CardDescription>
                Enter your company details. This information will appear on all invoices and quotations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('companyName')} (English) *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    placeholder="Enter your company name"
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
                    placeholder="اپنی کمپنی کا نام درج کریں"
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
                    placeholder="Enter your NTN number (e.g., 1234567-8)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="strnNumber">{t('strnNumber')}</Label>
                  <Input
                    id="strnNumber"
                    name="strnNumber"
                    value={formData.strnNumber || ''}
                    onChange={handleChange}
                    placeholder="Enter your STRN number"
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
                  placeholder="Enter your business address"
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
                    placeholder="Enter city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('phone')}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    placeholder="Enter phone number"
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
                    placeholder="Enter business email"
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
                <p className="text-sm text-muted-foreground mb-4">
                  Bank details will be displayed on invoices for easy payment reference.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">{t('bankName')}</Label>
                    <Input
                      id="bankName"
                      name="bankName"
                      value={formData.bankName || ''}
                      onChange={handleChange}
                      placeholder="Enter your bank name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankAccountNumber">{t('accountNumber')}</Label>
                    <Input
                      id="bankAccountNumber"
                      name="bankAccountNumber"
                      value={formData.bankAccountNumber || ''}
                      onChange={handleChange}
                      placeholder="Enter account number"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bankIban">{t('iban')}</Label>
                    <Input
                      id="bankIban"
                      name="bankIban"
                      value={formData.bankIban || ''}
                      onChange={handleChange}
                      placeholder="Enter IBAN (e.g., PK36HABB0000001234567890)"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  {hasCompany ? t('save') : 'Create Company'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security & Legal</CardTitle>
              <CardDescription>
                Review how your data is protected and find support if you need help.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="justify-start h-auto py-3 flex-col items-start gap-1"
                  asChild
                >
                  <a href="/privacy">
                    <span className="font-medium text-foreground">Privacy Policy</span>
                    <span className="text-xs text-muted-foreground">
                      Learn how AUREX stores and protects your business data.
                    </span>
                  </a>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start h-auto py-3 flex-col items-start gap-1"
                  asChild
                >
                  <a href="/terms">
                    <span className="font-medium text-foreground">Terms &amp; Conditions</span>
                    <span className="text-xs text-muted-foreground">
                      Read the conditions for using the AUREX platform.
                    </span>
                  </a>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start h-auto py-3 flex-col items-start gap-1"
                  asChild
                >
                  <a href="/support">
                    <span className="font-medium text-foreground">Support</span>
                    <span className="text-xs text-muted-foreground">
                      Get help from our support team at hello@aurex.sbs.
                    </span>
                  </a>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start h-auto py-3 flex-col items-start gap-1"
                  asChild
                >
                  <a href="/contact">
                    <span className="font-medium text-foreground">Contact</span>
                    <span className="text-xs text-muted-foreground">
                      Reach out for general questions, feedback, or partnerships.
                    </span>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          {/* Invoice Defaults */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice & Quotation Defaults</CardTitle>
              <CardDescription>
                Configure default settings for new invoices and quotations. You can override these values when creating individual documents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
                    <Input
                      id="defaultTaxRate"
                      name="defaultTaxRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.defaultTaxRate ?? 17}
                      onChange={handleChange}
                      placeholder="17"
                    />
                    <p className="text-sm text-muted-foreground">
                      Standard GST rate in Pakistan is 17%. This will be applied to new line items.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentTermsDays">Payment Terms (Days)</Label>
                    <Input
                      id="paymentTermsDays"
                      name="paymentTermsDays"
                      type="number"
                      min="0"
                      max="365"
                      value={formData.paymentTermsDays ?? 30}
                      onChange={handleChange}
                      placeholder="30"
                    />
                    <p className="text-sm text-muted-foreground">
                      Number of days until invoice is due. Due date will be calculated automatically.
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="font-medium mb-3">Preview</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-background rounded border">
                    <p className="text-muted-foreground">Default Tax Rate</p>
                    <p className="text-2xl font-bold">{formData.defaultTaxRate ?? 17}%</p>
                  </div>
                  <div className="p-3 bg-background rounded border">
                    <p className="text-muted-foreground">Payment Due In</p>
                    <p className="text-2xl font-bold">{formData.paymentTermsDays ?? 30} days</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSavePreferences} disabled={savingPrefs || !hasCompany}>
                  {savingPrefs && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
              
              {!hasCompany && (
                <p className="text-sm text-muted-foreground text-center">
                  Please save your company details first before updating preferences.
                </p>
              )}
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
        </TabsContent>

        <TabsContent value="language" className="space-y-6">
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
                  {language === 'en' && <CheckCircle2 className="h-4 w-4 ml-2" />}
                </Button>
                <Button
                  variant={language === 'ur' ? 'default' : 'outline'}
                  onClick={() => setLanguage('ur')}
                  className="flex-1"
                  dir="rtl"
                >
                  <Globe className="h-4 w-4 ml-2" />
                  اردو
                  {language === 'ur' && <CheckCircle2 className="h-4 w-4 mr-2" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {language === 'ur' 
                  ? 'اردو میں انوائس اور رپورٹس دکھائی جائیں گی۔ دائیں سے بائیں لے آؤٹ استعمال ہوگا۔'
                  : 'Invoices and reports will be displayed in English. Left-to-right layout will be used.'}
              </p>
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