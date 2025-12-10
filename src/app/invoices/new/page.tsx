"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { I18nProvider, useI18n, formatCurrency } from '@/lib/i18n';
import { useCompany } from '@/hooks/useCompany';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Client {
  id: number;
  name: string;
  nameUrdu: string | null;
}

interface CompanyFull {
  id: number;
  name: string;
  address: string;
  city: string;
  ntnNumber: string;
  defaultTaxRate: number;
  paymentTermsDays: number;
}

interface Company {
  id: number;
  defaultTaxRate: number;
  paymentTermsDays: number;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
}

function NewInvoiceContent() {
  const { t, language } = useI18n();
  const router = useRouter();
  const { companyId, isLoading: companyLoading } = useCompany();

  const [clients, setClients] = useState<Client[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanyFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [clientId, setClientId] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  useEffect(() => {
    if (companyId) {
      fetchData();
    }
    generateInvoiceNumber();
  }, [companyId]);

  const fetchData = async () => {
    try {
      const [clientsRes, companyRes] = await Promise.all([
        fetch('/api/clients?limit=100'),
        fetch('/api/user-company'),
      ]);

      if (!clientsRes.ok) {
        const text = await clientsRes.text();
        console.error('Failed to fetch clients for invoices:', clientsRes.status, text);
        setClients([]);
      } else {
        const clientsData = await clientsRes.json();
        setClients(Array.isArray(clientsData) ? clientsData : []);
      }

      if (!companyRes.ok) {
        const text = await companyRes.text();
        console.error('Failed to fetch company for invoices:', companyRes.status, text);
        setCompanySettings(null);
      } else {
        const company = await companyRes.json();
        setCompanySettings(company);

        // Set default tax rate and payment terms from company settings
        const defaultTaxRate = company.defaultTaxRate ?? 17;
        const paymentTermsDays = company.paymentTermsDays ?? 30;

        // Set default due date based on payment terms
        const dueDateObj = new Date();
        dueDateObj.setDate(dueDateObj.getDate() + paymentTermsDays);
        setDueDate(dueDateObj.toISOString().split('T')[0]);

        // Set default terms
        setTerms(`Payment due within ${paymentTermsDays} days`);

        // Check if company settings are complete
        if (!company.name || !company.address || !company.ntnNumber) {
          toast.error('Please complete your company settings before creating invoices');
          router.push('/settings');
          return;
        }

        // Initialize line items with company's default tax rate
        setLineItems([
          { id: '1', description: '', quantity: 1, unitPrice: 0, taxRate: defaultTaxRate, taxAmount: 0, lineTotal: 0 }
        ]);
      } else {
        // Fallback defaults
        const dueDateObj = new Date();
        dueDateObj.setDate(dueDateObj.getDate() + 30);

        setDueDate(dueDateObj.toISOString().split('T')[0]);
        setTerms('Payment due within 30 days');
        setLineItems([
          { id: '1', description: '', quantity: 1, unitPrice: 0, taxRate: 17, taxAmount: 0, lineTotal: 0 }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setInvoiceNumber(`INV-${year}-${random}`);
  };

  const calculateLineItem = (item: LineItem): LineItem => {
    const subtotal = item.quantity * item.unitPrice;
    const taxAmount = subtotal * (item.taxRate / 100);
    const lineTotal = subtotal + taxAmount;
    return { ...item, taxAmount, lineTotal };
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(prevItems =>
      prevItems.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        return calculateLineItem(updated);
      })
    );
  };

  const addLineItem = () => {
    const defaultTaxRate = companySettings?.defaultTaxRate ?? 17;
    setLineItems([
      ...lineItems,
      { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, taxRate: defaultTaxRate, taxAmount: 0, lineTotal: 0 }
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };



  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
  const total = subtotal + taxAmount - discountAmount;

  const handleSave = async (status: string = 'draft') => {
    if (!clientId || !invoiceNumber || !companyId) {
      toast.error('Please select a client and enter invoice number');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('bearer_token');
      // Create invoice
      const invoiceRes = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyId,
          clientId: parseInt(clientId),
          invoiceNumber,
          issueDate,
          dueDate: dueDate || null,
          status,
          subtotal,
          taxAmount,
          discountAmount,
          total,
          currency: 'PKR',
          notes,
          terms,
        }),
      });

      if (!invoiceRes.ok) throw new Error('Failed to create invoice');

      const invoice = await invoiceRes.json();

      // Create invoice lines
      for (let i = 0; i < lineItems.length; i++) {
        const line = lineItems[i];
        await fetch('/api/invoice-lines', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            invoiceId: invoice.id,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxRate: line.taxRate,
            taxAmount: line.taxAmount,
            lineTotal: line.lineTotal,
            sortOrder: i,
          }),
        });
      }

      toast.success('Invoice created successfully');
      router.push('/invoices');
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  if (loading || companyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('createInvoice')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>{t('invoiceNumber')}</Label>
              <Input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{t('client')}</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectClient')} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {language === 'ur' && client.nameUrdu ? client.nameUrdu : client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('issueDate')}</Label>
              <Input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{t('dueDate')}</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <Label>{t('items')}</Label>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('description')}</TableHead>
                    <TableHead className="w-24">{t('quantity')}</TableHead>
                    <TableHead className="w-32">{t('unitPrice')}</TableHead>
                    <TableHead className="w-24">{t('tax')} %</TableHead>
                    <TableHead className="w-32">{t('total')}</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>
                        <Input
                          value={line.description}
                          onChange={(e) => updateLineItem(line.id, 'description', e.target.value)}
                          placeholder={t('description')}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(e) => updateLineItem(line.id, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={line.unitPrice}
                          onChange={(e) => updateLineItem(line.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={line.taxRate}
                          onChange={(e) => updateLineItem(line.id, 'taxRate', parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(line.lineTotal, language)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLineItem(line.id)}
                          disabled={lineItems.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Button variant="ghost" size="sm" onClick={addLineItem}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('addItem')}
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('subtotal')}</span>
                <span>{formatCurrency(subtotal, language)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('tax')}</span>
                <span>{formatCurrency(taxAmount, language)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t('discount')}</span>
                <Input
                  type="number"
                  min="0"
                  className="w-32"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>{t('grandTotal')}</span>
                <span>{formatCurrency(total, language)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('notes')}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Additional notes..."
              />
            </div>
            <div className="space-y-2">
              <Label>{t('terms')}</Label>
              <Textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={3}
                placeholder="Terms and conditions..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              {t('cancel')}
            </Button>
            <Button variant="secondary" onClick={() => handleSave('draft')} disabled={saving || !clientId}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('saveDraft')}
            </Button>
            <Button onClick={() => handleSave('sent')} disabled={saving || !clientId}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {t('save')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <I18nProvider>
      <AppLayout>
        <NewInvoiceContent />
      </AppLayout>
    </I18nProvider>
  );
}