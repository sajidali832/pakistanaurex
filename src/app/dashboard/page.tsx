"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { I18nProvider, useI18n, formatCurrency, formatDate } from '@/lib/i18n';
import { useCompany } from '@/hooks/useCompany';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  FileText,
  Users,
  FileSpreadsheet,
  Plus,
  ArrowRight,
} from 'lucide-react';

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientId: number;
  total: number;
  status: string;
  issueDate: string;
  dueDate: string;
}

interface Quotation {
  id: number;
  quotationNumber: string;
  clientId: number;
  total: number;
  status: string;
  issueDate: string;
}

interface Client {
  id: number;
  name: string;
}

interface DashboardStats {
  totalRevenue: number;
  unpaidAmount: number;
  totalClients: number;
  pendingQuotations: number;
}

function DashboardContent() {
  const { t, language } = useI18n();
  const { companyId, isLoading: companyLoading } = useCompany();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [recentQuotations, setRecentQuotations] = useState<Quotation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [companyId]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

      const [invoicesRes, quotationsRes, clientsRes] = await Promise.all([
        fetch(`/api/invoices?limit=5`, { headers }),
        fetch(`/api/quotations?limit=5`, { headers }),
        fetch(`/api/clients`, { headers }),
      ]);

      const invoices = await invoicesRes.json();
      const quotations = await quotationsRes.json();
      const clientsData = await clientsRes.json();

      setRecentInvoices(Array.isArray(invoices) ? invoices : []);
      setRecentQuotations(Array.isArray(quotations) ? quotations : []);
      setClients(Array.isArray(clientsData) ? clientsData : []);

      const allInvoices = Array.isArray(invoices) ? invoices : [];
      const totalRevenue = allInvoices
        .filter((inv: Invoice) => inv.status === 'paid')
        .reduce((sum: number, inv: Invoice) => sum + inv.total, 0);
      
      const unpaidAmount = allInvoices
        .filter((inv: Invoice) => inv.status !== 'paid' && inv.status !== 'cancelled')
        .reduce((sum: number, inv: Invoice) => sum + inv.total, 0);

      const pendingQuotations = (Array.isArray(quotations) ? quotations : [])
        .filter((q: Quotation) => q.status === 'sent' || q.status === 'draft').length;

      setStats({
        totalRevenue,
        unpaidAmount,
        totalClients: (Array.isArray(clientsData) ? clientsData : []).length,
        pendingQuotations,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (clientId: number) => {
    return clients.find(c => c.id === clientId)?.name || 'Unknown';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      draft: { variant: 'secondary', label: t('draft') },
      sent: { variant: 'outline', label: t('sent') },
      paid: { variant: 'default', label: t('paid') },
      overdue: { variant: 'destructive', label: t('overdue') },
      cancelled: { variant: 'secondary', label: t('cancelled') },
      accepted: { variant: 'default', label: t('accepted') },
      rejected: { variant: 'destructive', label: t('rejected') },
      converted: { variant: 'default', label: t('converted') },
    };

    const config = statusConfig[status] || { variant: 'secondary' as const, label: status };
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  if (loading || companyLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border">
              <CardHeader className="pb-2 p-4">
                <Skeleton className="h-3 w-20" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Skeleton className="h-6 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Link href="/invoices/new">
          <Button size="sm" className="h-8 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            {t('createInvoice')}
          </Button>
        </Link>
        <Link href="/quotations/new">
          <Button size="sm" variant="outline" className="h-8 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            {t('createQuotation')}
          </Button>
        </Link>
        <Link href="/clients/new">
          <Button size="sm" variant="outline" className="h-8 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            {t('addClient')}
          </Button>
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border">
          <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">{t('totalRevenue')}</CardTitle>
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-semibold">{formatCurrency(stats?.totalRevenue || 0, language)}</div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">{t('unpaidInvoices')}</CardTitle>
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-semibold">{formatCurrency(stats?.unpaidAmount || 0, language)}</div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">{t('totalClients')}</CardTitle>
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-semibold">{stats?.totalClients || 0}</div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">{t('pendingQuotations')}</CardTitle>
            <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-semibold">{stats?.pendingQuotations || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">{t('recentInvoices')}</CardTitle>
            </div>
            <Link href="/invoices">
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                {t('view')} <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {recentInvoices.length === 0 ? (
              <p className="text-muted-foreground text-center py-6 text-sm">{t('noData')}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs h-8">{t('invoiceNumber')}</TableHead>
                    <TableHead className="text-xs h-8">{t('client')}</TableHead>
                    <TableHead className="text-xs h-8">{t('total')}</TableHead>
                    <TableHead className="text-xs h-8">{t('status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="py-2 text-xs">
                        <Link href={`/invoices/${invoice.id}`} className="hover:underline font-medium">
                          {invoice.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="py-2 text-xs">{getClientName(invoice.clientId)}</TableCell>
                      <TableCell className="py-2 text-xs">{formatCurrency(invoice.total, language)}</TableCell>
                      <TableCell className="py-2">{getStatusBadge(invoice.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">{t('recentQuotations')}</CardTitle>
            </div>
            <Link href="/quotations">
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                {t('view')} <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {recentQuotations.length === 0 ? (
              <p className="text-muted-foreground text-center py-6 text-sm">{t('noData')}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs h-8">{t('quotationNumber')}</TableHead>
                    <TableHead className="text-xs h-8">{t('client')}</TableHead>
                    <TableHead className="text-xs h-8">{t('total')}</TableHead>
                    <TableHead className="text-xs h-8">{t('status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentQuotations.map((quotation) => (
                    <TableRow key={quotation.id}>
                      <TableCell className="py-2 text-xs">
                        <Link href={`/quotations/${quotation.id}`} className="hover:underline font-medium">
                          {quotation.quotationNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="py-2 text-xs">{getClientName(quotation.clientId)}</TableCell>
                      <TableCell className="py-2 text-xs">{formatCurrency(quotation.total, language)}</TableCell>
                      <TableCell className="py-2">{getStatusBadge(quotation.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <I18nProvider>
      <AppLayout>
        <DashboardContent />
      </AppLayout>
    </I18nProvider>
  );
}