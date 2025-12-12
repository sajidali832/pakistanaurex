"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { I18nProvider, useI18n, formatCurrency, formatDate } from '@/lib/i18n';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, FileText, FileSpreadsheet, Printer, Download, Loader2 } from 'lucide-react';

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

function ExportContent({ id }: { id: string }) {
  const { t, language } = useI18n();
  const router = useRouter();
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

      const [invoiceRes, linesRes, companiesRes] = await Promise.all([
        fetch(`/api/invoices?id=${id}`, { headers }),
        fetch(`/api/invoice-lines?invoiceId=${id}`, { headers }),
        fetch('/api/companies', { headers }),
      ]);

      const invoiceData = await invoiceRes.json();
      const linesData = await linesRes.json();
      const companiesData = await companiesRes.json();

      setInvoice(invoiceData);
      setLines(Array.isArray(linesData) ? linesData : []);
      setCompany(Array.isArray(companiesData) ? companiesData[0] : null);

      if (invoiceData?.clientId) {
        const clientRes = await fetch(`/api/clients?id=${invoiceData.clientId}`, { headers });
        const clientData = await clientRes.json();
        setClient(clientData);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!invoice || !client) return;
    setExporting('csv');

    // Create CSV content
    let csv = 'Invoice Export\n\n';
    csv += `Invoice Number,${invoice.invoiceNumber}\n`;
    csv += `Issue Date,${invoice.issueDate}\n`;
    csv += `Due Date,${invoice.dueDate || ''}\n`;
    csv += `Client,${client.name}\n`;
    csv += `Status,${invoice.status}\n\n`;
    
    csv += 'Line Items\n';
    csv += 'Description,Quantity,Unit Price,Tax Rate,Tax Amount,Total\n';
    
    lines.forEach(line => {
      csv += `"${line.description}",${line.quantity},${line.unitPrice},${line.taxRate}%,${line.taxAmount},${line.lineTotal}\n`;
    });
    
    csv += `\nSubtotal,,,,${invoice.subtotal}\n`;
    csv += `Tax,,,,${invoice.taxAmount}\n`;
    if (invoice.discountAmount > 0) {
      csv += `Discount,,,,-${invoice.discountAmount}\n`;
    }
    csv += `Total,,,,${invoice.total}\n`;

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${invoice.invoiceNumber}.csv`;
    link.click();
    
    setTimeout(() => setExporting(null), 500);
  };

  const exportExcel = () => {
    if (!invoice || !client) return;
    setExporting('excel');

    // Create TSV (Tab-separated) that Excel can open
    let tsv = 'Invoice Export\n\n';
    tsv += `Invoice Number\t${invoice.invoiceNumber}\n`;
    tsv += `Issue Date\t${invoice.issueDate}\n`;
    tsv += `Due Date\t${invoice.dueDate || ''}\n`;
    tsv += `Client\t${client.name}\n`;
    tsv += `Status\t${invoice.status}\n\n`;
    
    tsv += 'Line Items\n';
    tsv += 'Description\tQuantity\tUnit Price\tTax Rate\tTax Amount\tTotal\n';
    
    lines.forEach(line => {
      tsv += `${line.description}\t${line.quantity}\t${line.unitPrice}\t${line.taxRate}%\t${line.taxAmount}\t${line.lineTotal}\n`;
    });
    
    tsv += `\nSubtotal\t\t\t\t${invoice.subtotal}\n`;
    tsv += `Tax\t\t\t\t${invoice.taxAmount}\n`;
    if (invoice.discountAmount > 0) {
      tsv += `Discount\t\t\t\t-${invoice.discountAmount}\n`;
    }
    tsv += `Total\t\t\t\t${invoice.total}\n`;

    // Download as .xls (Excel will recognize TSV)
    const blob = new Blob([tsv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${invoice.invoiceNumber}.xls`;
    link.click();
    
    setTimeout(() => setExporting(null), 500);
  };

  const printInvoice = () => {
    router.push(`/invoices/${id}`);
    setTimeout(() => window.print(), 500);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
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
    <div className="space-y-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => router.push(`/invoices/${id}`)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Invoice
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{t('download')} - {invoice.invoiceNumber}</CardTitle>
          <CardDescription>
            Choose your preferred export format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Invoice Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t('client')}</p>
                <p className="font-medium">{client?.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('issueDate')}</p>
                <p className="font-medium">{formatDate(invoice.issueDate, language)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('total')}</p>
                <p className="font-medium text-lg">{formatCurrency(invoice.total, language)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('status')}</p>
                <p className="font-medium capitalize">{invoice.status}</p>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="grid gap-4">
            <Button
              variant="outline"
              className="w-full justify-start h-16"
              onClick={printInvoice}
            >
              <Printer className="h-5 w-5 mr-4" />
              <div className="text-left">
                <p className="font-medium">{t('print')} / PDF</p>
                <p className="text-sm text-muted-foreground">
                  Print or save as PDF using browser print dialog
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-16"
              onClick={exportCSV}
              disabled={exporting === 'csv'}
            >
              {exporting === 'csv' ? (
                <Loader2 className="h-5 w-5 mr-4 animate-spin" />
              ) : (
                <FileText className="h-5 w-5 mr-4" />
              )}
              <div className="text-left">
                <p className="font-medium">{t('exportCSV')}</p>
                <p className="text-sm text-muted-foreground">
                  Download as CSV file for spreadsheet applications
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-16"
              onClick={exportExcel}
              disabled={exporting === 'excel'}
            >
              {exporting === 'excel' ? (
                <Loader2 className="h-5 w-5 mr-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-5 w-5 mr-4" />
              )}
              <div className="text-left">
                <p className="font-medium">{t('exportExcel')}</p>
                <p className="text-sm text-muted-foreground">
                  Download as Excel-compatible file
                </p>
              </div>
            </Button>
          </div>

          {/* Line Items Preview */}
          <div className="pt-4">
            <h4 className="font-medium mb-2">{t('items')} ({lines.length})</h4>
            <div className="text-sm space-y-1">
              {lines.slice(0, 3).map((line, i) => (
                <div key={line.id} className="flex justify-between text-muted-foreground">
                  <span className="truncate max-w-xs">{line.description}</span>
                  <span>{formatCurrency(line.lineTotal, language)}</span>
                </div>
              ))}
              {lines.length > 3 && (
                <p className="text-muted-foreground">
                  +{lines.length - 3} more items...
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ExportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  return (
    <I18nProvider>
      <AppLayout>
        <ExportContent id={resolvedParams.id} />
      </AppLayout>
    </I18nProvider>
  );
}