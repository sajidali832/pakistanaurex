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
  TrendingUp,
  TrendingDown,
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
    // Always try to load dashboard data once.
    // If companyId is available, APIs will be filtered; otherwise we load global data.
    fetchDashboardData();
  }, [companyId]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

      const companyQuery = companyId ? `&companyId=${companyId}` : '';

      const [invoicesRes, quotationsRes, clientsRes] = await Promise.all([
        fetch(`/api/invoices?limit=5${companyQuery}`, { headers }),
        fetch(`/api/quotations?limit=5${companyQuery}`, { headers }),
        fetch(`/api/clients${companyId ? `?companyId=${companyId}` : ''}`, { headers }),
      ]);

      const invoices = await invoicesRes.json();
      const quotations = await quotationsRes.json();
      const clientsData = await clientsRes.json();

      setRecentInvoices(Array.isArray(invoices) ? invoices : []);
      setRecentQuotations(Array.isArray(quotations) ? quotations : []);
      setClients(Array.isArray(clientsData) ? clientsData : []);

      // Calculate stats
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
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue }: {
    title: string;
    value: string;
    icon: any;
    trend?: 'up' | 'down';
    trendValue?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && trendValue && (
          <p className={`text-xs flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trendValue}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (loading || companyLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/invoices/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('createInvoice')}
          </Button>
        </Link>
        <Link href="/quotations/new">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            {t('createQuotation')}
          </Button>
        </Link>
        <Link href="/clients/new">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            {t('addClient')}
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('totalRevenue')}
          value={formatCurrency(stats?.totalRevenue || 0, language)}
          icon={DollarSign}
        />
        <StatCard
          title={t('unpaidInvoices')}
          value={formatCurrency(stats?.unpaidAmount || 0, language)}
          icon={FileText}
        />
        <StatCard
          title={t('totalClients')}
          value={stats?.totalClients.toString() || '0'}
          icon={Users}
        />
        <StatCard
          title={t('pendingQuotations')}
          value={stats?.pendingQuotations.toString() || '0'}
          icon={FileSpreadsheet}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('recentInvoices')}</CardTitle>
              <CardDescription>Latest invoices overview</CardDescription>
            </div>
            <Link href="/invoices">
              <Button variant="ghost" size="sm">
                {t('view')} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentInvoices.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">{t('noData')}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('invoiceNumber')}</TableHead>
                    <TableHead>{t('client')}</TableHead>
                    <TableHead>{t('total')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                          {invoice.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{getClientName(invoice.clientId)}</TableCell>
                      <TableCell>{formatCurrency(invoice.total, language)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Quotations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('recentQuotations')}</CardTitle>
              <CardDescription>Latest quotations overview</CardDescription>
            </div>
            <Link href="/quotations">
              <Button variant="ghost" size="sm">
                {t('view')} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentQuotations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">{t('noData')}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('quotationNumber')}</TableHead>
                    <TableHead>{t('client')}</TableHead>
                    <TableHead>{t('total')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentQuotations.map((quotation) => (
                    <TableRow key={quotation.id}>
                      <TableCell className="font-medium">
                        <Link href={`/quotations/${quotation.id}`} className="hover:underline">
                          {quotation.quotationNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{getClientName(quotation.clientId)}</TableCell>
                      <TableCell>{formatCurrency(quotation.total, language)}</TableCell>
                      <TableCell>{getStatusBadge(quotation.status)}</TableCell>
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