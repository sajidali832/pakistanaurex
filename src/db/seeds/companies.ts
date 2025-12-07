import { db } from '@/db';
import { companies } from '@/db/schema';

async function main() {
    const sampleCompanies = [
        {
            name: 'Karachi Electronics (Pvt) Ltd',
            nameUrdu: 'کراچی الیکٹرانکس (پرائیویٹ) لمیٹڈ',
            ntnNumber: '7654321-0',
            strnNumber: '08-00-1234-567-89',
            address: 'Plot 123, Main Shahrah-e-Faisal',
            city: 'Karachi',
            phone: '+92-21-34567890',
            email: 'info@karachielectronics.pk',
            logoUrl: null,
            bankName: 'Habib Bank Limited',
            bankAccountNumber: '0123-4567890123',
            bankIban: 'PK36HABB0000001234567890',
            defaultCurrency: 'PKR',
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(companies).values(sampleCompanies);
    
    console.log('✅ Companies seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});