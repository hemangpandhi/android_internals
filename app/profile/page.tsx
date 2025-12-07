'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { BookmarkIcon } from '@heroicons/react/24/solid'
import { useTheme } from 'next-themes'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

interface Bookmark {
    id: string
    article_slug: string
    title: string
    created_at: string
}

export default function ProfilePage() {
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const [user, setUser] = useState<User | null>(null)
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/auth/login')
                return
            }
            setUser(session.user)

            // Fetch bookmarks
            const { data } = await supabase
                .from('bookmarks')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })

            if (data) {
                setBookmarks(data)
            }

            setLoading(false)
        }
        checkUser()
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-[var(--bg-primary)] pt-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="md:flex md:items-center md:justify-between md:space-x-5 border-b border-[var(--border-light)] pb-8">
                    <div className="flex items-start space-x-5">
                        <div className="flex-shrink-0">
                            <div className="relative">
                                <img
                                    className="h-16 w-16 rounded-full"
                                    src={user?.user_metadata.avatar_url || "https://ui-avatars.com/api/?name=" + (user?.email || "User")}
                                    alt=""
                                />
                                <span className="absolute inset-0 shadow-inner rounded-full" aria-hidden="true" />
                            </div>
                        </div>
                        <div className="pt-1.5">
                            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">My Profile</h1>
                            <p className="text-sm font-medium text-[var(--text-secondary)]">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Account Details Card */}
                    <div className="rounded-lg bg-[var(--bg-card)] shadow border border-[var(--border-light)]">
                        <div className="px-6 py-5">
                            <h3 className="text-lg font-medium leading-6 text-[var(--text-primary)]">Account Details</h3>
                            <div className="mt-4 space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)]">Email Provider</label>
                                    <p className="text-[var(--text-primary)]">{user?.app_metadata.provider || 'Email'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)]">User ID</label>
                                    <p className="text-xs font-mono text-[var(--text-secondary)]">{user?.id}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)]">Last Sign In</label>
                                    <p className="text-sm text-[var(--text-primary)]">
                                        {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preferences Card */}
                    <div className="rounded-lg bg-[var(--bg-card)] shadow border border-[var(--border-light)]">
                        <div className="px-6 py-5">
                            <h3 className="text-lg font-medium leading-6 text-[var(--text-primary)] mb-4">App Preferences</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-[var(--text-primary)]">Theme</span>
                                    <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] rounded-lg p-1">
                                        <button
                                            onClick={() => setTheme('light')}
                                            className={`p-1.5 rounded-md transition-colors ${theme === 'light' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                        >
                                            <SunIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setTheme('dark')}
                                            className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                        >
                                            <MoonIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Saved Articles */}
                    <div className="sm:col-span-2 rounded-lg bg-[var(--bg-card)] shadow border border-[var(--border-light)]">
                        <div className="px-6 py-5">
                            <h3 className="text-lg font-medium leading-6 text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                <BookmarkIcon className="w-5 h-5 text-[#3ddc84]" />
                                Saved Articles
                            </h3>

                            {bookmarks.length === 0 ? (
                                <p className="text-sm text-[var(--text-secondary)]">You haven't saved any articles yet.</p>
                            ) : (
                                <div className="divide-y divide-[var(--border-light)]">
                                    {bookmarks.map((bookmark) => (
                                        <div key={bookmark.id} className="py-3 flex items-center justify-between">
                                            <Link
                                                href={`/articles/${bookmark.article_slug}`}
                                                className="text-sm font-medium text-[var(--text-primary)] hover:text-[#3ddc84] transition-colors"
                                            >
                                                {bookmark.title || bookmark.article_slug}
                                            </Link>
                                            <span className="text-xs text-[var(--text-secondary)]">
                                                {new Date(bookmark.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
