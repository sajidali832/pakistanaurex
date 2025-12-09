import { Metadata } from 'next';
import { blogPosts } from '@/lib/blogData';
import { BlogIndex } from './BlogIndex';

export const metadata: Metadata = {
    title: 'Blog - Business Tips & Guides for Pakistani SMBs',
    description: 'Expert advice on invoicing, tax compliance, and business growth for Pakistani entrepreneurs. Free templates and guides.',
    openGraph: {
        title: 'Aurex Blog - Smart Business Management',
        description: 'Simplify your business finances with our expert guides and tips.',
        type: 'website',
    }
};

export default function BlogPage() {
    return <BlogIndex posts={blogPosts} />;
}
