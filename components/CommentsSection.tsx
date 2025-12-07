'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'

interface Comment {
    id: string
    user_name: string
    user_email: string
    avatar_url: string | null
    content: string
    created_at: string
}

export default function CommentsSection({ slug }: { slug: string }) {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [enabled, setEnabled] = useState(false)

    useEffect(() => {
        // Check Feature Flag
        const isEnabled = process.env.NEXT_PUBLIC_ENABLE_COMMENTS === 'true'
        setEnabled(isEnabled)

        if (!isEnabled) return

        // Check Auth
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
        })

        // Fetch Comments
        fetchComments()
    }, [slug])

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/comments?slug=${slug}`)
            if (res.ok) {
                const data = await res.json()
                setComments(data)
            }
        } catch (error) {
            console.error('Failed to fetch comments', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim() || !user) return

        setSubmitting(true)
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, content: newComment })
            })

            if (res.ok) {
                setNewComment('')
                fetchComments() // Refresh list
            } else {
                alert('Failed to post comment')
            }
        } catch (error) {
            console.error(error)
            alert('Error posting comment')
        } finally {
            setSubmitting(false)
        }
    }

    if (!enabled) return null

    return (
        <section className="mt-16 border-t border-[var(--border-light)] pt-10">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Discussion</h2>

            {/* Comment List */}
            <div className="space-y-6 mb-10">
                {loading ? (
                    <p className="text-[var(--text-secondary)]">Loading comments...</p>
                ) : comments.length === 0 ? (
                    <p className="text-[var(--text-secondary)] italic">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                            <img
                                src={comment.avatar_url || `https://ui-avatars.com/api/?name=${comment.user_name || 'User'}`}
                                alt={comment.user_name}
                                className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-[var(--text-primary)]">{comment.user_name}</span>
                                    <span className="text-xs text-[var(--text-secondary)]">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-[var(--text-secondary)] text-sm whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Comment Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border-light)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Leave a comment</h3>
                    <div className="flex gap-4">
                        <img
                            src={user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`}
                            alt="Me"
                            className="w-10 h-10 rounded-full hidden sm:block"
                        />
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Share your thoughts..."
                                className="w-full bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-md p-3 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none min-h-[100px]"
                                required
                            />
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-[var(--primary)] text-white px-6 py-2 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {submitting ? 'Posting...' : 'Post Comment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border-light)] text-center">
                    <p className="text-[var(--text-secondary)] mb-4">Please sign in to join the discussion.</p>
                    <a
                        href="/auth/login"
                        className="inline-block border border-[var(--text-primary)] text-[var(--text-primary)] px-6 py-2 rounded-md hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors"
                    >
                        Sign In
                    </a>
                </div>
            )}
        </section>
    )
}
