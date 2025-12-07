import { db } from '@/db';
import { quotations } from '@/db/schema';

async function main() {
    const sampleQuotations = [
        {
            companyId: 1,
            clientId: 1,
            quotationNumber: 'QT-2024-001',
            issueDate: '2024-01-10',
            validUntil: '2024-01-25',
            status: 'converted',
            subtotal: 370000,
            taxAmount: 62900,
            discountAmount: 0,
            total: 432900,
            currency: 'PKR',
            notes: 'Quotation for Dell laptops and HP printer',
            terms: 'Valid for 15 days. Payment due within 30 days of acceptance.',
            convertedInvoiceId: 1,
            createdBy: null,
            createdAt: new Date('2024-01-10').toISOString(),
        },
        {
            companyId: 1,
            clientId: 3,
            quotationNumber: 'QT-2024-002',
            issueDate: '2024-02-05',
            validUntil: '2024-02-20',
            status: 'sent',
            subtotal: 90000,
            taxAmount: 15300,
            discountAmount: 0,
            total: 105300,
            currency: 'PKR',
            notes: 'Quotation for monitors',
            terms: 'Valid for 15 days. Payment due within 30 days of acceptance.',
            convertedInvoiceId: null,
            createdBy: null,
            createdAt: new Date('2024-02-05').toISOString(),
        },
    ];

    await db.insert(quotations).values(sampleQuotations);
    
    console.log('✅ Quotations seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});