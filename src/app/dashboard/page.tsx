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
  Settings,
  X,
  Sparkles,
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
  const [hasCompany, setHasCompany] = useState(true);
  const [showSetupNotification, setShowSetupNotification] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [companyId]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

      const [invoicesRes, quotationsRes, clientsRes, companiesRes] = await Promise.all([
        fetch(`/api/invoices?limit=5`, { headers }),
        fetch(`/api/quotations?limit=5`, { headers }),
        fetch(`/api/clients`, { headers }),
        fetch(`/api/companies`, { headers }),
      ]);

      const invoices = await invoicesRes.json();
      const quotations = await quotationsRes.json();
      const clientsData = await clientsRes.json();
      const companiesData = await companiesRes.json();

      setRecentInvoices(Array.isArray(invoices) ? invoices : []);
      setRecentQuotations(Array.isArray(quotations) ? quotations : []);
      setClients(Array.isArray(clientsData) ? clientsData : []);

      const hasCompanySetup = Array.isArray(companiesData) && companiesData.length > 0 && companiesData[0]?.name;
      setHasCompany(hasCompanySetup);
      
      const dismissed = localStorage.getItem('setup_notification_dismissed');
      if (!hasCompanySetup && !dismissed) {
        setShowSetupNotification(true);
      }

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

  const dismissNotification = () => {
    setShowSetupNotification(false);
    localStorage.setItem('setup_notification_dismissed', 'true');
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
      {showSetupNotification && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-in slide-in-from-bottom-4">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <Settings className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Complete Your Setup</h4>
                  <p className="text-sm text-white/90 mb-3">
                    Add your company details to start creating professional invoices and quotations.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/settings">
                      <Button size="sm" className="bg-white text-purple-600 hover:bg-white/90">
                        <Settings className="h-3.5 w-3.5 mr-1.5" />
                        Go to Settings
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={dismissNotification}>
                      Later
                    </Button>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-white hover:bg-white/20" onClick={dismissNotification}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Link href="/invoices/new">
          <Button size="sm" className="h-8 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md">
            <Plus className="h-3 w-3 mr-1" />
            {t('createInvoice')}
          </Button>
        </Link>
        <Link href="/quotations/new">
          <Button size="sm" variant="outline" className="h-8 text-xs border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20">
            <Plus className="h-3 w-3 mr-1" />
            {t('createQuotation')}
          </Button>
        </Link>
        <Link href="/clients/new">
          <Button size="sm" variant="outline" className="h-8 text-xs border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20">
            <Plus className="h-3 w-3 mr-1" />
            {t('addClient')}
          </Button>
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
            <CardTitle className="text-xs font-medium text-blue-700 dark:text-blue-300">{t('totalRevenue')}</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatCurrency(stats?.totalRevenue || 0, language)}</div>
          </CardContent>
        </Card>
        
        <Card className="border-none bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
            <CardTitle className="text-xs font-medium text-orange-700 dark:text-orange-300">{t('unpaidInvoices')}</CardTitle>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{formatCurrency(stats?.unpaidAmount || 0, language)}</div>
          </CardContent>
        </Card>
        
        <Card className="border-none bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
            <CardTitle className="text-xs font-medium text-green-700 dark:text-green-300">{t('totalClients')}</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats?.totalClients || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="border-none bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
            <CardTitle className="text-xs font-medium text-purple-700 dark:text-purple-300">{t('pendingQuotations')}</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <FileSpreadsheet className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats?.pendingQuotations || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border border-blue-100 dark:border-blue-900/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10">
            <div>
              <CardTitle className="text-sm font-medium">{t('recentInvoices')}</CardTitle>
            </div>
            <Link href="/invoices">
              <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
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
                    <TableRow key={invoice.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
                      <TableCell className="py-2 text-xs">
                        <Link href={`/invoices/${invoice.id}`} className="hover:underline font-medium text-blue-600 dark:text-blue-400">
                          {invoice.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="py-2 text-xs">{getClientName(invoice.clientId)}</TableCell>
                      <TableCell className="py-2 text-xs font-medium">{formatCurrency(invoice.total, language)}</TableCell>
                      <TableCell className="py-2">{getStatusBadge(invoice.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border border-purple-100 dark:border-purple-900/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-900/10">
            <div>
              <CardTitle className="text-sm font-medium">{t('recentQuotations')}</CardTitle>
            </div>
            <Link href="/quotations">
              <Button variant="ghost" size="sm" className="h-7 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20">
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
                    <TableRow key={quotation.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-900/10">
                      <TableCell className="py-2 text-xs">
                        <Link href={`/quotations/${quotation.id}`} className="hover:underline font-medium text-purple-600 dark:text-purple-400">
                          {quotation.quotationNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="py-2 text-xs">{getClientName(quotation.clientId)}</TableCell>
                      <TableCell className="py-2 text-xs font-medium">{formatCurrency(quotation.total, language)}</TableCell>
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