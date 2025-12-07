"use client";

import React, { useState, useEffect } from 'react';
import { I18nProvider, useI18n, formatCurrency, formatDate } from '@/lib/i18n';
import { useCompany } from '@/hooks/useCompany';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  TableFooter,
} from '@/components/ui/table';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  FileSpreadsheet,
  Users,
  Receipt,
} from 'lucide-react';

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientId: number;
  total: number;
  taxAmount: number;
  status: string;
  issueDate: string;
}

interface Client {
  id: number;
  name: string;
  balance: number;
}

interface ReportData {
  totalRevenue: number;
  totalTax: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  invoicesByMonth: { month: string; total: number; count: number }[];
  topClients: { clientId: number; name: string; total: number }[];
}

function ReportsContent() {
  const { t, language } = useI18n();
  const { companyId, isLoading: companyLoading } = useCompany();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    // Set default date range to current year
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    setDateFrom(startOfYear.toISOString().split('T')[0]);
    setDateTo(now.toISOString().split('T')[0]);
    
    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  useEffect(() => {
    if (invoices.length > 0 && clients.length > 0) {
      generateReport();
    }
  }, [invoices, clients, dateFrom, dateTo]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [invoicesRes, clientsRes] = await Promise.all([
        fetch('/api/invoices?limit=500', { headers }),
        fetch('/api/clients', { headers }),
      ]);
      const invoicesData = await invoicesRes.json();
      const clientsData = await clientsRes.json();
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      setClients(Array.isArray(clientsData) ? clientsData : []);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    // Filter invoices by date range
    const filteredInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.issueDate);
      const from = dateFrom ? new Date(dateFrom) : new Date(0);
      const to = dateTo ? new Date(dateTo) : new Date();
      return invDate >= from && invDate <= to;
    });

    // Calculate totals
    const paidInvoices = filteredInvoices.filter(i => i.status === 'paid');
    const unpaidInvoices = filteredInvoices.filter(i => i.status === 'sent' || i.status === 'draft');
    const overdueInvoices = filteredInvoices.filter(i => i.status === 'overdue');

    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalTax = paidInvoices.reduce((sum, inv) => sum + inv.taxAmount, 0);

    // Group by month
    const monthlyData: Record<string, { total: number; count: number }> = {};
    filteredInvoices.forEach(inv => {
      const month = inv.issueDate.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, count: 0 };
      }
      monthlyData[month].total += inv.total;
      monthlyData[month].count += 1;
    });

    const invoicesByMonth = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Top clients
    const clientTotals: Record<number, number> = {};
    filteredInvoices.forEach(inv => {
      clientTotals[inv.clientId] = (clientTotals[inv.clientId] || 0) + inv.total;
    });

    const topClients = Object.entries(clientTotals)
      .map(([clientId, total]) => ({
        clientId: parseInt(clientId),
        name: clients.find(c => c.id === parseInt(clientId))?.name || 'Unknown',
        total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    setReportData({
      totalRevenue,
      totalTax,
      paidInvoices: paidInvoices.length,
      unpaidInvoices: unpaidInvoices.length,
      overdueInvoices: overdueInvoices.length,
      invoicesByMonth,
      topClients,
    });
  };

  const exportReport = (type: string) => {
    if (!reportData) return;

    let csv = '';
    
    if (type === 'sales') {
      csv = 'Month,Invoice Count,Total Revenue\n';
      reportData.invoicesByMonth.forEach(row => {
        csv += `${row.month},${row.count},${row.total.toFixed(2)}\n`;
      });
    } else if (type === 'clients') {
      csv = 'Client Name,Total Revenue\n';
      reportData.topClients.forEach(row => {
        csv += `"${row.name}",${row.total.toFixed(2)}\n`;
      });
    } else if (type === 'tax') {
      csv = 'Report Type,Value\n';
      csv += `Total Revenue,${reportData.totalRevenue.toFixed(2)}\n`;
      csv += `Total Tax Collected,${reportData.totalTax.toFixed(2)}\n`;
      csv += `Paid Invoices,${reportData.paidInvoices}\n`;
      csv += `Unpaid Invoices,${reportData.unpaidInvoices}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading || companyLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dateRange')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>{t('from')}</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('to')}</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
              />
            </div>
            <Button onClick={generateReport}>
              {t('generateReport')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {reportData && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('totalRevenue')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(reportData.totalRevenue, language)}
                </div>
                <p className="text-xs text-muted-foreground">
                  From {reportData.paidInvoices} paid invoices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('tax')} Collected</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(reportData.totalTax, language)}
                </div>
                <p className="text-xs text-muted-foreground">
                  GST/Sales Tax
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('unpaidInvoices')}</CardTitle>
                <FileSpreadsheet className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {reportData.unpaidInvoices}
                </div>
                <p className="text-xs text-muted-foreground">
                  {reportData.overdueInvoices} overdue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('totalClients')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData.topClients.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active in period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Reports */}
          <Tabs defaultValue="sales">
            <TabsList>
              <TabsTrigger value="sales">{t('salesReport')}</TabsTrigger>
              <TabsTrigger value="clients">{t('clientReport')}</TabsTrigger>
              <TabsTrigger value="tax">{t('taxReport')}</TabsTrigger>
            </TabsList>

            <TabsContent value="sales">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t('salesReport')}</CardTitle>
                    <CardDescription>Monthly sales breakdown</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportReport('sales')}>
                    <Download className="h-4 w-4 mr-2" />
                    {t('exportCSV')}
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Invoices</TableHead>
                        <TableHead className="text-right">{t('total')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.invoicesByMonth.map((row) => (
                        <TableRow key={row.month}>
                          <TableCell className="font-medium">{row.month}</TableCell>
                          <TableCell className="text-right">{row.count}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(row.total, language)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell className="font-bold">{t('total')}</TableCell>
                        <TableCell className="text-right font-bold">
                          {reportData.invoicesByMonth.reduce((sum, r) => sum + r.count, 0)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(
                            reportData.invoicesByMonth.reduce((sum, r) => sum + r.total, 0),
                            language
                          )}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clients">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t('clientReport')}</CardTitle>
                    <CardDescription>Top clients by revenue</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportReport('clients')}>
                    <Download className="h-4 w-4 mr-2" />
                    {t('exportCSV')}
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>{t('clientName')}</TableHead>
                        <TableHead className="text-right">{t('totalRevenue')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.topClients.map((client, index) => (
                        <TableRow key={client.clientId}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(client.total, language)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tax">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t('taxReport')}</CardTitle>
                    <CardDescription>Tax collection summary for FBR reporting</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportReport('tax')}>
                    <Download className="h-4 w-4 mr-2" />
                    {t('exportCSV')}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Gross Revenue</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(reportData.totalRevenue, language)}
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Tax Collected (GST 17%)</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(reportData.totalTax, language)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">FBR Tax Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Period:</span>
                          <span>{dateFrom} to {dateTo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Taxable Supply:</span>
                          <span>{formatCurrency(reportData.totalRevenue - reportData.totalTax, language)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Output Tax (17%):</span>
                          <span>{formatCurrency(reportData.totalTax, language)}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2">
                          <span>Net Tax Payable:</span>
                          <span>{formatCurrency(reportData.totalTax, language)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <I18nProvider>
      <AppLayout>
        <ReportsContent />
      </AppLayout>
    </I18nProvider>
  );
}