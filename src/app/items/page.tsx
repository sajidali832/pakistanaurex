"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { I18nProvider, useI18n, formatCurrency } from '@/lib/i18n';
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
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from 'lucide-react';

interface Item {
  id: number;
  name: string;
  nameUrdu: string | null;
  description: string | null;
  unitPrice: number;
  unit: string;
  taxRate: number;
  isService: boolean;
  sku: string | null;
}

function ItemsContent() {
  const { t, language } = useI18n();
  const { companyId, isLoading: companyLoading } = useCompany();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (companyId) {
      fetchItems();
    }
  }, [companyId]);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const res = await fetch('/api/items?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem('bearer_token');
      await fetch(`/api/items?id=${deleteId}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setItems(items.filter(i => i.id !== deleteId));
    } catch (error) {
      console.error('Delete failed:', error);
    }
    setDeleteId(null);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nameUrdu?.includes(searchTerm);
    const matchesType = 
      typeFilter === 'all' ||
      (typeFilter === 'service' && item.isService) ||
      (typeFilter === 'product' && !item.isService);
    return matchesSearch && matchesType;
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
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t('filter')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              <SelectItem value="product">{t('product')}</SelectItem>
              <SelectItem value="service">{t('service')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link href="/items/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('addNewItem')}
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('noData')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('sku')}</TableHead>
                  <TableHead>{t('itemName')}</TableHead>
                  <TableHead>{t('unitPrice')}</TableHead>
                  <TableHead>{t('unit')}</TableHead>
                  <TableHead>{t('taxRate')}</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-12">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">
                      {item.sku || '-'}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.nameUrdu && language === 'ur' && (
                          <p className="text-sm text-muted-foreground">{item.nameUrdu}</p>
                        )}
                        {item.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-xs">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(item.unitPrice, language)}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.taxRate}%</TableCell>
                    <TableCell>
                      <Badge variant={item.isService ? 'outline' : 'secondary'}>
                        {item.isService ? t('service') : t('product')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/items/${item.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              {t('edit')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(item.id)}
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
              Are you sure you want to delete this item? This action cannot be undone.
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

export default function ItemsPage() {
  return (
    <I18nProvider>
      <AppLayout>
        <ItemsContent />
      </AppLayout>
    </I18nProvider>
  );
}