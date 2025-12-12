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
import { ArrowLeft, Save, Loader2, Receipt } from 'lucide-react';
import { toast } from 'sonner';

interface Client {
    id: number;
    name: string;
    ntnNumber?: string;
}

function EditTaxInvoiceContent({ id }: { id: string }) {
    const { t, language } = useI18n();
    const router = useRouter();
    const { companyId, isLoading: companyLoading } = useCompany();

    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [clientId, setClientId] = useState<string>('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [issueDate, setIssueDate] = useState('');
    const [subtotal, setSubtotal] = useState(0);
    const [taxAmount, setTaxAmount] = useState(0);
    const [total, setTotal] = useState(0);
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState('draft');

    useEffect(() => {
        if (companyId) {
            fetchData();
        }
    }, [companyId, id]);

    useEffect(() => {
        const calculatedTax = subtotal * 0.17;
        setTaxAmount(calculatedTax);
        setTotal(subtotal + calculatedTax);
    }, [subtotal]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('bearer_token');
            const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
            
            const [invoiceRes, clientsRes] = await Promise.all([
                fetch(`/api/tax-invoices?id=${id}`, { headers }),
                fetch('/api/clients', { headers }),
            ]);

            const invoiceData = await invoiceRes.json();
            const clientsData = await clientsRes.json();

            setClients(Array.isArray(clientsData) ? clientsData : []);

            if (invoiceData && !invoiceData.error) {
                setClientId(invoiceData.clientId?.toString() || '');
                setInvoiceNumber(invoiceData.invoiceNumber || '');
                setIssueDate(invoiceData.issueDate?.split('T')[0] || '');
                setSubtotal(invoiceData.subtotal || 0);
                setTaxAmount(invoiceData.taxAmount || 0);
                setTotal(invoiceData.total || 0);
                setNotes(invoiceData.notes || '');
                setStatus(invoiceData.status || 'draft');
            }

        } catch (error) {
            console.error('Failed to fetch:', error);
            toast.error('Failed to load tax invoice details');
        } finally {
            setLoading(false);
        }
    };

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

            const res = await fetch(`/api/tax-invoices?id=${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    clientId: parseInt(clientId),
                    invoiceNumber,
                    issueDate,
                    subtotal,
                    taxAmount,
                    total,
                    notes,
                    status,
                }),
            });

            if (!res.ok) throw new Error('Failed to update tax invoice');

            toast.success('Tax invoice updated successfully');
            router.push(`/tax-invoices/${id}`);
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Failed to update tax invoice');
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
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('back')}
                </Button>
                <div className="flex items-center gap-2">
                    <Receipt className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold">Edit Tax Invoice</h1>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tax Invoice Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Serial Number</Label>
                            <Input
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Buyer (Client)</Label>
                            <Select value={clientId} onValueChange={setClientId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select buyer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id.toString()}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Issue Date</Label>
                            <Input
                                type="date"
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="issued">Issued</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                        <h3 className="font-medium">Tax Calculation</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Subtotal (Excl. Tax)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={subtotal}
                                    onChange={(e) => setSubtotal(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Sales Tax (17%)</Label>
                                <Input
                                    type="number"
                                    value={taxAmount.toFixed(2)}
                                    readOnly
                                    className="bg-muted"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Total (Incl. Tax)</Label>
                                <Input
                                    type="number"
                                    value={total.toFixed(2)}
                                    readOnly
                                    className="bg-muted font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Additional notes..."
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving || !clientId}>
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function EditTaxInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);

    return (
        <I18nProvider>
            <AppLayout>
                <EditTaxInvoiceContent id={resolvedParams.id} />
            </AppLayout>
        </I18nProvider>
    );
}
