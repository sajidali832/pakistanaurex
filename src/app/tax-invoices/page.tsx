"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { I18nProvider, useI18n, formatCurrency, formatDate } from '@/lib/i18n';
import { useCompany } from '@/hooks/useCompany';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, FileDown, Receipt } from 'lucide-react';
import { toast } from 'sonner';

interface TaxInvoice {
    id: number;
    invoiceNumber: string;
    clientId: number;
    total: number;
    taxAmount: number;
    status: string;
    issueDate: string;
    companyId: number;
    subtotal?: number;
    discountAmount?: number;
    amountPaid?: number;
    currency?: string;
    notes?: string;
    terms?: string;
    createdBy?: number;
    createdAt?: string;
    updatedAt?: string;
}

interface Client {
    id: number;
    name: string;
}

function TaxInvoicesContent() {
    const { t, language } = useI18n();
    const { companyId, isLoading: companyLoading } = useCompany();

    const [taxInvoices, setTaxInvoices] = useState<TaxInvoice[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    useEffect(() => {
        if (companyId) {
            fetchData();
        }
    }, [companyId]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch tax invoices from API
            const invoicesRes = await fetch('/api/tax-invoices');
            if (invoicesRes.status === 401) {
                toast.error('Your session has expired. Please log in again.');
                window.location.href = `/login?redirect_url=${encodeURIComponent('/tax-invoices')}`;
                return;
            }
            const invoicesData = await invoicesRes.json();

            const clientsRes = await fetch('/api/clients');
            if (clientsRes.status === 401) {
                toast.error('Your session has expired. Please log in again.');
                window.location.href = `/login?redirect_url=${encodeURIComponent('/tax-invoices')}`;
                return;
            }
            const clientsData = await clientsRes.json();

            setTaxInvoices(invoicesData);
            setClients(clientsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            const res = await fetch(`/api/tax-invoices?id=${deleteId}`, {
                method: 'DELETE',
            });

            if (res.status === 401) {
                toast.error('Your session has expired. Please log in again.');
                window.location.href = `/login?redirect_url=${encodeURIComponent('/tax-invoices')}`;
                return;
            }

            if (res.ok) {
                setTaxInvoices(prev => prev.filter(inv => inv.id !== deleteId));
                toast.success('Tax invoice deleted successfully');
            } else {
                toast.error('Failed to delete tax invoice');
            }
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('Failed to delete tax invoice');
        } finally {
            setDeleteId(null);
        }
    };

    const getClientName = (clientId: number) => {
        const client = clients.find(c => c.id === clientId);
        return client?.name || 'Unknown';
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
            draft: { variant: 'secondary', label: 'Draft' },
            issued: { variant: 'default', label: 'Issued' },
            cancelled: { variant: 'destructive', label: 'Cancelled' },
        };
        const config = statusConfig[status] || { variant: 'secondary' as const, label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const filteredInvoices = taxInvoices.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        getClientName(invoice.clientId).toLowerCase().includes(search.toLowerCase())
    );

    if (loading || companyLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <Receipt className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold">Sales Tax Invoices (FBR)</h1>
                </div>
                <Link href="/tax-invoices/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Tax Invoice
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by serial number or buyer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredInvoices.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No tax invoices found</p>
                            <p className="text-sm">Create your first FBR-compliant sales tax invoice</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Serial No.</TableHead>
                                    <TableHead>Buyer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Total Tax</TableHead>
                                    <TableHead className="text-right">Total (Incl. Tax)</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInvoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                                        <TableCell>{getClientName(invoice.clientId)}</TableCell>
                                        <TableCell>{formatDate(invoice.issueDate, language)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(invoice.taxAmount, language)}</TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(invoice.total, language)}</TableCell>
                                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/tax-invoices/${invoice.id}`}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/tax-invoices/${invoice.id}/edit`}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setDeleteId(invoice.id)} className="text-destructive">
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
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

            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Tax Invoice?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the tax invoice.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default function TaxInvoicesPage() {
    return (
        <I18nProvider>
            <AppLayout>
                <TaxInvoicesContent />
            </AppLayout>
        </I18nProvider>
    );
}
