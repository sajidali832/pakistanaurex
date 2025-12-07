import { db } from '@/db';
import { items } from '@/db/schema';

async function main() {
    const sampleItems = [
        {
            companyId: 1,
            name: 'Dell Latitude 5420 Laptop',
            nameUrdu: 'ڈیل لیپ ٹاپ',
            description: '14-inch FHD Display, Intel Core i5-11th Gen, 8GB RAM, 256GB SSD',
            unitPrice: 185000,
            unit: 'piece',
            taxRate: 17,
            isService: false,
            sku: 'DELL-LAT-5420',
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            companyId: 1,
            name: 'HP LaserJet Pro MFP M428fdw',
            nameUrdu: 'ایچ پی پرنٹر',
            description: 'Monochrome All-in-One Printer, Print/Scan/Copy/Fax, WiFi',
            unitPrice: 125000,
            unit: 'piece',
            taxRate: 17,
            isService: false,
            sku: 'HP-LJ-M428',
            createdAt: new Date('2024-01-16').toISOString(),
        },
        {
            companyId: 1,
            name: 'Samsung 27-inch Curved Monitor',
            nameUrdu: 'سام سنگ مانیٹر',
            description: 'Full HD 1920x1080, 75Hz, Curved Display',
            unitPrice: 45000,
            unit: 'piece',
            taxRate: 17,
            isService: false,
            sku: 'SAM-MON-27C',
            createdAt: new Date('2024-01-17').toISOString(),
        },
        {
            companyId: 1,
            name: 'Cisco Catalyst 2960-X Switch',
            nameUrdu: 'نیٹ ورک سوئچ',
            description: '24-Port Gigabit Ethernet Switch',
            unitPrice: 320000,
            unit: 'piece',
            taxRate: 17,
            isService: false,
            sku: 'CISCO-2960X',
            createdAt: new Date('2024-01-18').toISOString(),
        },
        {
            companyId: 1,
            name: 'Network Installation & Configuration',
            nameUrdu: 'نیٹ ورک انسٹالیشن',
            description: 'Professional network setup and configuration services',
            unitPrice: 50000,
            unit: 'service',
            taxRate: 17,
            isService: true,
            sku: 'SVC-NET-INST',
            createdAt: new Date('2024-01-19').toISOString(),
        }
    ];

    await db.insert(items).values(sampleItems);
    
    console.log('✅ Items seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});