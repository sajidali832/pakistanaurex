"use client";

import React, { useState, useEffect } from 'react';
import { I18nProvider, useI18n, formatCurrency, formatDate } from '@/lib/i18n';
import { useCompany } from '@/hooks/useCompany';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Upload, Building2, Smartphone, Check, X, Loader2 } from 'lucide-react';

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientId: number;
  total: number;
  amountPaid: number;
  status: string;
  dueDate: string;
}

interface Client {
  id: number;
  name: string;
  phone: string;
}

interface BankTransaction {
  id: number;
  transactionDate: string;
  description: string;
  amount: number;
  type: string;
  reference: string;
  bankName: string;
  matchedPaymentId: number | null;
}

function BankExportContent() {
  const { t, language } = useI18n();
  const { companyId, isLoading: companyLoading } = useCompany();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const [invoicesRes, clientsRes, transactionsRes] = await Promise.all([
        fetch('/api/invoices?status=sent&limit=100', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/clients', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/bank-transactions?limit=50', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);
      
      const invoicesData = await invoicesRes.json();
      const clientsData = await clientsRes.json();
      const transactionsData = await transactionsRes.json();
      
      // Filter unpaid invoices
      const unpaidInvoices = (Array.isArray(invoicesData) ? invoicesData : [])
        .filter((inv: Invoice) => inv.status !== 'paid' && inv.status !== 'cancelled');
      
      setInvoices(unpaidInvoices);
      setClients(Array.isArray(clientsData) ? clientsData : []);
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (clientId: number) => {
    return clients.find(c => c.id === clientId)?.name || 'Unknown';
  };

  const getClientPhone = (clientId: number) => {
    return clients.find(c => c.id === clientId)?.phone || '';
  };

  const toggleInvoiceSelection = (id: number) => {
    setSelectedInvoices(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAllInvoices = () => {
    if (selectedInvoices.length === invoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(invoices.map(i => i.id));
    }
  };

  const generateJazzCashCSV = () => {
    const selectedData = invoices.filter(i => selectedInvoices.includes(i.id));
    
    const headers = ['Mobile Number', 'Amount', 'Reference', 'Description'];
    const rows = selectedData.map(inv => {
      const phone = getClientPhone(inv.clientId).replace(/[^0-9]/g, '');
      const balance = inv.total - inv.amountPaid;
      return [
        phone,
        balance.toFixed(2),
        inv.invoiceNumber,
        `Payment request for ${inv.invoiceNumber}`
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    downloadCSV(csv, 'jazzcash_payments.csv');
  };

  const generateEasyPaisaCSV = () => {
    const selectedData = invoices.filter(i => selectedInvoices.includes(i.id));
    
    const headers = ['MSISDN', 'Amount', 'Transaction ID', 'Remarks'];
    const rows = selectedData.map(inv => {
      const phone = getClientPhone(inv.clientId).replace(/[^0-9]/g, '');
      const balance = inv.total - inv.amountPaid;
      return [
        phone,
        balance.toFixed(2),
        inv.invoiceNumber,
        `Invoice ${inv.invoiceNumber} - ${getClientName(inv.clientId)}`
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    downloadCSV(csv, 'easypaisa_payments.csv');
  };

  const generateBankCSV = () => {
    const selectedData = invoices.filter(i => selectedInvoices.includes(i.id));
    
    const headers = ['Date', 'Invoice Number', 'Client Name', 'Amount Due', 'Due Date', 'Status'];
    const rows = selectedData.map(inv => {
      const balance = inv.total - inv.amountPaid;
      return [
        new Date().toISOString().split('T')[0],
        inv.invoiceNumber,
        getClientName(inv.clientId),
        balance.toFixed(2),
        inv.dueDate || '',
        inv.status
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    downloadCSV(csv, 'bank_receivables.csv');
  };

  const downloadCSV = (content: string, filename: string) => {
    setExporting(true);
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    setTimeout(() => setExporting(false), 500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !companyId) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').slice(1);
      const token = localStorage.getItem('bearer_token');
      
      for (const line of lines) {
        const [date, description, amount, type, reference] = line.split(',');
        if (date && amount) {
          await fetch('/api/bank-transactions', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              companyId,
              transactionDate: date.trim(),
              description: description?.trim() || '',
              amount: Math.abs(parseFloat(amount)),
              type: parseFloat(amount) >= 0 ? 'credit' : 'debit',
              reference: reference?.trim() || '',
              bankName: 'Imported',
            }),
          });
        }
      }
      fetchData();
    };
    reader.readAsText(file);
  };

  if (loading || companyLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="export">
        <TabsList>
          <TabsTrigger value="export">{t('bankExport')}</TabsTrigger>
          <TabsTrigger value="reconciliation">{t('bankReconciliation')}</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          {/* Export Options */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Smartphone className="h-5 w-5 text-green-600" />
                  JazzCash
                </CardTitle>
                <CardDescription>Export for JazzCash bulk payments</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={generateJazzCashCSV}
                  disabled={selectedInvoices.length === 0 || exporting}
                >
                  {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  {t('exportForJazzCash')}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Smartphone className="h-5 w-5 text-green-500" />
                  EasyPaisa
                </CardTitle>
                <CardDescription>Export for EasyPaisa bulk payments</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={generateEasyPaisaCSV}
                  disabled={selectedInvoices.length === 0 || exporting}
                >
                  {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  {t('exportForEasyPaisa')}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Bank CSV
                </CardTitle>
                <CardDescription>Standard bank export format</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={generateBankCSV}
                  disabled={selectedInvoices.length === 0 || exporting}
                >
                  {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  {t('exportCSV')}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Unpaid Invoices Selection */}
          <Card>
            <CardHeader>
              <CardTitle>{t('unpaidInvoices')}</CardTitle>
              <CardDescription>
                Select invoices to include in export ({selectedInvoices.length} selected)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {invoices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No unpaid invoices found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.length === invoices.length}
                          onChange={selectAllInvoices}
                          className="rounded border-gray-300"
                        />
                      </TableHead>
                      <TableHead>{t('invoiceNumber')}</TableHead>
                      <TableHead>{t('client')}</TableHead>
                      <TableHead>{t('phone')}</TableHead>
                      <TableHead>{t('total')}</TableHead>
                      <TableHead>Balance Due</TableHead>
                      <TableHead>{t('dueDate')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedInvoices.includes(invoice.id)}
                            onChange={() => toggleInvoiceSelection(invoice.id)}
                            className="rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{getClientName(invoice.clientId)}</TableCell>
                        <TableCell>{getClientPhone(invoice.clientId) || '-'}</TableCell>
                        <TableCell>{formatCurrency(invoice.total, language)}</TableCell>
                        <TableCell className="font-medium text-destructive">
                          {formatCurrency(invoice.total - invoice.amountPaid, language)}
                        </TableCell>
                        <TableCell>
                          {invoice.dueDate ? formatDate(invoice.dueDate, language) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-6">
          {/* Import Bank Statement */}
          <Card>
            <CardHeader>
              <CardTitle>{t('importBankStatement')}</CardTitle>
              <CardDescription>
                Upload a CSV file with columns: Date, Description, Amount, Type, Reference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="max-w-xs"
                />
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bank Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Imported Transactions</CardTitle>
              <CardDescription>
                {transactions.filter(t => !t.matchedPaymentId).length} unmatched transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No transactions imported yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell>{formatDate(txn.transactionDate, language)}</TableCell>
                        <TableCell>{txn.description}</TableCell>
                        <TableCell className="font-mono text-sm">{txn.reference || '-'}</TableCell>
                        <TableCell className={txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                          {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount, language)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={txn.type === 'credit' ? 'default' : 'secondary'}>
                            {txn.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {txn.matchedPaymentId ? (
                            <Badge variant="outline" className="text-green-600">
                              <Check className="h-3 w-3 mr-1" /> Matched
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-600">
                              <X className="h-3 w-3 mr-1" /> Unmatched
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function BankExportPage() {
  return (
    <I18nProvider>
      <AppLayout>
        <BankExportContent />
      </AppLayout>
    </I18nProvider>
  );
}