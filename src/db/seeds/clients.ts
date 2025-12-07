import { db } from '@/db';
import { clients } from '@/db/schema';

async function main() {
    const sampleClients = [
        {
            companyId: 1,
            name: 'Lahore Tech Solutions',
            nameUrdu: 'لاہور ٹیک سولوشنز',
            email: 'contact@lahoretech.pk',
            phone: '+92-42-35678901',
            address: '45 Gulberg III',
            city: 'Lahore',
            ntnNumber: '1234567-8',
            contactPerson: 'Ahmed Hassan',
            balance: 0,
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            companyId: 1,
            name: 'Islamabad Trading Corporation',
            nameUrdu: 'اسلام آباد ٹریڈنگ کارپوریشن',
            email: 'sales@islamabadtrading.pk',
            phone: '+92-51-2345678',
            address: 'Blue Area, F-7',
            city: 'Islamabad',
            ntnNumber: '2345678-9',
            contactPerson: 'Sara Ali',
            balance: 0,
            createdAt: new Date('2024-01-20').toISOString(),
        },
        {
            companyId: 1,
            name: 'Peshawar Computer Center',
            nameUrdu: 'پشاور کمپیوٹر سینٹر',
            email: 'info@peshawarcenter.pk',
            phone: '+92-91-5678901',
            address: 'Saddar Road',
            city: 'Peshawar',
            ntnNumber: '3456789-0',
            contactPerson: 'Bilal Khan',
            balance: 0,
            createdAt: new Date('2024-01-25').toISOString(),
        }
    ];

    await db.insert(clients).values(sampleClients);
    
    console.log('✅ Clients seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});