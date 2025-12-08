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

            // Get tax invoice from localStorage
            const storedInvoices = localStorage.getItem('tax_invoices');
            const invoices = storedInvoices ? JSON.parse(storedInvoices) : [];
            const inv = invoices.find((i: TaxInvoice) => i.id === parseInt(id));

            const companiesRes = await fetch('/api/companies', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const companiesData = await companiesRes.json();

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
                    <div className="text-center border-b-2 border-black pb-4 mb-4">
                        <h1 className="text-xl font-bold text-blue-800">Sales Tax Invoice</h1>
                    </div>

                    {/* Company Details */}
                    <div className="text-center mb-4 bg-gray-100 p-4 rounded">
                        <h2 className="text-lg font-bold">{company?.name}</h2>
                        {company?.nameUrdu && (
                            <p className="text-base" dir="rtl">{company.nameUrdu}</p>
                        )}
                        <p className="text-sm">{company?.address}, {company?.city}</p>
                    </div>

                    {/* Registration Numbers */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="border p-2">
                            <span className="font-medium">NTN: </span>
                            <span>{company?.ntnNumber || 'N/A'}</span>
                        </div>
                        <div className="border p-2 text-right">
                            <span className="font-medium">Sales Tax Registration #: </span>
                            <span>{company?.strnNumber || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="border p-2 text-sm">
                            <div><span className="font-medium">Serial No: </span>{invoice.serialNumber}</div>
                        </div>
                        <div className="border p-2 text-sm text-right">
                            <div><span className="font-medium">Date: </span>{formatDate(invoice.issueDate, language)}</div>
                        </div>
                    </div>

                    {/* Buyer Details */}
                    <div className="border p-3 mb-4 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <div><span className="font-medium">Buyer's Name: </span>{invoice.buyerName}</div>
                            <div><span className="font-medium">NTN #: </span>{invoice.buyerNtn || 'N/A'}</div>
                            <div><span className="font-medium">Address: </span>{invoice.buyerAddress || 'N/A'}</div>
                            <div><span className="font-medium">Sales Tax Registration #: </span>{invoice.buyerStrn || 'N/A'}</div>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <Table className="border">
                        <TableHeader>
                            <TableRow className="bg-gray-200">
                                <TableHead className="border text-center font-bold text-black w-12">S.No</TableHead>
                                <TableHead className="border font-bold text-black">Description of Goods</TableHead>
                                <TableHead className="border text-center font-bold text-black w-16">Qty</TableHead>
                                <TableHead className="border text-center font-bold text-black w-24">Rate</TableHead>
                                <TableHead className="border text-center font-bold text-black w-28">Value Excl. Sales Tax</TableHead>
                                <TableHead className="border text-center font-bold text-black w-16">Rate of Sales Tax</TableHead>
                                <TableHead className="border text-center font-bold text-black w-28">Sales Tax Payable</TableHead>
                                <TableHead className="border text-center font-bold text-black w-28">Value Incl. Sales Tax</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoice.lineItems?.map((line) => (
                                <TableRow key={line.id}>
                                    <TableCell className="border text-center">{line.serialNo}</TableCell>
                                    <TableCell className="border">{line.description}</TableCell>
                                    <TableCell className="border text-center">{line.quantity}</TableCell>
                                    <TableCell className="border text-right">{formatCurrency(line.rate, language)}</TableCell>
                                    <TableCell className="border text-right">{formatCurrency(line.valueExclTax, language)}</TableCell>
                                    <TableCell className="border text-center">{line.taxRate}%</TableCell>
                                    <TableCell className="border text-right">{formatCurrency(line.taxPayable, language)}</TableCell>
                                    <TableCell className="border text-right font-medium">{formatCurrency(line.valueInclTax, language)}</TableCell>
                                </TableRow>
                            ))}
                            {/* Empty rows for typical invoice appearance */}
                            {invoice.lineItems?.length < 5 && Array.from({ length: 5 - invoice.lineItems.length }).map((_, i) => (
                                <TableRow key={`empty-${i}`}>
                                    <TableCell className="border h-8">&nbsp;</TableCell>
                                    <TableCell className="border">&nbsp;</TableCell>
                                    <TableCell className="border">&nbsp;</TableCell>
                                    <TableCell className="border">&nbsp;</TableCell>
                                    <TableCell className="border">&nbsp;</TableCell>
                                    <TableCell className="border">&nbsp;</TableCell>
                                    <TableCell className="border">&nbsp;</TableCell>
                                    <TableCell className="border">&nbsp;</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="bg-gray-100">
                                <TableCell className="border font-bold" colSpan={4}>Total</TableCell>
                                <TableCell className="border text-right font-bold">{formatCurrency(invoice.totalExclTax, language)}</TableCell>
                                <TableCell className="border"></TableCell>
                                <TableCell className="border text-right font-bold">{formatCurrency(invoice.totalTax, language)}</TableCell>
                                <TableCell className="border text-right font-bold text-lg">{formatCurrency(invoice.total, language)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>

                    {/* Signature */}
                    <div className="flex justify-end mt-16 pt-8">
                        <div className="text-center">
                            <div className="border-t border-black w-48 mb-2"></div>
                            <span className="text-sm">Authorized Signature</span>
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
