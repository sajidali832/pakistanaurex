"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { I18nProvider, useI18n } from '@/lib/i18n';
import { useCompany } from '@/hooks/useCompany';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Save, Loader2, Building2 } from 'lucide-react';

function NewClientContent() {
  const { t } = useI18n();
  const router = useRouter();
  const { companyId, isLoading: companyLoading } = useCompany();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    nameUrdu: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    ntnNumber: '',
    contactPerson: '',
    salesTaxRegistration: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountTitle: '',
    bankIban: '',
    bankBranchCode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !companyId) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyId,
          ...formData,
        }),
      });

      if (!res.ok) throw new Error('Failed to create client');

      router.push('/clients');
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  if (companyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('addClient')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('clientName')} *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nameUrdu">{t('clientNameUrdu')}</Label>
                <Input
                  id="nameUrdu"
                  name="nameUrdu"
                  value={formData.nameUrdu}
                  onChange={handleChange}
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('phone')}</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+92-XXX-XXXXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">{t('contactPerson')}</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ntnNumber">{t('ntn')}</Label>
                <Input
                  id="ntnNumber"
                  name="ntnNumber"
                  value={formData.ntnNumber}
                  onChange={handleChange}
                  placeholder="1234567-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t('address')}</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">{t('city')}</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salesTaxRegistration">Sales Tax Registration #</Label>
              <Input
                id="salesTaxRegistration"
                name="salesTaxRegistration"
                value={formData.salesTaxRegistration}
                onChange={handleChange}
                placeholder="35XXXXX-XXXXXX"
              />
            </div>

            {/* Bank Details Section */}
            <Separator className="my-4" />
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Bank Details (For Banking Work)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="e.g., HBL, MCB, UBL"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccountTitle">Account Title</Label>
                <Input
                  id="bankAccountTitle"
                  name="bankAccountTitle"
                  value={formData.bankAccountTitle}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">Account Number</Label>
                <Input
                  id="bankAccountNumber"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankBranchCode">Branch Code</Label>
                <Input
                  id="bankBranchCode"
                  name="bankBranchCode"
                  value={formData.bankBranchCode}
                  onChange={handleChange}
                  placeholder="0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankIban">IBAN</Label>
              <Input
                id="bankIban"
                name="bankIban"
                value={formData.bankIban}
                onChange={handleChange}
                placeholder="PK00XXXX0000000000000000"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={saving || !formData.name}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                {t('save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewClientPage() {
  return (
    <I18nProvider>
      <AppLayout>
        <NewClientContent />
      </AppLayout>
    </I18nProvider>
  );
}