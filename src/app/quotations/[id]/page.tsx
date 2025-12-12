"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { I18nProvider, useI18n, formatCurrency, formatDate } from '@/lib/i18n';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
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
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, Edit, Printer, MoreHorizontal, CheckCircle, XCircle, FileText, Loader2, Download } from 'lucide-react';

interface Quotation {
  id: number;
  quotationNumber: string;
  clientId: number;
  companyId: number;
  issueDate: string;
  validUntil: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  notes: string;
  terms: string;
  convertedInvoiceId: number | null;
}

interface QuotationLine {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
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
}

import { generateQuotationDoc } from '@/lib/generateQuotationDoc';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

function QuotationDetailContent({ id }: { id: string }) {
  const { t, language } = useI18n();
  const router = useRouter();

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [lines, setLines] = useState<QuotationLine[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

      const [quotationRes, linesRes, companiesRes] = await Promise.all([
        fetch(`/api/quotations?id=${id}`, { headers }),
        fetch(`/api/quotation-lines?quotationId=${id}`, { headers }),
        fetch('/api/companies', { headers }),
      ]);

      const quotationData = await quotationRes.json();
      const linesData = await linesRes.json();
      const companiesData = await companiesRes.json();

      setQuotation(quotationData);
      setLines(Array.isArray(linesData) ? linesData : []);
      setCompany(Array.isArray(companiesData) ? companiesData[0] : null);

      if (quotationData?.clientId) {
        const clientRes = await fetch(`/api/clients?id=${quotationData.clientId}`, { headers });
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
      const token = localStorage.getItem('bearer_token');
      await fetch(`/api/quotations?id=${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      setQuotation(prev => prev ? { ...prev, status } : null);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleConvertToInvoice = async () => {
    if (!quotation) return;
    setConverting(true);

    try {
      const token = localStorage.getItem('bearer_token');
      const headers: HeadersInit = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      };
      
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const invoiceNumber = `INV-${year}-${random}`;

      const invoiceRes = await fetch('/api/invoices', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          companyId: quotation.companyId,
          clientId: quotation.clientId,
          invoiceNumber,
          issueDate: new Date().toISOString().split('T')[0],
          status: 'draft',
          subtotal: quotation.subtotal,
          taxAmount: quotation.taxAmount,
          discountAmount: quotation.discountAmount,
          total: quotation.total,
          currency: 'PKR',
          notes: quotation.notes,
          terms: quotation.terms,
        }),
      });

      const invoice = await invoiceRes.json();

      for (const line of lines) {
        await fetch('/api/invoice-lines', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            invoiceId: invoice.id,
            itemId: null,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxRate: (line as any).taxRate || 0,
            taxAmount: (line as any).taxAmount || 0,
            lineTotal: line.lineTotal,
            sortOrder: 0,
          }),
        });
      }

      await fetch(`/api/quotations?id=${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: 'converted', convertedInvoiceId: invoice.id }),
      });

      router.push(`/invoices/${invoice.id}`);
    } catch (error) {
      console.error('Convert failed:', error);
    } finally {
      setConverting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!quotation || !client) return;

    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(company?.name || 'Company', 20, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(company?.address || '', 20, 32);
    doc.text(`${company?.city || ''} | ${company?.phone || ''}`, 20, 38);
    if (company?.ntnNumber) {
      doc.text(`NTN: ${company.ntnNumber}`, 20, 44);
    }

    // QUOTATION title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text('QUOTATION', 145, 25);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(quotation.quotationNumber, 145, 33);
    doc.text(`Status: ${quotation.status.toUpperCase()}`, 145, 40);

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 50, 190, 50);

    // Client info
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('PREPARED FOR', 20, 60);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(client.name, 20, 67);
    doc.setFontSize(10);
    doc.text(client.address || '', 20, 73);
    doc.text(client.city || '', 20, 79);
    doc.text(client.phone || '', 20, 85);

    // Dates
    doc.setFontSize(10);
    doc.text(`Issue Date: ${quotation.issueDate}`, 140, 67);
    if (quotation.validUntil) {
      doc.text(`Valid Until: ${quotation.validUntil}`, 140, 74);
    }

    // Table data
    const tableData = lines.map((line, index) => [
      (index + 1).toString(),
      line.description,
      line.quantity.toString(),
      `PKR ${line.unitPrice.toLocaleString()}`,
      `PKR ${line.lineTotal.toLocaleString()}`
    ]);

    // @ts-ignore - jspdf-autotable extends jsPDF
    doc.autoTable({
      startY: 95,
      head: [['#', 'Description', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [0, 102, 204],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 20, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' }
      }
    });

    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY + 10;

    // Totals
    doc.setFontSize(10);
    doc.text('Subtotal:', 130, finalY);
    doc.text(`PKR ${quotation.subtotal.toLocaleString()}`, 160, finalY, { align: 'right' });

    if (quotation.discountAmount > 0) {
      doc.text('Discount:', 130, finalY + 7);
      doc.text(`-PKR ${quotation.discountAmount.toLocaleString()}`, 160, finalY + 7, { align: 'right' });
    }

    const lineOffset = quotation.discountAmount > 0 ? 11 : 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(130, finalY + lineOffset, 190, finalY + lineOffset);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Grand Total:', 130, finalY + lineOffset + 8);
    doc.text(`PKR ${quotation.total.toLocaleString()}`, 160, finalY + lineOffset + 8, { align: 'right' });

    // Terms
    if (quotation.terms) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Terms & Conditions', 20, finalY + 45);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const splitTerms = doc.splitTextToSize(quotation.terms, 170);
      doc.text(splitTerms, 20, finalY + 52);
    }

    // Save
    doc.save(`${quotation.quotationNumber}.pdf`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      draft: { variant: 'secondary', label: t('draft') },
      sent: { variant: 'outline', label: t('sent') },
      accepted: { variant: 'default', label: t('accepted') },
      rejected: { variant: 'destructive', label: t('rejected') },
      converted: { variant: 'default', label: t('converted') },
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

  if (!quotation) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Quotation not found</p>
        <Button className="mt-4" onClick={() => router.push('/quotations')}>
          {t('quotations')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Actions Bar */}
      <div className="flex justify-between items-center print:hidden">
        <Button variant="ghost" onClick={() => router.push('/quotations')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('quotations')}
        </Button>
        <div className="flex gap-2">
          {quotation.status !== 'converted' && (
            <Button onClick={handleConvertToInvoice} disabled={converting}>
              {converting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              {t('convertToInvoice')}
            </Button>
          )}
          <Link href={`/quotations/${id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              {t('edit')}
            </Button>
          </Link>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => updateStatus('accepted')}>
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Mark as Accepted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus('sent')}>
                Mark as Sent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus('rejected')}>
                <XCircle className="h-4 w-4 mr-2 text-destructive" />
                Mark as Rejected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quotation Document */}
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
              {company?.ntnNumber && <p className="text-sm">NTN: {company.ntnNumber}</p>}
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-primary mb-2">QUOTATION</h2>
              <p className="font-medium">{quotation.quotationNumber}</p>
              {getStatusBadge(quotation.status)}
            </div>
          </div>

          <Separator className="mb-8" />

          {/* Client & Dates */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">PREPARED FOR</h3>
              <p className="font-medium">
                {language === 'ur' && client?.nameUrdu ? client.nameUrdu : client?.name}
              </p>
              <p className="text-muted-foreground">{client?.address}</p>
              <p className="text-muted-foreground">{client?.city}</p>
              <p className="text-muted-foreground">{client?.phone}</p>
            </div>
            <div className="text-right space-y-1">
              <div>
                <span className="text-muted-foreground">{t('issueDate')}: </span>
                <span className="font-medium">{formatDate(quotation.issueDate, language)}</span>
              </div>
              {quotation.validUntil && (
                <div>
                  <span className="text-muted-foreground">{t('validUntil')}: </span>
                  <span className="font-medium">{formatDate(quotation.validUntil, language)}</span>
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
                <span>{formatCurrency(quotation.subtotal, language)}</span>
              </div>
              {quotation.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('discount')}</span>
                  <span>-{formatCurrency(quotation.discountAmount, language)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>{t('grandTotal')}</span>
                <span>{formatCurrency(quotation.total, language)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          {(quotation.notes || quotation.terms) && (
            <div className="grid grid-cols-2 gap-8 text-sm">
              {quotation.notes && (
                <div>
                  <h3 className="font-semibold mb-1">{t('notes')}</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{quotation.notes}</p>
                </div>
              )}
              {quotation.terms && (
                <div>
                  <h3 className="font-semibold mb-1">{t('terms')}</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{quotation.terms}</p>
                </div>
              )}
            </div>
          )}

          {quotation.convertedInvoiceId && (
            <div className="mt-8 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-green-700 dark:text-green-300">
                This quotation has been converted to{' '}
                <Link href={`/invoices/${quotation.convertedInvoiceId}`} className="underline font-medium">
                  Invoice
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <I18nProvider>
      <AppLayout>
        <QuotationDetailContent id={resolvedParams.id} />
      </AppLayout>
    </I18nProvider>
  );
}