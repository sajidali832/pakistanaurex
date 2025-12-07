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
import { Switch } from '@/components/ui/switch';
import { Save, Loader2 } from 'lucide-react';

function NewItemContent() {
  const { t } = useI18n();
  const router = useRouter();
  const { companyId, isLoading: companyLoading } = useCompany();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    nameUrdu: '',
    description: '',
    unitPrice: '',
    unit: 'piece',
    taxRate: '17',
    isService: false,
    sku: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.unitPrice || !companyId) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyId,
          name: formData.name,
          nameUrdu: formData.nameUrdu || null,
          description: formData.description || null,
          unitPrice: parseFloat(formData.unitPrice),
          unit: formData.unit,
          taxRate: parseFloat(formData.taxRate) || 0,
          isService: formData.isService,
          sku: formData.sku || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to create item');
      
      router.push('/items');
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
          <CardTitle>{t('addNewItem')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('itemName')} *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nameUrdu">{t('itemNameUrdu')}</Label>
                <Input
                  id="nameUrdu"
                  name="nameUrdu"
                  value={formData.nameUrdu}
                  onChange={handleChange}
                  dir="rtl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitPrice">{t('unitPrice')} (PKR) *</Label>
                <Input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit">{t('unit')}</Label>
                <Input
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="piece, hour, kg, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taxRate">{t('taxRate')}</Label>
                <Input
                  id="taxRate"
                  name="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.taxRate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">{t('sku')}</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="SKU-001"
                />
              </div>
              
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>{t('service')}</Label>
                  <p className="text-sm text-muted-foreground">
                    Is this a service rather than a product?
                  </p>
                </div>
                <Switch
                  checked={formData.isService}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isService: checked }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={saving || !formData.name || !formData.unitPrice}>
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

export default function NewItemPage() {
  return (
    <I18nProvider>
      <AppLayout>
        <NewItemContent />
      </AppLayout>
    </I18nProvider>
  );
}