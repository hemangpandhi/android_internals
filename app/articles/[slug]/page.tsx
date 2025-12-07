import { promises as fs } from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import * as cheerio from 'cheerio'
import matter from 'gray-matter'
import { ArrowLeftIcon, CalendarIcon, UserIcon, ClockIcon } from 'lucide-react'
import BackToTop from '@/components/BackToTop'
import BookmarkButton from '@/components/BookmarkButton'
import Navbar from '@/components/Navbar'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import CommentsSection from '@/components/CommentsSection'

// Helper function to extract metadata and content
async function getArticle(slug: string) {
    // 1. Try to find .md file first (Priority)
    const mdPath = path.join(process.cwd(), 'content/articles', `${slug}.md`)
    try {
        const fileContent = await fs.readFile(mdPath, 'utf-8')
        const { data, content } = matter(fileContent)

        // Generate TOC from Markdown headers (simple regex)
        const toc: { id: string; text: string; level: number }[] = []
        const lines = content.split('\n')
        let inCodeBlock = false;

        lines.forEach(line => {
            if (line.trim().startsWith('```')) {
                inCodeBlock = !inCodeBlock;
            }
            if (!inCodeBlock) {
                const match = line.match(/^(#{2,3})\s+(.*)$/)
                if (match) {
                    const level = match[1].length
                    const text = match[2].trim()
                    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    toc.push({ id, text, level })
                }
            }
        })

        return {
            title: data.title || slug,
            description: data.description || '',
            date: data.date ? new Date(data.date).toISOString().split('T')[0] : '2025-01-01',
            author: data.author || 'Android Internals Team',
            readTime: '5 min read', // Could calculate from word count
            content: content,
            type: 'md',
            toc
        }

    } catch (e) {
        // 2. Fallback to .html file (Legacy)
        try {
            const htmlPath = path.join(process.cwd(), 'content/articles', `${slug}.html`)
            const fileContent = await fs.readFile(htmlPath, 'utf-8')
            const $ = cheerio.load(fileContent)

            const title = $('title').text().replace(' - Android Internals', '') || slug
            const description = $('meta[name="description"]').attr('content') || ''
            const date = $('.article-date').text() || '2025-01-01'
            const author = $('.author-name').text() || 'Android Internals Team'
            const readTime = $('.article-read-time').text() || '5 min read'

            let contentHtml = ''
            const $articleBody = $('#articleBody')
            if ($articleBody.length > 0) {
                contentHtml = $articleBody.html() || ''
            } else {
                const $main = $('main.article-content')
                contentHtml = $main.length > 0 ? $main.html() || '' : $('body').html() || ''
            }

            // Fix assets and links
            contentHtml = contentHtml.replace(/\.\.\/assets/g, '/assets')
            contentHtml = contentHtml.replace(/href="\.\/(.*?)\.html"/g, 'href="/articles/$1"')

            const toc: { id: string; text: string; level: number }[] = []
            const $content = cheerio.load(contentHtml)
            $content('h2, h3').each((_, el) => {
                const $el = $content(el)
                const text = $el.text().trim()
                let id = $el.attr('id')
                if (!id) {
                    id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    $el.attr('id', id)
                }
                toc.push({ id, text, level: parseInt(el.tagName.substring(1)) })
            })

            return { title, description, date, author, readTime, content: contentHtml, type: 'html', toc }
        } catch (err) {
            console.error(`Error reading article ${slug}:`, err)
            return null
        }
    }
}

export async function generateStaticParams() {
    const articlesDirectory = path.join(process.cwd(), 'content/articles')
    try {
        const filenames = await fs.readdir(articlesDirectory)
        // Get unique slugs from both .md and .html
        const slugs = new Set(filenames.map((name) => name.replace(/\.(md|html)$/, '')))
        return Array.from(slugs).map((slug) => ({ slug }))
    } catch {
        return []
    }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const article = await getArticle(slug)

    if (!article) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <Navbar />
            <BackToTop />

            <main className="container mx-auto px-4 py-8">
                <article className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-light)] p-8 mb-8">
                        <Link
                            href="/articles"
                            className="inline-flex items-center text-[var(--text-secondary)] hover:text-[#3ddc84] mb-8 transition-colors group"
                        >
                            <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Articles
                        </Link>

                        <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">
                            {article.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-[var(--text-secondary)]">
                            <div className="flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-[#3ddc84]" />
                                <span className="font-medium text-[var(--text-primary)]">{article.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-[#3ddc84]" />
                                <span className="text-[var(--text-secondary)]">{article.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ClockIcon className="w-5 h-5 text-[#3ddc84]" />
                                <span className="text-[var(--text-secondary)]">{article.readTime}</span>
                            </div>
                            <div className="pl-6 border-l border-[var(--border-light)]">
                                <BookmarkButton slug={slug} title={article.title} />
                            </div>
                        </div>
                    </div>

                    <div className="lg:grid lg:grid-cols-12 lg:gap-12">

                        {/* Sidebar TOC - Desktop */}
                        <aside className="hidden lg:block lg:col-span-3">
                            <div className="sticky top-32">
                                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 pl-3">Table of Contents</h2>
                                <nav className="space-y-1 border-l border-[var(--border-light)]">
                                    {article.toc.map((item) => (
                                        <a
                                            key={item.id}
                                            href={`#${item.id}`}
                                            className={`block py-1.5 transition-colors text-sm hover:text-[#3ddc84] hover:border-l hover:border-[#3ddc84] -ml-px pl-3 border-l ${item.level === 3 ? 'pl-6 text-gray-500' : 'text-gray-400'
                                                }`}
                                        >
                                            {item.text}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="lg:col-span-9">
                            {article.type === 'md' ? (
                                <MarkdownRenderer content={article.content} />
                            ) : (
                                <div
                                    className="article-content-prose"
                                    dangerouslySetInnerHTML={{ __html: article.content }}
                                />
                            )}

                            {/* Comments Section */}
                            <CommentsSection slug={slug} />
                        </div>

                    </div>
                </article>
            </main>

        </div>
    )
}
