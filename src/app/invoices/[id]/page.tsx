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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, Edit, Printer, Download, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';

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

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [invoiceRes, linesRes, companiesRes] = await Promise.all([
        fetch(`/api/invoices?id=${id}`),
        fetch(`/api/invoice-lines?invoiceId=${id}`),
        fetch('/api/companies'),
      ]);

      const invoiceData = await invoiceRes.json();
      const linesData = await linesRes.json();
      const companiesData = await companiesRes.json();

      setInvoice(invoiceData);
      setLines(Array.isArray(linesData) ? linesData : []);
      setCompany(Array.isArray(companiesData) ? companiesData[0] : null);

      if (invoiceData?.clientId) {
        const clientRes = await fetch(`/api/clients?id=${invoiceData.clientId}`);
        const clientData = await clientRes.json();
        setClient(clientData);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      await fetch(`/api/invoices?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Actions Bar */}
      <div className="flex justify-between items-center print:hidden">
        <Button variant="ghost" onClick={() => router.push('/invoices')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('invoices')}
        </Button>
        <div className="flex gap-2">
          <Link href={`/invoices/${id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              {t('edit')}
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

      {/* Invoice Document */}
      <Card className="print:shadow-none print:border-none">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                {language === 'ur' && company?.nameUrdu ? company.nameUrdu : company?.name}
              </h1>
              <p className="text-muted-foreground">{company?.address}</p>
              <p className="text-muted-foreground">{company?.city}</p>
              <p className="text-muted-foreground">{company?.phone}</p>
              <p className="text-muted-foreground">{company?.email}</p>
              {company?.ntnNumber && <p className="text-sm">NTN: {company.ntnNumber}</p>}
              {company?.strnNumber && <p className="text-sm">STRN: {company.strnNumber}</p>}
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-primary mb-2">INVOICE</h2>
              <p className="font-medium">{invoice.invoiceNumber}</p>
              {getStatusBadge(invoice.status)}
            </div>
          </div>

          <Separator className="mb-8" />

          {/* Client & Dates */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">BILL TO</h3>
              <p className="font-medium">
                {language === 'ur' && client?.nameUrdu ? client.nameUrdu : client?.name}
              </p>
              <p className="text-muted-foreground">{client?.address}</p>
              <p className="text-muted-foreground">{client?.city}</p>
              <p className="text-muted-foreground">{client?.phone}</p>
              {client?.ntnNumber && <p className="text-sm">NTN: {client.ntnNumber}</p>}
            </div>
            <div className="text-right space-y-1">
              <div>
                <span className="text-muted-foreground">{t('issueDate')}: </span>
                <span className="font-medium">{formatDate(invoice.issueDate, language)}</span>
              </div>
              {invoice.dueDate && (
                <div>
                  <span className="text-muted-foreground">{t('dueDate')}: </span>
                  <span className="font-medium">{formatDate(invoice.dueDate, language)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Line Items */}
          <Table className="mb-8">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>{t('description')}</TableHead>
                <TableHead className="text-right">{t('quantity')}</TableHead>
                <TableHead className="text-right">{t('unitPrice')}</TableHead>
                <TableHead className="text-right">{t('tax')}</TableHead>
                <TableHead className="text-right">{t('total')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line, index) => (
                <TableRow key={line.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{line.description}</TableCell>
                  <TableCell className="text-right">{line.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(line.unitPrice, language)}</TableCell>
                  <TableCell className="text-right">{line.taxRate}%</TableCell>
                  <TableCell className="text-right">{formatCurrency(line.lineTotal, language)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-72 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('subtotal')}</span>
                <span>{formatCurrency(invoice.subtotal, language)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('tax')}</span>
                <span>{formatCurrency(invoice.taxAmount, language)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('discount')}</span>
                  <span>-{formatCurrency(invoice.discountAmount, language)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>{t('grandTotal')}</span>
                <span>{formatCurrency(invoice.total, language)}</span>
              </div>
              {invoice.amountPaid > 0 && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Amount Paid</span>
                    <span>{formatCurrency(invoice.amountPaid, language)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Balance Due</span>
                    <span>{formatCurrency(invoice.total - invoice.amountPaid, language)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bank Details */}
          {company && (
            <div className="bg-muted p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">{t('bankDetails')}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('bankName')}: </span>
                  <span>{company.bankName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('accountNumber')}: </span>
                  <span>{company.bankAccountNumber}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">{t('iban')}: </span>
                  <span>{company.bankIban}</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes & Terms */}
          {(invoice.notes || invoice.terms) && (
            <div className="grid grid-cols-2 gap-8 text-sm">
              {invoice.notes && (
                <div>
                  <h3 className="font-semibold mb-1">{t('notes')}</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <h3 className="font-semibold mb-1">{t('terms')}</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}
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
