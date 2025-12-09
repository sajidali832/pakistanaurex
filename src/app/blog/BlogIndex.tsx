"use client";

import { useState } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/blogData';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';

export function BlogIndex({ posts }: { posts: BlogPost[] }) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', ...Array.from(new Set(posts.map(p => p.category)))];

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h1 className="text-4xl font-bold tracking-tight mb-4">
                    Resources for <span className="text-primary">Growing Businesses</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                    Expert advice, guides, and tips for Pakistani entrepreneurs and small business owners.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
                <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
                    {categories.map(category => (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? "default" : "outline"}
                            onClick={() => setSelectedCategory(category)}
                            className="whitespace-nowrap rounded-full"
                        >
                            {category}
                        </Button>
                    ))}
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search articles..."
                        className="pl-10 rounded-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                            <Card className="h-full flex flex-col overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                                {/* Fallback pattern / Image placeholder */}
                                <div className="h-48 bg-gradient-to-br from-primary/5 to-secondary/20 relative overflow-hidden flex items-center justify-center">
                                    <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05]" style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }} />
                                    <span className="bg-background/80 backdrop-blur text-xs font-semibold px-3 py-1 rounded-full border shadow-sm z-10">
                                        {post.category}
                                    </span>
                                </div>

                                <CardContent className="flex-1 p-6">
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {post.date}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {post.readTime}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                </CardContent>
                                <CardFooter className="p-6 pt-0 mt-auto">
                                    <div className="text-sm font-medium text-primary flex items-center gap-2 group-hover:gap-3 transition-all">
                                        Read Article <ArrowRight className="h-4 w-4" />
                                    </div>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-lg text-muted-foreground">No articles found matching your criteria.</p>
                    <Button variant="link" onClick={() => { setSearch(''); setSelectedCategory('All') }}>
                        Clear filters
                    </Button>
                </div>
            )}
        </div>
    );
}
