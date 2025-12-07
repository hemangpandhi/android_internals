import { promises as fs } from 'fs'
import path from 'path'
import Link from 'next/link'
import matter from 'gray-matter'
import { ArrowRightIcon, BookOpenIcon, ClockIcon } from 'lucide-react'

// Helper to strip HTML tags for descriptions from legacy files
function stripHtml(html: string) {
    return html.replace(/<[^>]*>?/gm, '');
}

async function getArticles() {
    const articlesDirectory = path.join(process.cwd(), 'content/articles')
    try {
        const filenames = await fs.readdir(articlesDirectory)

        // Map to store unique articles by slug, prioritizing MD
        const articleMap = new Map();

        await Promise.all(filenames.map(async (filename) => {
            const filePath = path.join(articlesDirectory, filename)
            // Skip directories or non-content files
            if (!filename.endsWith('.md') && !filename.endsWith('.html')) return;

            const slug = filename.replace(/\.(md|html)$/, '')
            const isMd = filename.endsWith('.md')

            // If we already have an MD version, skip HTML
            if (articleMap.has(slug) && articleMap.get(slug).type === 'md') return;

            const fileContent = await fs.readFile(filePath, 'utf-8')
            let articleData = {
                slug,
                title: slug.replace(/-/g, ' '),
                description: '',
                date: '2025-01-01',
                type: isMd ? 'md' : 'html',
                readTime: '5 min read'
            }

            if (isMd) {
                const { data } = matter(fileContent)
                articleData.title = data.title || articleData.title
                articleData.description = data.description || ''
                articleData.date = data.date ? new Date(data.date).toISOString().split('T')[0] : '2025-01-01'
            } else {
                // Legacy HTML Parsing (Regex for speed)
                const titleMatch = fileContent.match(/<title>(.*?)<\/title>/)
                if (titleMatch) articleData.title = titleMatch[1].replace(' - Android Internals', '')

                const descMatch = fileContent.match(/<meta name="description" content="(.*?)">/)
                if (descMatch) articleData.description = descMatch[1]

                // Try to find date in legacy HTML
                const dateMatch = fileContent.match(/class="article-date">(.*?)<\/span>/)
                if (dateMatch) articleData.date = dateMatch[1]
            }

            // Always update map (HTML will be overwritten by MD if processed later, handled by check above)
            // But to be safe against async order, we only write if not exists OR if new is MD
            const existing = articleMap.get(slug);
            if (!existing || (isMd && existing.type === 'html')) {
                articleMap.set(slug, articleData)
            }
        }))

        // Convert map to array and sort by date
        return Array.from(articleMap.values()).sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime()
        })

    } catch (e) {
        console.error("Failed to load articles", e)
        return []
    }
}

export default async function ArticlesIndexPage() {
    const articles = await getArticles()

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] pt-32 pb-20">
            <div className="container mx-auto px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Professional Header */}
                    <div className="mb-16 text-center">
                        <span className="inline-block py-1 px-3 rounded-full bg-[rgba(61,220,132,0.1)] text-[#3ddc84] text-sm font-semibold mb-4 border border-[rgba(61,220,132,0.2)]">
                            Knowledge Base
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold text-[var(--text-primary)] mb-6 tracking-tight">
                            Engineering <span className="text-[#3ddc84]">Guides</span>
                        </h1>
                        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
                            Deep dives into Android system internal architecture, debugging techniques, and native frameworks.
                        </p>
                    </div>

                    {/* Articles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => (
                            <Link
                                key={article.slug}
                                href={`/articles/${article.slug}`}
                                className="group relative flex flex-col bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border-light)] hover:border-[#3ddc84] hover:shadow-2xl hover:shadow-[rgba(61,220,132,0.1)] transition-all duration-300"
                            >
                                <div className="p-8 flex flex-col h-full">
                                    {/* Icon / Meta */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="p-3 rounded-lg bg-[var(--bg-secondary)] text-[#3ddc84] group-hover:scale-110 transition-transform duration-300">
                                            <BookOpenIcon className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-2 py-1 rounded">
                                            {article.type.toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[#3ddc84] transition-colors leading-tight">
                                        {article.title}
                                    </h3>
                                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6 line-clamp-3">
                                        {article.description}
                                    </p>

                                    {/* Footer */}
                                    <div className="mt-auto pt-6 border-t border-[var(--border-light)] flex items-center justify-between text-sm">
                                        <div className="flex items-center text-[var(--text-secondary)]">
                                            <ClockIcon className="w-4 h-4 mr-2" />
                                            {article.date}
                                        </div>
                                        <div className="flex items-center text-[#3ddc84] font-bold group-hover:translate-x-1 transition-transform">
                                            Read <ArrowRightIcon className="w-4 h-4 ml-2" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
