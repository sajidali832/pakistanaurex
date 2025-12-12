"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { I18nProvider, useI18n, formatCurrency } from '@/lib/i18n';
import { useCompany } from '@/hooks/useCompany';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter,
} from '@/components/ui/table';
import { Plus, Trash2, Save, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Client {
    id: number;
    name: string;
    nameUrdu: string | null;
}

interface LineItem {
    id: string;
    dbId?: number;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    lineTotal: number;
}

function EditInvoiceContent({ id }: { id: string }) {
    const { t, language } = useI18n();
    const router = useRouter();
    const { companyId, isLoading: companyLoading } = useCompany();

    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [clientId, setClientId] = useState<string>('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [issueDate, setIssueDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');
    const [terms, setTerms] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [status, setStatus] = useState('draft');

    const [lineItems, setLineItems] = useState<LineItem[]>([]);

    useEffect(() => {
        if (companyId) {
            fetchData();
        }
    }, [companyId, id]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('bearer_token');
            const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
            
            const [invoiceRes, linesRes, clientsRes] = await Promise.all([
                fetch(`/api/invoices?id=${id}`, { headers }),
                fetch(`/api/invoice-lines?invoiceId=${id}`, { headers }),
                fetch('/api/clients', { headers }),
            ]);

            const invoiceData = await invoiceRes.json();
            const linesData = await linesRes.json();
            const clientsData = await clientsRes.json();

            setClients(Array.isArray(clientsData) ? clientsData : []);

            if (invoiceData && !invoiceData.error) {
                setClientId(invoiceData.clientId?.toString() || '');
                setInvoiceNumber(invoiceData.invoiceNumber || '');
                setIssueDate(invoiceData.issueDate?.split('T')[0] || '');
                setDueDate(invoiceData.dueDate?.split('T')[0] || '');
                setNotes(invoiceData.notes || '');
                setTerms(invoiceData.terms || '');
                setDiscountAmount(invoiceData.discountAmount || 0);
                setStatus(invoiceData.status || 'draft');
            }

            if (Array.isArray(linesData) && linesData.length > 0) {
                const lines = linesData.map((line: any) => ({
                    id: line.id.toString(),
                    dbId: line.id,
                    description: line.description || '',
                    quantity: line.quantity || 1,
                    unitPrice: line.unitPrice || 0,
                    taxRate: line.taxRate || 0,
                    taxAmount: line.taxAmount || 0,
                    lineTotal: line.lineTotal || 0
                }));
                setLineItems(lines);
            } else {
                setLineItems([{ id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, taxRate: 17, taxAmount: 0, lineTotal: 0 }]);
            }

        } catch (error) {
            console.error('Failed to fetch:', error);
            toast.error('Failed to load invoice details');
        } finally {
            setLoading(false);
        }
    };

    const calculateLineItem = (item: LineItem): LineItem => {
        const subtotal = item.quantity * item.unitPrice;
        const taxAmount = subtotal * (item.taxRate / 100);
        const lineTotal = subtotal + taxAmount;
        return { ...item, taxAmount, lineTotal };
    };

    const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
        setLineItems(prevItems =>
            prevItems.map(item => {
                if (item.id !== id) return item;
                const updated = { ...item, [field]: value };
                return calculateLineItem(updated);
            })
        );
    };

    const addLineItem = () => {
        setLineItems([
            ...lineItems,
            { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, taxRate: 17, taxAmount: 0, lineTotal: 0 }
        ]);
    };

    const removeLineItem = (id: string) => {
        if (lineItems.length > 1) {
            setLineItems(lineItems.filter(item => item.id !== id));
        }
    };

    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalTax = lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const total = subtotal + totalTax - discountAmount;

    const handleSave = async () => {
        if (!clientId || !invoiceNumber || !companyId) {
            toast.error('Please select a client and enter invoice number');
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('bearer_token');
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            };

            const invoiceRes = await fetch(`/api/invoices?id=${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    clientId: parseInt(clientId),
                    invoiceNumber,
                    issueDate,
                    dueDate: dueDate || null,
                    subtotal,
                    taxAmount: totalTax,
                    discountAmount,
                    total,
                    notes,
                    terms,
                    status,
                }),
            });

            if (!invoiceRes.ok) throw new Error('Failed to update invoice');

            const currentLinesRes = await fetch(`/api/invoice-lines?invoiceId=${id}`, { headers });
            const currentLines = await currentLinesRes.json();

            if (Array.isArray(currentLines)) {
                await Promise.all(currentLines.map((line: any) =>
                    fetch(`/api/invoice-lines?id=${line.id}`, {
                        method: 'DELETE',
                        headers
                    })
                ));
            }

            for (let i = 0; i < lineItems.length; i++) {
                const line = lineItems[i];
                await fetch('/api/invoice-lines', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        invoiceId: parseInt(id),
                        description: line.description,
                        quantity: line.quantity,
                        unitPrice: line.unitPrice,
                        taxRate: line.taxRate,
                        taxAmount: line.taxAmount,
                        lineTotal: line.lineTotal,
                        sortOrder: i,
                    }),
                });
            }

            toast.success('Invoice updated successfully');
            router.push(`/invoices/${id}`);
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Failed to update invoice');
        } finally {
            setSaving(false);
        }
    };

    if (loading || companyLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('back')}
                </Button>
                <h1 className="text-2xl font-bold">{t('editInvoice')}</h1>
            </div>

            <Card>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>{t('invoiceNumber')}</Label>
                            <Input
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t('client')}</Label>
                            <Select value={clientId} onValueChange={setClientId}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('selectClient')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id.toString()}>
                                            {language === 'ur' && client.nameUrdu ? client.nameUrdu : client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>{t('issueDate')}</Label>
                            <Input
                                type="date"
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t('dueDate')}</Label>
                            <Input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{t('items')}</Label>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('description')}</TableHead>
                                        <TableHead className="w-24">{t('quantity')}</TableHead>
                                        <TableHead className="w-32">{t('unitPrice')}</TableHead>
                                        <TableHead className="w-24">Tax %</TableHead>
                                        <TableHead className="w-32">{t('total')}</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lineItems.map((line) => (
                                        <TableRow key={line.id}>
                                            <TableCell>
                                                <Input
                                                    value={line.description}
                                                    onChange={(e) => updateLineItem(line.id, 'description', e.target.value)}
                                                    placeholder={t('description')}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={line.quantity}
                                                    onChange={(e) => updateLineItem(line.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={line.unitPrice}
                                                    onChange={(e) => updateLineItem(line.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={line.taxRate}
                                                    onChange={(e) => updateLineItem(line.id, 'taxRate', parseFloat(e.target.value) || 0)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(line.lineTotal, language)}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeLineItem(line.id)}
                                                    disabled={lineItems.length === 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <Button variant="ghost" size="sm" onClick={addLineItem}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                {t('addItem')}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <div className="w-72 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('subtotal')}</span>
                                <span>{formatCurrency(subtotal, language)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax</span>
                                <span>{formatCurrency(totalTax, language)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">{t('discount')}</span>
                                <Input
                                    type="number"
                                    min="0"
                                    className="w-32"
                                    value={discountAmount}
                                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                                <span>{t('grandTotal')}</span>
                                <span>{formatCurrency(total, language)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t('notes')}</Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                placeholder="Additional notes..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('terms')}</Label>
                            <Textarea
                                value={terms}
                                onChange={(e) => setTerms(e.target.value)}
                                rows={3}
                                placeholder="Terms and conditions..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => router.back()}>
                            {t('cancel')}
                        </Button>
                        <Button onClick={handleSave} disabled={saving || !clientId}>
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Save className="h-4 w-4 mr-2" />
                            {t('save')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);

    return (
        <I18nProvider>
            <AppLayout>
                <EditInvoiceContent id={resolvedParams.id} />
            </AppLayout>
        </I18nProvider>
    );
}
