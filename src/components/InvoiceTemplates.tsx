"use client";

import React from 'react';
import { formatCurrency, formatDate, Language } from '@/lib/i18n';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Invoice {
  id: number;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  amountPaid: number;
  notes: string;
  terms: string;
}

interface InvoiceLine {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
}

interface Client {
  id: number;
  name: string;
  nameUrdu: string | null;
  email: string;
  phone: string;
  address: string;
  city: string;
  ntnNumber: string;
}

interface Company {
  id: number;
  name: string;
  nameUrdu: string | null;
  email: string;
  phone: string;
  address: string;
  city: string;
  ntnNumber: string;
  strnNumber: string;
  bankName: string;
  bankAccountNumber: string;
  bankIban: string;
}

interface InvoiceTemplateProps {
  invoice: Invoice;
  lines: InvoiceLine[];
  client: Client;
  company: Company;
  language: Language;
}

// Template 1: Classic Professional
export function ClassicTemplate({ invoice, lines, client, company, language }: InvoiceTemplateProps) {
  return (
    <div className="bg-white text-black p-8 min-h-[297mm] print:p-0">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-gray-900">
            {language === 'ur' && company?.nameUrdu ? company.nameUrdu : company?.name}
          </h1>
          <p className="text-gray-600">{company?.address}</p>
          <p className="text-gray-600">{company?.city}</p>
          <p className="text-gray-600">{company?.phone}</p>
          <p className="text-gray-600">{company?.email}</p>
          {company?.ntnNumber && <p className="text-sm text-gray-600">NTN: {company.ntnNumber}</p>}
          {company?.strnNumber && <p className="text-sm text-gray-600">STRN: {company.strnNumber}</p>}
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-blue-600 mb-2">INVOICE</h2>
          <p className="font-medium text-lg">{invoice.invoiceNumber}</p>
          <p className="text-sm text-gray-600 mt-2">Issue Date: {formatDate(invoice.issueDate, language)}</p>
          {invoice.dueDate && (
            <p className="text-sm text-gray-600">Due Date: {formatDate(invoice.dueDate, language)}</p>
          )}
        </div>
      </div>

      <Separator className="mb-8 bg-blue-600 h-1" />

      {/* Client Info */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-sm text-gray-500 mb-2">BILL TO</h3>
        <p className="font-medium text-lg">
          {language === 'ur' && client?.nameUrdu ? client.nameUrdu : client?.name}
        </p>
        <p className="text-gray-600">{client?.address}</p>
        <p className="text-gray-600">{client?.city}</p>
        <p className="text-gray-600">{client?.phone}</p>
        {client?.ntnNumber && <p className="text-sm text-gray-600">NTN: {client.ntnNumber}</p>}
      </div>

      {/* Line Items */}
      <Table className="mb-8">
        <TableHeader>
          <TableRow className="bg-blue-600 text-white">
            <TableHead className="text-white w-12">#</TableHead>
            <TableHead className="text-white">Description</TableHead>
            <TableHead className="text-white text-right">Qty</TableHead>
            <TableHead className="text-white text-right">Rate</TableHead>
            <TableHead className="text-white text-right">Tax</TableHead>
            <TableHead className="text-white text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((line, index) => (
            <TableRow key={line.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{line.description}</TableCell>
              <TableCell className="text-right">{line.quantity}</TableCell>
              <TableCell className="text-right">{formatCurrency(line.unitPrice, language)}</TableCell>
              <TableCell className="text-right">{line.taxRate}%</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(line.lineTotal, language)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-72 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatCurrency(invoice.subtotal, language)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span>{formatCurrency(invoice.taxAmount, language)}</span>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Discount</span>
              <span>-{formatCurrency(invoice.discountAmount, language)}</span>
            </div>
          )}
          <Separator className="bg-blue-600" />
          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span className="text-blue-600">{formatCurrency(invoice.total, language)}</span>
          </div>
          {invoice.amountPaid > 0 && (
            <>
              <div className="flex justify-between text-green-600">
                <span>Paid</span>
                <span>{formatCurrency(invoice.amountPaid, language)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Balance Due</span>
                <span>{formatCurrency(invoice.total - invoice.amountPaid, language)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bank Details */}
      {company && (company.bankName || company.bankAccountNumber) && (
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">Bank Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {company.bankName && (
              <div>
                <span className="text-gray-500">Bank: </span>
                <span>{company.bankName}</span>
              </div>
            )}
            {company.bankAccountNumber && (
              <div>
                <span className="text-gray-500">Account: </span>
                <span>{company.bankAccountNumber}</span>
              </div>
            )}
            {company.bankIban && (
              <div className="col-span-2">
                <span className="text-gray-500">IBAN: </span>
                <span>{company.bankIban}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes & Terms */}
      {(invoice.notes || invoice.terms) && (
        <div className="grid grid-cols-2 gap-8 text-sm">
          {invoice.notes && (
            <div>
              <h3 className="font-semibold mb-1">Notes</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <h3 className="font-semibold mb-1">Terms & Conditions</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{invoice.terms}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-400">
        Thank you for your business!
      </div>
    </div>
  );
}

// Template 2: Modern Minimal
export function ModernTemplate({ invoice, lines, client, company, language }: InvoiceTemplateProps) {
  return (
    <div className="bg-white text-black p-8 min-h-[297mm] print:p-0">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-light tracking-tight mb-4 text-gray-900">
            {language === 'ur' && company?.nameUrdu ? company.nameUrdu : company?.name}
          </h1>
          <div className="text-sm text-gray-500 space-y-0.5">
            <p>{company?.address}, {company?.city}</p>
            <p>{company?.phone} • {company?.email}</p>
            {company?.ntnNumber && <p>NTN: {company.ntnNumber}</p>}
          </div>
        </div>
        <div className="text-right">
          <div className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg mb-4">
            <p className="text-xs uppercase tracking-wider">Invoice</p>
            <p className="text-xl font-bold">{invoice.invoiceNumber}</p>
          </div>
          <div className="text-sm text-gray-500">
            <p>Issued: {formatDate(invoice.issueDate, language)}</p>
            {invoice.dueDate && <p>Due: {formatDate(invoice.dueDate, language)}</p>}
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-10">
        <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Billed To</p>
        <p className="text-xl font-medium">
          {language === 'ur' && client?.nameUrdu ? client.nameUrdu : client?.name}
        </p>
        <p className="text-gray-500">{client?.address}</p>
        <p className="text-gray-500">{client?.city}</p>
        {client?.ntnNumber && <p className="text-sm text-gray-500">NTN: {client.ntnNumber}</p>}
      </div>

      {/* Line Items */}
      <div className="mb-10">
        <div className="border-b-2 border-gray-900 pb-2 mb-4 grid grid-cols-12 text-xs uppercase tracking-wider text-gray-500">
          <div className="col-span-6">Item</div>
          <div className="col-span-2 text-right">Qty</div>
          <div className="col-span-2 text-right">Rate</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>
        {lines.map((line) => (
          <div key={line.id} className="grid grid-cols-12 py-3 border-b border-gray-100">
            <div className="col-span-6">
              <p className="font-medium">{line.description}</p>
              <p className="text-xs text-gray-400">Tax: {line.taxRate}%</p>
            </div>
            <div className="col-span-2 text-right text-gray-600">{line.quantity}</div>
            <div className="col-span-2 text-right text-gray-600">{formatCurrency(line.unitPrice, language)}</div>
            <div className="col-span-2 text-right font-medium">{formatCurrency(line.lineTotal, language)}</div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-10">
        <div className="w-64">
          <div className="flex justify-between py-2 text-gray-500">
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.subtotal, language)}</span>
          </div>
          <div className="flex justify-between py-2 text-gray-500">
            <span>Tax</span>
            <span>{formatCurrency(invoice.taxAmount, language)}</span>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between py-2 text-gray-500">
              <span>Discount</span>
              <span>-{formatCurrency(invoice.discountAmount, language)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 border-t-2 border-gray-900 text-xl font-bold">
            <span>Total</span>
            <span>{formatCurrency(invoice.total, language)}</span>
          </div>
        </div>
      </div>

      {/* Bank Details */}
      {company && (company.bankName || company.bankAccountNumber) && (
        <div className="border-l-4 border-gray-900 pl-4 mb-8">
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Payment Details</p>
          <p className="text-sm">{company.bankName} • {company.bankAccountNumber}</p>
          {company.bankIban && <p className="text-sm text-gray-500">IBAN: {company.bankIban}</p>}
        </div>
      )}

      {/* Notes & Terms */}
      {(invoice.notes || invoice.terms) && (
        <div className="grid grid-cols-2 gap-8 text-sm text-gray-500">
          {invoice.notes && (
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Notes</p>
              <p className="whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Terms</p>
              <p className="whitespace-pre-wrap">{invoice.terms}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Template 3: Bold Colorful
export function BoldTemplate({ invoice, lines, client, company, language }: InvoiceTemplateProps) {
  return (
    <div className="bg-white text-black p-8 min-h-[297mm] print:p-0">
      {/* Colored Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-xl mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {language === 'ur' && company?.nameUrdu ? company.nameUrdu : company?.name}
            </h1>
            <div className="text-emerald-100 text-sm">
              <p>{company?.address}, {company?.city}</p>
              <p>{company?.phone} • {company?.email}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-emerald-100 text-sm">Invoice Number</p>
            <p className="text-2xl font-bold">{invoice.invoiceNumber}</p>
          </div>
        </div>
      </div>

      {/* Invoice Info Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500 uppercase">Issue Date</p>
          <p className="font-semibold">{formatDate(invoice.issueDate, language)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500 uppercase">Due Date</p>
          <p className="font-semibold">{invoice.dueDate ? formatDate(invoice.dueDate, language) : 'N/A'}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-lg">
          <p className="text-xs text-emerald-600 uppercase">Amount Due</p>
          <p className="font-bold text-lg text-emerald-600">{formatCurrency(invoice.total - invoice.amountPaid, language)}</p>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-6 bg-emerald-600 rounded-full"></div>
          <p className="font-semibold text-gray-700">Bill To</p>
        </div>
        <div className="ml-3">
          <p className="text-xl font-semibold">
            {language === 'ur' && client?.nameUrdu ? client.nameUrdu : client?.name}
          </p>
          <p className="text-gray-500">{client?.address}, {client?.city}</p>
          {client?.ntnNumber && <p className="text-sm text-gray-500">NTN: {client.ntnNumber}</p>}
        </div>
      </div>

      {/* Line Items */}
      <div className="mb-8">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="rounded-l-lg">Description</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Tax</TableHead>
              <TableHead className="text-right rounded-r-lg">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line) => (
              <TableRow key={line.id}>
                <TableCell className="font-medium">{line.description}</TableCell>
                <TableCell className="text-center">{line.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(line.unitPrice, language)}</TableCell>
                <TableCell className="text-right">{line.taxRate}%</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(line.lineTotal, language)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-72 bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatCurrency(invoice.subtotal, language)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Tax</span>
            <span>{formatCurrency(invoice.taxAmount, language)}</span>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Discount</span>
              <span className="text-red-500">-{formatCurrency(invoice.discountAmount, language)}</span>
            </div>
          )}
          <Separator className="my-2" />
          <div className="flex justify-between py-2 text-xl font-bold">
            <span>Total</span>
            <span className="text-emerald-600">{formatCurrency(invoice.total, language)}</span>
          </div>
          {invoice.amountPaid > 0 && (
            <div className="flex justify-between py-1 text-sm text-green-600">
              <span>Paid</span>
              <span>{formatCurrency(invoice.amountPaid, language)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bank Details */}
      {company && (company.bankName || company.bankAccountNumber) && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl mb-6">
          <p className="font-semibold text-emerald-700 mb-2">💳 Payment Information</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {company.bankName && <p><span className="text-gray-500">Bank:</span> {company.bankName}</p>}
            {company.bankAccountNumber && <p><span className="text-gray-500">Account:</span> {company.bankAccountNumber}</p>}
            {company.bankIban && <p className="col-span-2"><span className="text-gray-500">IBAN:</span> {company.bankIban}</p>}
          </div>
        </div>
      )}

      {/* Notes & Terms */}
      {(invoice.notes || invoice.terms) && (
        <div className="grid grid-cols-2 gap-6 text-sm">
          {invoice.notes && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold mb-1">📝 Notes</p>
              <p className="text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold mb-1">📋 Terms & Conditions</p>
              <p className="text-gray-600 whitespace-pre-wrap">{invoice.terms}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const invoiceTemplates = [
  { id: 'classic', name: 'Classic Professional', component: ClassicTemplate },
  { id: 'modern', name: 'Modern Minimal', component: ModernTemplate },
  { id: 'bold', name: 'Bold Colorful', component: BoldTemplate },
];
