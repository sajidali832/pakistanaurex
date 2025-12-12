"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { I18nProvider, useI18n, formatCurrency } from '@/lib/i18n';
import { useCompany } from '@/hooks/useCompany';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface Item {
    id: number;
    name: string;
    nameUrdu: string | null;
    unitPrice: number;
}

interface Company {
    id: number;
    defaultTaxRate: number;
    paymentTermsDays: number;
}

interface LineItem {
    id: string;
    dbId?: number;
    itemId: number | null;
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

function EditQuotationContent({ id }: { id: string }) {
    const { t, language } = useI18n();
    const router = useRouter();
    const { companyId, isLoading: companyLoading } = useCompany();

    const [clients, setClients] = useState<Client[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [companySettings, setCompanySettings] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [clientId, setClientId] = useState<string>('');
    const [quotationNumber, setQuotationNumber] = useState('');
    const [issueDate, setIssueDate] = useState('');
    const [validUntil, setValidUntil] = useState('');
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
            const headers = { 'Authorization': `Bearer ${token}` };

            const [quotationRes, linesRes, clientsRes, itemsRes, companiesRes] = await Promise.all([
                fetch(`/api/quotations?id=${id}`, { headers }),
                fetch(`/api/quotation-lines?quotationId=${id}`, { headers }),
                fetch('/api/clients', { headers }),
                fetch('/api/items', { headers }),
                fetch('/api/companies', { headers }),
            ]);

            const safeParse = async (res: Response) => {
                const text = await res.text();
                try {
                    return JSON.parse(text);
                } catch {
                    console.error('Non-JSON response:', text);
                    return null;
                }
            };

            const quotationData = quotationRes.ok ? await safeParse(quotationRes) : null;
            const linesData = linesRes.ok ? await safeParse(linesRes) : [];
            const clientsData = clientsRes.ok ? await safeParse(clientsRes) : [];
            const itemsData = itemsRes.ok ? await safeParse(itemsRes) : [];
            const companiesData = companiesRes.ok ? await safeParse(companiesRes) : [];

            setClients(Array.isArray(clientsData) ? clientsData : []);
            setItems(Array.isArray(itemsData) ? itemsData : []);

            if (Array.isArray(companiesData) && companiesData.length > 0) {
                setCompanySettings(companiesData[0]);
            }

            // Populate form
            if (quotationData) {
                setClientId(quotationData.clientId?.toString() || '');
                setQuotationNumber(quotationData.quotationNumber || '');
                setIssueDate(quotationData.issueDate ? quotationData.issueDate.split('T')[0] : '');
                setValidUntil(quotationData.validUntil ? quotationData.validUntil.split('T')[0] : '');
                setNotes(quotationData.notes || '');
                setTerms(quotationData.terms || '');
                setDiscountAmount(quotationData.discountAmount || 0);
                setStatus(quotationData.status || 'draft');
            }

            // Populate lines
            if (Array.isArray(linesData)) {
                const lines = linesData.map((line: any) => ({
                    id: line.id.toString(),
                    dbId: line.id,
                    itemId: line.itemId,
                    description: line.description,
                    quantity: line.quantity,
                    unitPrice: line.unitPrice,
                    lineTotal: line.lineTotal
                }));
                setLineItems(lines);
            }

        } catch (error) {
            console.error('Failed to fetch:', error);
            toast.error('Failed to load quotation details');
        } finally {
            setLoading(false);
        }
    };

    const calculateLineItem = (item: LineItem): LineItem => {
        const lineTotal = item.quantity * item.unitPrice;
        return { ...item, lineTotal };
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
            { id: Date.now().toString(), itemId: null, description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }
        ]);
    };

    const removeLineItem = (id: string) => {
        if (lineItems.length > 1) {
            setLineItems(lineItems.filter(item => item.id !== id));
        }
    };

    const selectItem = (lineId: string, itemId: string) => {
        const selectedItem = items.find(i => i.id === parseInt(itemId));
        if (selectedItem) {
            setLineItems(prevItems =>
                prevItems.map(item => {
                    if (item.id !== lineId) return item;
                    const updated = {
                        ...item,
                        itemId: selectedItem.id,
                        description: language === 'ur' && selectedItem.nameUrdu ? selectedItem.nameUrdu : selectedItem.name,
                        unitPrice: selectedItem.unitPrice,
                    };
                    return calculateLineItem(updated);
                })
            );
        }
    };

    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const total = subtotal - discountAmount;

    const handleSave = async () => {
        if (!clientId || !quotationNumber || !companyId) {
            toast.error('Please select a client and enter quotation number');
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('bearer_token');
            // Update Quotation
            const quotationRes = await fetch(`/api/quotations?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    clientId: parseInt(clientId),
                    quotationNumber,
                    issueDate,
                    validUntil: validUntil || null,
                    subtotal,
                    taxAmount: 0,
                    discountAmount,
                    total,
                    notes,
                    terms,
                }),
            });

            if (!quotationRes.ok) throw new Error('Failed to update quotation');

            // Update Lines - simplistic approach: delete all and recreate is simpler, 
            // but if we want to preserve IDs we should update.
            // For now, let's delete existing lines and recreate them to ensure consistency.

            // First delete existing lines for this quotation (backend should ideally handle this or we do it here)
            // Since API might not support bulk delete, we might need a specific endpoint or logic
            // Assuming existing PUT /api/quotations updates the header only.

            // A safe way: Delete all lines and recreate.
            // But we need to know the IDs to delete. The current lines state has dbId for existing ones.

            // Getting original lines ids again might be safer but let's assume `lineItems` with `dbId` are the ones to consider?
            // Actually simpler: Just send a request to a bulk update endpoint if it existed.
            // Since we don't know if a bulk update exists, we will use the individual endpoints.

            // STRATEGY: 
            // 1. Fetch current lines from DB to compare or just delete all.
            // 2. Insert new lines.

            // Let's try Delete All Lines first
            // NOTE: This API `/api/quotation-lines` needs to support deletion by quotationId or we call delete on each ID.
            // Let's fetch current lines first to delete them.
            const currentLinesRes = await fetch(`/api/quotation-lines?quotationId=${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const currentLines = await currentLinesRes.json();

            if (Array.isArray(currentLines)) {
                await Promise.all(currentLines.map((line: any) =>
                    fetch(`/api/quotation-lines?id=${line.id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ));
            }

            // Create new lines
            for (let i = 0; i < lineItems.length; i++) {
                const line = lineItems[i];
                await fetch('/api/quotation-lines', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        quotationId: parseInt(id),
                        itemId: line.itemId,
                        description: line.description,
                        quantity: line.quantity,
                        unitPrice: line.unitPrice,
                        taxRate: 0,
                        taxAmount: 0,
                        lineTotal: line.lineTotal,
                        sortOrder: i,
                    }),
                });
            }

            toast.success('Quotation updated successfully');
            router.push(`/quotations/${id}`);
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Failed to update quotation');
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
                <h1 className="text-2xl font-bold">{t('editQuotation')}</h1>
            </div>

            <Card>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>{t('quotationNumber')}</Label>
                            <Input
                                value={quotationNumber}
                                onChange={(e) => setQuotationNumber(e.target.value)}
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
                            <Label>{t('validUntil')}</Label>
                            <Input
                                type="date"
                                value={validUntil}
                                onChange={(e) => setValidUntil(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="space-y-2">
                        <Label>{t('items')}</Label>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-48">{t('items')}</TableHead>
                                        <TableHead>{t('description')}</TableHead>
                                        <TableHead className="w-24">{t('quantity')}</TableHead>
                                        <TableHead className="w-32">{t('unitPrice')}</TableHead>
                                        <TableHead className="w-32">{t('total')}</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lineItems.map((line) => (
                                        <TableRow key={line.id}>
                                            <TableCell>
                                                <Select
                                                    value={line.itemId?.toString() || ''}
                                                    onValueChange={(value) => selectItem(line.id, value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('selectClient')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {items.map((item) => (
                                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                                {language === 'ur' && item.nameUrdu ? item.nameUrdu : item.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
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

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-72 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('subtotal')}</span>
                                <span>{formatCurrency(subtotal, language)}</span>
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

                    {/* Notes & Terms */}
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

                    {/* Actions */}
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

export default function EditQuotationPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);

    return (
        <I18nProvider>
            <AppLayout>
                <EditQuotationContent id={resolvedParams.id} />
            </AppLayout>
        </I18nProvider>
    );
}
