"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { I18nProvider, useI18n, formatCurrency } from '@/lib/i18n';
import { useCompany } from '@/hooks/useCompany';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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
import { Plus, Trash2, Save, Loader2, Receipt } from 'lucide-react';
import { toast } from 'sonner';

interface Client {
    id: number;
    name: string;
    nameUrdu: string | null;
    address: string;
    ntnNumber: string;
    salesTaxRegistration?: string;
}

interface CompanyFull {
    id: number;
    name: string;
    nameUrdu: string | null;
    address: string;
    city: string;
    ntnNumber: string;
    strnNumber: string;
    defaultTaxRate: number;
}

interface LineItem {
    id: string;
    serialNo: number;
    description: string;
    quantity: number;
    rate: number;
    valueExclTax: number;
    taxRate: number;
    taxPayable: number;
    valueInclTax: number;
}

function NewTaxInvoiceContent() {
    const { t, language } = useI18n();
    const router = useRouter();
    const { companyId, isLoading: companyLoading } = useCompany();

    const [clients, setClients] = useState<Client[]>([]);
    const [companySettings, setCompanySettings] = useState<CompanyFull | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [clientId, setClientId] = useState<string>('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [serialNumber, setSerialNumber] = useState('');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);

    const [lineItems, setLineItems] = useState<LineItem[]>([]);

    useEffect(() => {
        if (companyId) {
            fetchData();
        }
        generateSerialNumber();
    }, [companyId]);

    useEffect(() => {
        if (clientId && clients.length > 0) {
            const client = clients.find(c => c.id === parseInt(clientId));
            setSelectedClient(client || null);
        }
    }, [clientId, clients]);

    const fetchData = async () => {
        try {
            const [clientsRes, companyRes] = await Promise.all([
                fetch('/api/clients?limit=100'),
                fetch('/api/user-company'),
            ]);

            if (!clientsRes.ok) {
                const text = await clientsRes.text();
                console.error('Failed to fetch clients for tax invoices:', clientsRes.status, text);
                setClients([]);
            } else {
                const clientsData = await clientsRes.json();
                setClients(Array.isArray(clientsData) ? clientsData : []);
            }

            if (!companyRes.ok) {
                const text = await companyRes.text();
                console.error('Failed to fetch company for tax invoices:', companyRes.status, text);
                setCompanySettings(null);
            } else {
                const company = await companyRes.json();
                setCompanySettings(company);

                // Check if company settings are complete
                if (!company.name || !company.address || !company.ntnNumber) {
                    toast.error('Please complete your company settings before creating tax invoices');
                    router.push('/settings');
                    return;
                }

                const defaultTaxRate = company.defaultTaxRate ?? 17;
                setLineItems([
                    { id: '1', serialNo: 1, description: '', quantity: 1, rate: 0, valueExclTax: 0, taxRate: defaultTaxRate, taxPayable: 0, valueInclTax: 0 }
                ]);
            }
        } catch (error) {
            console.error('Failed to fetch:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateSerialNumber = () => {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        setSerialNumber(`STI-${year}-${random}`);
    };

    const calculateLineItem = (item: LineItem): LineItem => {
        const valueExclTax = item.quantity * item.rate;
        const taxPayable = valueExclTax * (item.taxRate / 100);
        const valueInclTax = valueExclTax + taxPayable;
        return { ...item, valueExclTax, taxPayable, valueInclTax };
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
        const defaultTaxRate = companySettings?.defaultTaxRate ?? 17;
        const nextSerialNo = lineItems.length + 1;
        setLineItems([
            ...lineItems,
            { id: Date.now().toString(), serialNo: nextSerialNo, description: '', quantity: 1, rate: 0, valueExclTax: 0, taxRate: defaultTaxRate, taxPayable: 0, valueInclTax: 0 }
        ]);
    };

    const removeLineItem = (id: string) => {
        if (lineItems.length > 1) {
            const filtered = lineItems.filter(item => item.id !== id);
            // Renumber serial numbers
            const renumbered = filtered.map((item, index) => ({
                ...item,
                serialNo: index + 1
            }));
            setLineItems(renumbered);
        }
    };

    const totalExclTax = lineItems.reduce((sum, item) => sum + item.valueExclTax, 0);
    const totalTax = lineItems.reduce((sum, item) => sum + item.taxPayable, 0);
    const grandTotal = lineItems.reduce((sum, item) => sum + item.valueInclTax, 0);

    const handleSave = async (status: string = 'draft') => {
        if (!clientId || !serialNumber || !companyId) {
            toast.error('Please select a buyer and enter serial number');
            return;
        }

        setSaving(true);
        try {
            // Store in localStorage for now
            const storedInvoices = localStorage.getItem('tax_invoices');
            const invoices = storedInvoices ? JSON.parse(storedInvoices) : [];

            const newInvoice = {
                id: Date.now(),
                companyId,
                clientId: parseInt(clientId),
                serialNumber,
                issueDate,
                status,
                totalExclTax,
                totalTax,
                total: grandTotal,
                lineItems: lineItems,
                buyerName: selectedClient?.name,
                buyerAddress: selectedClient?.address,
                buyerNtn: selectedClient?.ntnNumber,
                buyerStrn: selectedClient?.salesTaxRegistration,
            };

            invoices.push(newInvoice);
            localStorage.setItem('tax_invoices', JSON.stringify(invoices));

            toast.success('Sales Tax Invoice created successfully');
            router.push('/tax-invoices');
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Failed to create tax invoice');
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
        <div className="space-y-6 max-w-6xl mx-auto">
            <Card>
                <CardHeader className="bg-muted/50">
                    <div className="flex items-center gap-2">
                        <Receipt className="h-6 w-6" />
                        <CardTitle className="text-xl">Sales Tax Invoice</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">FBR Compliant Format</p>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    {/* Company Header */}
                    <div className="bg-muted/30 p-4 rounded-lg">
                        <div className="text-center">
                            <h2 className="text-xl font-bold">{companySettings?.name}</h2>
                            {companySettings?.nameUrdu && (
                                <p className="text-lg" dir="rtl">{companySettings.nameUrdu}</p>
                            )}
                            <p className="text-sm text-muted-foreground">{companySettings?.address}, {companySettings?.city}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                            <div>
                                <span className="font-medium">NTN: </span>
                                <span>{companySettings?.ntnNumber || 'N/A'}</span>
                            </div>
                            <div className="text-right">
                                <span className="font-medium">Sales Tax Registration #: </span>
                                <span>{companySettings?.strnNumber || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Invoice Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Serial No.</Label>
                            <Input
                                value={serialNumber}
                                onChange={(e) => setSerialNumber(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Buyer</Label>
                            <Select value={clientId} onValueChange={setClientId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Buyer" />
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
                    </div>

                    {/* Buyer Details */}
                    {selectedClient && (
                        <div className="bg-muted/30 p-4 rounded-lg">
                            <h3 className="font-medium mb-2">Buyer's Details:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div><span className="font-medium">Name: </span>{selectedClient.name}</div>
                                <div><span className="font-medium">NTN #: </span>{selectedClient.ntnNumber || 'N/A'}</div>
                                <div><span className="font-medium">Address: </span>{selectedClient.address || 'N/A'}</div>
                                <div><span className="font-medium">Sales Tax Reg #: </span>{selectedClient.salesTaxRegistration || 'N/A'}</div>
                            </div>
                        </div>
                    )}

                    {/* Line Items Table - FBR Format */}
                    <div className="space-y-2">
                        <Label>Description of Goods</Label>
                        <div className="border rounded-lg overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-16 text-center">S.No</TableHead>
                                        <TableHead>Description of Goods</TableHead>
                                        <TableHead className="w-20 text-center">Qty</TableHead>
                                        <TableHead className="w-28 text-center">Rate</TableHead>
                                        <TableHead className="w-32 text-center">Value Excl. Tax</TableHead>
                                        <TableHead className="w-20 text-center">Tax Rate %</TableHead>
                                        <TableHead className="w-32 text-center">Sales Tax Payable</TableHead>
                                        <TableHead className="w-32 text-center">Value Incl. Tax</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lineItems.map((line) => (
                                        <TableRow key={line.id}>
                                            <TableCell className="text-center font-medium">{line.serialNo}</TableCell>
                                            <TableCell>
                                                <Input
                                                    value={line.description}
                                                    onChange={(e) => updateLineItem(line.id, 'description', e.target.value)}
                                                    placeholder="Description of goods"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={line.quantity}
                                                    onChange={(e) => updateLineItem(line.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                    className="text-center"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={line.rate}
                                                    onChange={(e) => updateLineItem(line.id, 'rate', parseFloat(e.target.value) || 0)}
                                                    className="text-right"
                                                />
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(line.valueExclTax, language)}
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={line.taxRate}
                                                    onChange={(e) => updateLineItem(line.id, 'taxRate', parseFloat(e.target.value) || 0)}
                                                    className="text-center"
                                                />
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-orange-600">
                                                {formatCurrency(line.taxPayable, language)}
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                {formatCurrency(line.valueInclTax, language)}
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
                                        <TableCell colSpan={4}>
                                            <Button variant="ghost" size="sm" onClick={addLineItem}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Row
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            {formatCurrency(totalExclTax, language)}
                                        </TableCell>
                                        <TableCell></TableCell>
                                        <TableCell className="text-right font-bold text-orange-600">
                                            {formatCurrency(totalTax, language)}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-lg">
                                            {formatCurrency(grandTotal, language)}
                                        </TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
                    </div>

                    {/* Totals Summary */}
                    <div className="flex justify-end">
                        <div className="w-80 bg-muted/30 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total (Excl. Tax)</span>
                                <span>{formatCurrency(totalExclTax, language)}</span>
                            </div>
                            <div className="flex justify-between text-orange-600">
                                <span>Sales Tax Payable</span>
                                <span>{formatCurrency(totalTax, language)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total (Incl. Tax)</span>
                                <span>{formatCurrency(grandTotal, language)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Signature Line */}
                    <div className="flex justify-end pt-8">
                        <div className="text-center">
                            <div className="border-t border-black w-48 mb-2"></div>
                            <span className="text-sm text-muted-foreground">Authorized Signature</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button variant="secondary" onClick={() => handleSave('draft')} disabled={saving || !clientId}>
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Save Draft
                        </Button>
                        <Button onClick={() => handleSave('issued')} disabled={saving || !clientId}>
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Save className="h-4 w-4 mr-2" />
                            Issue Invoice
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function NewTaxInvoicePage() {
    return (
        <I18nProvider>
            <AppLayout>
                <NewTaxInvoiceContent />
            </AppLayout>
        </I18nProvider>
    );
}