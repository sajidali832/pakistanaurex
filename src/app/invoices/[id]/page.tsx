"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { I18nProvider, useI18n, formatCurrency, formatDate } from '@/lib/i18n';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, Edit, Printer, Download, MoreHorizontal, CheckCircle, XCircle, Palette, FileText } from 'lucide-react';
import { invoiceTemplates, ClassicTemplate, ModernTemplate, BoldTemplate } from '@/components/InvoiceTemplates';

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientId: number;
  companyId: number;
  issueDate: string;
  dueDate: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  amountPaid: number;
  currency: string;
  notes: string;
  terms: string;
}

interface InvoiceLine {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
}

interface Client {
  id: number;
  name: string;
  nameUrdu: string | null;
  email: string;
  phone: string;
  address: string;
  city: string;
  ntnNumber: string;
}

interface Company {
  id: number;
  name: string;
  nameUrdu: string | null;
  email: string;
  phone: string;
  address: string;
  city: string;
  ntnNumber: string;
  strnNumber: string;
  bankName: string;
  bankAccountNumber: string;
  bankIban: string;
}

function InvoiceDetailContent({ id }: { id: string }) {
  const { t, language } = useI18n();
  const router = useRouter();
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');

  useEffect(() => {
    fetchData();
    // Load saved template preference
    const savedTemplate = localStorage.getItem('invoice_template');
    if (savedTemplate) setSelectedTemplate(savedTemplate);
  }, [id]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const [invoiceRes, linesRes, companiesRes] = await Promise.all([
        fetch(`/api/invoices?id=${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`/api/invoice-lines?invoiceId=${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/companies', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      const safeParse = async (res: Response) => {
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch {
          console.error('Non-JSON response:', text);
          return null;
        }
      };

      const invoiceData = invoiceRes.ok ? await safeParse(invoiceRes) : null;
      const linesData = linesRes.ok ? await safeParse(linesRes) : [];
      const companiesData = companiesRes.ok ? await safeParse(companiesRes) : [];

      setInvoice(invoiceData);
      setLines(Array.isArray(linesData) ? linesData : []);
      setCompany(Array.isArray(companiesData) ? companiesData[0] : null);

      if (invoiceData?.clientId) {
        const clientRes = await fetch(`/api/clients?id=${invoiceData.clientId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (clientRes.ok) {
          const clientData = await safeParse(clientRes);
          setClient(clientData);
        }
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      const token = localStorage.getItem('bearer_token');
      await fetch(`/api/invoices?id=${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      setInvoice(prev => prev ? { ...prev, status } : null);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    localStorage.setItem('invoice_template', template);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      draft: { variant: 'secondary', label: t('draft') },
      sent: { variant: 'outline', label: t('sent') },
      paid: { variant: 'default', label: t('paid') },
      overdue: { variant: 'destructive', label: t('overdue') },
      cancelled: { variant: 'secondary', label: t('cancelled') },
    };
    const config = statusConfig[status] || { variant: 'secondary' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const renderTemplate = () => {
    if (!invoice || !client || !company) return null;

    const props = { invoice, lines, client, company, language };

    switch (selectedTemplate) {
      case 'modern':
        return <ModernTemplate {...props} />;
      case 'bold':
        return <BoldTemplate {...props} />;
      default:
        return <ClassicTemplate {...props} />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Invoice not found</p>
        <Button className="mt-4" onClick={() => router.push('/invoices')}>
          {t('invoices')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <Button variant="ghost" onClick={() => router.push('/invoices')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('invoices')}
        </Button>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Template Selector */}
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {invoiceTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Link href={`/invoices/${id}/export`}>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t('download')}
            </Button>
          </Link>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            {t('print')}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => updateStatus('paid')}>
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Mark as Paid
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus('sent')}>
                <FileText className="h-4 w-4 mr-2" />
                Mark as Sent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus('cancelled')}>
                <XCircle className="h-4 w-4 mr-2 text-destructive" />
                Cancel Invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2 print:hidden">
        <span className="text-sm text-muted-foreground">Status:</span>
        {getStatusBadge(invoice.status)}
      </div>

      {/* Invoice Document with Selected Template */}
      <Card className="print:shadow-none print:border-none overflow-hidden">
        <CardContent className="p-0 print:p-0">
          {renderTemplate()}
        </CardContent>
      </Card>
    </div>
  );
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  return (
    <I18nProvider>
      <AppLayout>
        <InvoiceDetailContent id={resolvedParams.id} />
      </AppLayout>
    </I18nProvider>
  );
}