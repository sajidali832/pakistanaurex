"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { I18nProvider, useI18n, formatCurrency, formatDate } from '@/lib/i18n';
import { useCompany } from '@/hooks/useCompany';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, FileDown } from 'lucide-react';

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientId: number;
  total: number;
  status: string;
  issueDate: string;
  dueDate: string;
}

interface Client {
  id: number;
  name: string;
}

function InvoicesContent() {
  const { t, language } = useI18n();
  const { companyId, isLoading: companyLoading } = useCompany();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, [companyId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchData = async () => {
    try {
      const [invoicesRes, clientsRes] = await Promise.all([
        fetch('/api/invoices?limit=100'),
        fetch('/api/clients?limit=100'),
      ]);

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      }

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(Array.isArray(clientsData) ? clientsData : []);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/invoices?id=${deleteId}`, { method: 'DELETE' });
      setInvoices(invoices.filter(i => i.id !== deleteId));
    } catch (error) {
      console.error('Delete failed:', error);
    }
    setDeleteId(null);
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
    };
    const config = statusConfig[status] || { variant: 'secondary' as const, label: status };
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(invoice.clientId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading || companyLoading) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Card className="border">
          <CardContent className="p-4">
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 w-full sm:w-48 text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32 h-8 text-sm">
              <SelectValue placeholder={t('filter')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              <SelectItem value="draft">{t('draft')}</SelectItem>
              <SelectItem value="sent">{t('sent')}</SelectItem>
              <SelectItem value="paid">{t('paid')}</SelectItem>
              <SelectItem value="overdue">{t('overdue')}</SelectItem>
              <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link href="/invoices/new">
          <Button size="sm" className="h-8 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            {t('createInvoice')}
          </Button>
        </Link>
      </div>

      <Card className="border">
        <CardContent className="p-0">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              {t('noData')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t('invoiceNumber')}</TableHead>
                  <TableHead className="text-xs">{t('client')}</TableHead>
                  <TableHead className="text-xs">{t('issueDate')}</TableHead>
                  <TableHead className="text-xs">{t('dueDate')}</TableHead>
                  <TableHead className="text-xs">{t('total')}</TableHead>
                  <TableHead className="text-xs">{t('status')}</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="text-xs font-medium py-2">
                      <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                        {invoice.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs py-2">{getClientName(invoice.clientId)}</TableCell>
                    <TableCell className="text-xs py-2">{formatDate(invoice.issueDate, language)}</TableCell>
                    <TableCell className="text-xs py-2">{invoice.dueDate ? formatDate(invoice.dueDate, language) : '-'}</TableCell>
                    <TableCell className="text-xs py-2">{formatCurrency(invoice.total, language)}</TableCell>
                    <TableCell className="py-2">{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="py-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/invoices/${invoice.id}`}>
                              <Eye className="h-3.5 w-3.5 mr-2" />
                              {t('view')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/invoices/${invoice.id}/edit`}>
                              <Edit className="h-3.5 w-3.5 mr-2" />
                              {t('edit')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/invoices/${invoice.id}/export`}>
                              <FileDown className="h-3.5 w-3.5 mr-2" />
                              {t('download')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(invoice.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            {t('delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t('delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <I18nProvider>
      <AppLayout>
        <InvoicesContent />
      </AppLayout>
    </I18nProvider>
  );
}