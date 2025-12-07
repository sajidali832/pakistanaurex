import { db } from '@/db';
import { invoices } from '@/db/schema';

async function main() {
    const sampleInvoices = [
        {
            companyId: 1,
            clientId: 1,
            invoiceNumber: 'INV-2024-001',
            issueDate: '2024-01-15',
            dueDate: '2024-02-15',
            status: 'paid',
            subtotal: 370000,
            taxAmount: 62900,
            discountAmount: 0,
            total: 432900,
            amountPaid: 432900,
            currency: 'PKR',
            notes: 'Thank you for your business',
            terms: 'Payment due within 30 days',
            createdBy: null,
            createdAt: new Date('2024-01-15T09:00:00Z').toISOString(),
            updatedAt: new Date('2024-01-15T09:00:00Z').toISOString(),
        },
        {
            companyId: 1,
            clientId: 2,
            invoiceNumber: 'INV-2024-002',
            issueDate: '2024-02-01',
            dueDate: '2024-03-01',
            status: 'sent',
            subtotal: 320000,
            taxAmount: 54400,
            discountAmount: 10000,
            total: 364400,
            amountPaid: 0,
            currency: 'PKR',
            notes: 'Special discount applied',
            terms: 'Payment due within 30 days',
            createdBy: null,
            createdAt: new Date('2024-02-01T10:30:00Z').toISOString(),
            updatedAt: new Date('2024-02-01T10:30:00Z').toISOString(),
        },
        {
            companyId: 1,
            clientId: 3,
            invoiceNumber: 'INV-2024-003',
            issueDate: '2024-02-10',
            dueDate: '2024-03-10',
            status: 'draft',
            subtotal: 175000,
            taxAmount: 29750,
            discountAmount: 0,
            total: 204750,
            amountPaid: 0,
            currency: 'PKR',
            notes: null,
            terms: 'Payment due within 30 days',
            createdBy: null,
            createdAt: new Date('2024-02-10T14:15:00Z').toISOString(),
            updatedAt: new Date('2024-02-10T14:15:00Z').toISOString(),
        },
    ];

    await db.insert(invoices).values(sampleInvoices);
    
    console.log('✅ Invoices seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});