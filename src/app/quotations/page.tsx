"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  DropdownMenuSeparator,
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
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, FileText, Loader2 } from 'lucide-react';

interface Quotation {
  id: number;
  quotationNumber: string;
  clientId: number;
  total: number;
  status: string;
  issueDate: string;
  validUntil: string;
}

interface Client {
  id: number;
  name: string;
}

function QuotationsContent() {
  const { t, language } = useI18n();
  const router = useRouter();
  const { companyId, isLoading: companyLoading } = useCompany();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [convertingId, setConvertingId] = useState<number | null>(null);

  useEffect(() => {
    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  // Also fetch data when page becomes visible (after navigation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && companyId) {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [companyId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const [quotationsRes, clientsRes] = await Promise.all([
        fetch('/api/quotations?limit=100', { headers }),
        fetch('/api/clients?limit=100', { headers }),
      ]);

      if (!quotationsRes.ok) {
        console.error('Failed to fetch quotations:', quotationsRes.status);
        setQuotations([]);
      } else {
        const quotationsData = await quotationsRes.json();
        console.log('Quotations data:', quotationsData);
        setQuotations(Array.isArray(quotationsData) ? quotationsData : []);
      }

      if (!clientsRes.ok) {
        console.error('Failed to fetch clients:', clientsRes.status);
        setClients([]);
      } else {
        const clientsData = await clientsRes.json();
        console.log('Clients data:', clientsData);
        setClients(Array.isArray(clientsData) ? clientsData : []);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
      setQuotations([]);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem('bearer_token');
      await fetch(`/api/quotations?id=${deleteId}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setQuotations(quotations.filter(q => q.id !== deleteId));
    } catch (error) {
      console.error('Delete failed:', error);
    }
    setDeleteId(null);
  };

  const handleConvertToInvoice = async (quotation: Quotation) => {
    if (!companyId) return;
    
    setConvertingId(quotation.id);
    try {
      const token = localStorage.getItem('bearer_token');
      // Get quotation lines
      const linesRes = await fetch(`/api/quotation-lines?quotationId=${quotation.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const lines = await linesRes.json();

      // Create invoice
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const invoiceNumber = `INV-${year}-${random}`;

      const invoiceRes = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyId,
          clientId: quotation.clientId,
          invoiceNumber,
          issueDate: new Date().toISOString().split('T')[0],
          status: 'draft',
          subtotal: quotation.total * 0.85,
          taxAmount: quotation.total * 0.15,
          total: quotation.total,
          currency: 'PKR',
        }),
      });

      const invoice = await invoiceRes.json();

      // Create invoice lines
      for (const line of (Array.isArray(lines) ? lines : [])) {
        await fetch('/api/invoice-lines', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            invoiceId: invoice.id,
            itemId: line.itemId,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxRate: line.taxRate,
            taxAmount: line.taxAmount,
            lineTotal: line.lineTotal,
            sortOrder: line.sortOrder,
          }),
        });
      }

      // Update quotation status
      await fetch(`/api/quotations?id=${quotation.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'converted', convertedInvoiceId: invoice.id }),
      });

      router.push(`/invoices/${invoice.id}`);
    } catch (error) {
      console.error('Convert failed:', error);
    } finally {
      setConvertingId(null);
    }
  };

  const getClientName = (clientId: number) => {
    return clients.find(c => c.id === clientId)?.name || 'Unknown';
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

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = 
      quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(quotation.clientId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading || companyLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t('filter')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              <SelectItem value="draft">{t('draft')}</SelectItem>
              <SelectItem value="sent">{t('sent')}</SelectItem>
              <SelectItem value="accepted">{t('accepted')}</SelectItem>
              <SelectItem value="rejected">{t('rejected')}</SelectItem>
              <SelectItem value="converted">{t('converted')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link href="/quotations/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('createQuotation')}
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredQuotations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('noData')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('quotationNumber')}</TableHead>
                  <TableHead>{t('client')}</TableHead>
                  <TableHead>{t('issueDate')}</TableHead>
                  <TableHead>{t('validUntil')}</TableHead>
                  <TableHead>{t('total')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead className="w-12">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations.map((quotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell className="font-medium">
                      <Link href={`/quotations/${quotation.id}`} className="hover:underline">
                        {quotation.quotationNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{getClientName(quotation.clientId)}</TableCell>
                    <TableCell>{formatDate(quotation.issueDate, language)}</TableCell>
                    <TableCell>{quotation.validUntil ? formatDate(quotation.validUntil, language) : '-'}</TableCell>
                    <TableCell>{formatCurrency(quotation.total, language)}</TableCell>
                    <TableCell>{getStatusBadge(quotation.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/quotations/${quotation.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t('view')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/quotations/${quotation.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              {t('edit')}
                            </Link>
                          </DropdownMenuItem>
                          {quotation.status !== 'converted' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleConvertToInvoice(quotation)}
                                disabled={convertingId === quotation.id}
                              >
                                {convertingId === quotation.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <FileText className="h-4 w-4 mr-2" />
                                )}
                                {t('convertToInvoice')}
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(quotation.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
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
              Are you sure you want to delete this quotation? This action cannot be undone.
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

export default function QuotationsPage() {
  return (
    <I18nProvider>
      <AppLayout>
        <QuotationsContent />
      </AppLayout>
    </I18nProvider>
  );
}