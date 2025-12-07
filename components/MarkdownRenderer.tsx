'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import dynamic from 'next/dynamic'

const Mermaid = dynamic(() => import('@/components/Mermaid'), { ssr: false })

interface MarkdownRendererProps {
    content: string
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <div className="article-content-prose">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '')
                        const language = match ? match[1] : ''

                        if (!inline && language === 'mermaid') {
                            return <Mermaid chart={String(children).replace(/\n$/, '')} />
                        }

                        return !inline && match ? (
                            <div className="code-example relative group my-8">
                                <div className="code-header">
                                    <div className="code-header-left">
                                        <span className="code-language">{language}</span>
                                    </div>
                                </div>
                                <SyntaxHighlighter
                                    style={vscDarkPlus}
                                    language={language}
                                    PreTag="div"
                                    {...props}
                                    customStyle={{ margin: 0, padding: '1.5rem', background: '#1e1e1e', borderRadius: '0 0 0.5rem 0.5rem' }}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            </div>
                        ) : (
                            <code className={className ? className : "bg-[var(--bg-secondary)] text-[var(--primary)] px-1.5 py-0.5 rounded border border-[var(--border-light)]"} {...props}>
                                {children}
                            </code>
                        )
                    },
                    h1: ({ node, ...props }) => <h1 id={props.children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-')} className="text-4xl font-bold mt-12 mb-6 text-[var(--text-primary)]" {...props} />,
                    h2: ({ node, ...props }) => <h2 id={props.children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-')} className="text-3xl font-bold mt-16 mb-6 pb-4 border-b border-[var(--border-light)] text-[var(--text-primary)]" {...props} />,
                    h3: ({ node, ...props }) => <h3 id={props.children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-')} className="text-2xl font-bold mt-10 mb-4 text-[var(--primary)]" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-6 leading-loose text-lg text-[var(--text-secondary)]" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-6 space-y-2 text-[var(--text-secondary)] marker:text-[#3ddc84]" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-[var(--text-secondary)] marker:text-[#3ddc84]" {...props} />,
                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-[#3ddc84] bg-[var(--bg-secondary)] py-4 px-6 my-8 rounded-r-lg italic text-[var(--text-secondary)]" {...props} />,
                    a: ({ node, ...props }) => <a className="text-[#3ddc84] hover:underline font-medium" {...props} />,
                    img: ({ node, ...props }) => (
                        <div className="my-8">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img className="rounded-xl border border-[var(--border-light)] shadow-2xl w-full" {...props} alt={props.alt || ''} />
                        </div>
                    ),
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-10 border border-[var(--border-light)] rounded-lg">
                            <table className="min-w-full divide-y divide-[var(--border-light)]" {...props} />
                        </div>
                    ),
                    th: ({ node, ...props }) => <th className="bg-[var(--bg-secondary)] px-6 py-4 text-left text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider" {...props} />,
                    td: ({ node, ...props }) => <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)] border-t border-[var(--border-light)]" {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
