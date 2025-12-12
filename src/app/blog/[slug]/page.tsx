import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { blogPosts } from '@/lib/blogData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, User, Clock, Share2 } from 'lucide-react';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        return {
            title: 'Post Not Found',
        };
    }

    return {
        title: `${post.title} | Aurex Blog`,
        description: post.excerpt,
        keywords: post.keywords,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.date,
            authors: [post.author],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        notFound();
    }

    // JSON-LD Structured Data for Google
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        author: {
            '@type': 'Person',
            name: post.author,
        },
        datePublished: post.date,
        dateModified: post.date,
        keywords: post.keywords.join(', '),
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="mb-8">
                <Link
                    href="/blog"
                    className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Articles
                </Link>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                    <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full font-semibold">
                        {post.category}
                    </span>
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {post.date}
                    </div>
                    <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.readTime}
                    </div>
                </div>

                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-6 leading-tight">
                    {post.title}
                </h1>

                {/* Featured Image */}
                {post.image && (
                    <div className="relative w-full h-[300px] md:h-[400px] mb-8 rounded-2xl overflow-hidden shadow-lg">
                        <img 
                            src={post.image} 
                            alt={post.title} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <p className="text-xl text-muted-foreground leading-relaxed border-l-4 border-primary/50 pl-6 italic">
                    {post.excerpt}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-12">
                <article className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content}
                    </ReactMarkdown>
                </article>

                <aside className="space-y-8 hidden lg:block">
                    <div className="sticky top-24">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-bold mb-4">Table of Contents</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Everything you need to know about {post.title.toLowerCase()}.
                                </p>
                                <div className="h-px bg-border mb-4" />
                                <div className="space-y-4">
                                    <p className="text-xs font-semibold uppercase text-muted-foreground">Share this article</p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon" className="scan-lines">
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mt-8 bg-primary text-primary-foreground border-none shadow-xl">
                            <CardContent className="p-6">
                                <h3 className="font-bold text-lg mb-2">Start Managing Your Business Today</h3>
                                <p className="text-primary-foreground/90 text-sm mb-4">
                                    Join thousands of Pakistani businesses using Aurex.
                                </p>
                                <Link href="/register">
                                    <Button variant="secondary" className="w-full font-bold">
                                        Get Started Free
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </aside>
            </div>

            {/* Mobile CTA */}
            <div className="mt-12 lg:hidden">
                <Card className="bg-primary text-primary-foreground border-none">
                    <CardContent className="p-8 text-center">
                        <h3 className="font-bold text-2xl mb-2">Ready to grow?</h3>
                        <p className="text-primary-foreground/90 mb-6">
                            Try Aurex for free and take control of your business.
                        </p>
                        <Link href="/register">
                            <Button variant="secondary" size="lg" className="w-full sm:w-auto font-bold">
                                Get Started Free
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}