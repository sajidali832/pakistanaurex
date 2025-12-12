"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { I18nProvider, useI18n, formatCurrency, formatDate } from '@/lib/i18n';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter,
} from '@/components/ui/table';
import { ArrowLeft, Printer, Download, Receipt } from 'lucide-react';

interface TaxInvoice {
    id: number;
    serialNumber: string;
    clientId: number;
    issueDate: string;
    status: string;
    totalExclTax: number;
    totalTax: number;
    total: number;
    buyerName: string;
    buyerAddress: string;
    buyerNtn: string;
    buyerStrn: string;
    lineItems: LineItem[];
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

interface Company {
    id: number;
    name: string;
    nameUrdu: string | null;
    address: string;
    city: string;
    ntnNumber: string;
    strnNumber: string;
}

function TaxInvoiceDetailContent({ id }: { id: string }) {
    const { language } = useI18n();
    const router = useRouter();

    const [invoice, setInvoice] = useState<TaxInvoice | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('bearer_token');
            const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

            // Try localStorage first (used right after creation)
            const storedInvoices = localStorage.getItem('tax_invoices');
            const invoices = storedInvoices ? JSON.parse(storedInvoices) : [];
            let inv = invoices.find((i: TaxInvoice) => i.id === parseInt(id)) || null;

            // Fallback to API so existing invoices can be viewed even if localStorage is empty
            if (!inv) {
                const apiRes = await fetch(`/api/tax-invoices?id=${id}`, { headers });
                const text = await apiRes.text();
                if (apiRes.ok) {
                    try {
                        const apiData = JSON.parse(text);
                        inv = {
                            id: apiData.id,
                            serialNumber: apiData.invoiceNumber ?? `INV-${apiData.id}`,
                            clientId: apiData.clientId,
                            issueDate: apiData.issueDate,
                            status: apiData.status,
                            totalExclTax: apiData.subtotal ?? 0,
                            totalTax: apiData.taxAmount ?? 0,
                            total: apiData.total ?? 0,
                            buyerName: apiData.buyerName || 'Buyer',
                            buyerAddress: apiData.buyerAddress || '',
                            buyerNtn: apiData.buyerNtn || '',
                            buyerStrn: apiData.buyerStrn || '',
                            lineItems: [],
                        };
                    } catch {
                        console.error('Non-JSON tax invoice response:', text);
                    }
                } else {
                    console.error('Failed to load tax invoice:', apiRes.status, text);
                }
            }

            const companiesRes = await fetch('/api/companies', { headers });
            const companiesData = companiesRes.ok ? await companiesRes.json() : [];

            setInvoice(inv || null);
            setCompany(Array.isArray(companiesData) ? companiesData[0] : null);
        } catch (error) {
            console.error('Failed to fetch:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
            draft: { variant: 'secondary', label: 'Draft' },
            issued: { variant: 'default', label: 'Issued' },
            cancelled: { variant: 'destructive', label: 'Cancelled' },
        };
        const config = statusConfig[status] || { variant: 'secondary' as const, label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-32" />
                <Card>
                    <CardContent className="p-6">
                        <Skeleton className="h-96 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Tax Invoice not found</p>
                <Button className="mt-4" onClick={() => router.push('/tax-invoices')}>
                    Back to Tax Invoices
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-w-5xl mx-auto">
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                <Button variant="ghost" onClick={() => router.push('/tax-invoices')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Tax Invoices
                </Button>
                <div className="flex flex-wrap gap-2 items-center">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2 print:hidden">
                <span className="text-sm text-muted-foreground">Status:</span>
                {getStatusBadge(invoice.status)}
            </div>

            {/* Tax Invoice Document */}
            <Card className="print:shadow-none print:border-none overflow-hidden">
                <CardContent className="p-8 print:p-4">
                    {/* Header */}
                    <div className="text-center border-b-2 border-primary pb-4 mb-4">
                        <h1 className="text-xl font-bold text-primary">Sales Tax Invoice</h1>
                    </div>

                    {/* Company Details */}
                    <div className="text-center mb-4 bg-primary/10 dark:bg-primary/20 p-4 rounded-lg">
                        <h2 className="text-lg font-bold text-foreground">{company?.name}</h2>
                        {company?.nameUrdu && (
                            <p className="text-base text-foreground" dir="rtl">{company.nameUrdu}</p>
                        )}
                        <p className="text-sm text-muted-foreground">{company?.address}, {company?.city}</p>
                    </div>

                    {/* Registration Numbers */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="border border-border bg-muted/30 p-2 rounded">
                            <span className="font-medium text-primary">NTN: </span>
                            <span className="text-foreground">{company?.ntnNumber || 'N/A'}</span>
                        </div>
                        <div className="border border-border bg-muted/30 p-2 rounded text-right">
                            <span className="font-medium text-primary">Sales Tax Registration #: </span>
                            <span className="text-foreground">{company?.strnNumber || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="border border-border p-2 text-sm rounded bg-accent/30">
                            <div><span className="font-medium text-primary">Serial No: </span><span className="text-foreground">{invoice.serialNumber}</span></div>
                        </div>
                        <div className="border border-border p-2 text-sm text-right rounded bg-accent/30">
                            <div><span className="font-medium text-primary">Date: </span><span className="text-foreground">{formatDate(invoice.issueDate, language)}</span></div>
                        </div>
                    </div>

                    {/* Buyer Details */}
                    <div className="border border-border p-3 mb-4 text-sm rounded-lg bg-muted/20">
                        <div className="grid grid-cols-2 gap-2">
                            <div><span className="font-medium text-primary">Buyer's Name: </span><span className="text-foreground">{invoice.buyerName}</span></div>
                            <div><span className="font-medium text-primary">NTN #: </span><span className="text-foreground">{invoice.buyerNtn || 'N/A'}</span></div>
                            <div><span className="font-medium text-primary">Address: </span><span className="text-foreground">{invoice.buyerAddress || 'N/A'}</span></div>
                            <div><span className="font-medium text-primary">Sales Tax Registration #: </span><span className="text-foreground">{invoice.buyerStrn || 'N/A'}</span></div>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <Table className="border border-border rounded-lg overflow-hidden">
                        <TableHeader>
                            <TableRow className="bg-primary/90 dark:bg-primary/80">
                                <TableHead className="border border-border/50 text-center font-bold text-primary-foreground w-12">S.No</TableHead>
                                <TableHead className="border border-border/50 font-bold text-primary-foreground">Description of Goods</TableHead>
                                <TableHead className="border border-border/50 text-center font-bold text-primary-foreground w-16">Qty</TableHead>
                                <TableHead className="border border-border/50 text-center font-bold text-primary-foreground w-24">Rate</TableHead>
                                <TableHead className="border border-border/50 text-center font-bold text-primary-foreground w-28">Value Excl. Tax</TableHead>
                                <TableHead className="border border-border/50 text-center font-bold text-primary-foreground w-16">Tax Rate</TableHead>
                                <TableHead className="border border-border/50 text-center font-bold text-primary-foreground w-28">Tax Payable</TableHead>
                                <TableHead className="border border-border/50 text-center font-bold text-primary-foreground w-28">Value Incl. Tax</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoice.lineItems?.map((line) => (
                                <TableRow key={line.id} className="hover:bg-muted/50">
                                    <TableCell className="border border-border text-center text-foreground">{line.serialNo}</TableCell>
                                    <TableCell className="border border-border text-foreground">{line.description}</TableCell>
                                    <TableCell className="border border-border text-center text-foreground">{line.quantity}</TableCell>
                                    <TableCell className="border border-border text-right text-foreground">{formatCurrency(line.rate, language)}</TableCell>
                                    <TableCell className="border border-border text-right text-foreground">{formatCurrency(line.valueExclTax, language)}</TableCell>
                                    <TableCell className="border border-border text-center text-orange-600 dark:text-orange-400">{line.taxRate}%</TableCell>
                                    <TableCell className="border border-border text-right text-orange-600 dark:text-orange-400 font-medium">{formatCurrency(line.taxPayable, language)}</TableCell>
                                    <TableCell className="border border-border text-right font-bold text-primary">{formatCurrency(line.valueInclTax, language)}</TableCell>
                                </TableRow>
                            ))}
                            {/* Empty rows for typical invoice appearance */}
                            {invoice.lineItems?.length < 5 && Array.from({ length: 5 - invoice.lineItems.length }).map((_, i) => (
                                <TableRow key={`empty-${i}`}>
                                    <TableCell className="border border-border h-8 text-muted-foreground">&nbsp;</TableCell>
                                    <TableCell className="border border-border text-muted-foreground">&nbsp;</TableCell>
                                    <TableCell className="border border-border text-muted-foreground">&nbsp;</TableCell>
                                    <TableCell className="border border-border text-muted-foreground">&nbsp;</TableCell>
                                    <TableCell className="border border-border text-muted-foreground">&nbsp;</TableCell>
                                    <TableCell className="border border-border text-muted-foreground">&nbsp;</TableCell>
                                    <TableCell className="border border-border text-muted-foreground">&nbsp;</TableCell>
                                    <TableCell className="border border-border text-muted-foreground">&nbsp;</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="bg-primary/10 dark:bg-primary/20">
                                <TableCell className="border border-border font-bold text-foreground" colSpan={4}>Total</TableCell>
                                <TableCell className="border border-border text-right font-bold text-foreground">{formatCurrency(invoice.totalExclTax, language)}</TableCell>
                                <TableCell className="border border-border"></TableCell>
                                <TableCell className="border border-border text-right font-bold text-orange-600 dark:text-orange-400">{formatCurrency(invoice.totalTax, language)}</TableCell>
                                <TableCell className="border border-border text-right font-bold text-lg text-primary">{formatCurrency(invoice.total, language)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>

                    {/* Signature */}
                    <div className="flex justify-end mt-16 pt-8">
                        <div className="text-center">
                            <div className="border-t-2 border-foreground w-48 mb-2"></div>
                            <span className="text-sm text-muted-foreground">Authorized Signature</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function TaxInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);

    return (
        <I18nProvider>
            <AppLayout>
                <TaxInvoiceDetailContent id={resolvedParams.id} />
            </AppLayout>
        </I18nProvider>
    );
}
