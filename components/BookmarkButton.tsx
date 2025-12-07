'use client'

import { useState, useEffect } from 'react'
import { BookmarkIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

interface BookmarkButtonProps {
    slug: string
    title: string
}

export default function BookmarkButton({ slug, title }: BookmarkButtonProps) {
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const router = useRouter()

    useEffect(() => {
        checkBookmarkStatus()
    }, [slug])

    const checkBookmarkStatus = async () => {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            setIsAuthenticated(false)
            setLoading(false)
            return
        }

        setIsAuthenticated(true)

        try {
            const { data, error } = await supabase
                .from('bookmarks')
                .select('id')
                .eq('user_id', session.user.id)
                .eq('article_slug', slug)
                .single()

            if (data && !error) {
                setIsBookmarked(true)
            }
        } catch (error) {
            console.error('Error checking bookmark:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleBookmark = async () => {
        if (!isAuthenticated) {
            // Redirect to login or show modal
            if (confirm('Please sign in to bookmark articles.')) {
                router.push('/auth/login')
            }
            return
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const newStatus = !isBookmarked
        setIsBookmarked(newStatus) // Optimistic update

        try {
            if (newStatus) {
                // Add bookmark
                const { error } = await supabase
                    .from('bookmarks')
                    .insert([
                        { user_id: session.user.id, article_slug: slug, title: title }
                    ])
                if (error) throw error
            } else {
                // Remove bookmark
                const { error } = await supabase
                    .from('bookmarks')
                    .delete()
                    .eq('user_id', session.user.id)
                    .eq('article_slug', slug)
                if (error) throw error
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error)
            setIsBookmarked(!newStatus) // Revert on error
            alert('Failed to update bookmark. Please try again.')
        }
    }

    if (loading) {
        return <div className="w-5 h-5 animate-pulse bg-gray-700 rounded-full" />
    }

    return (
        <button
            onClick={toggleBookmark}
            className="group flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-[#3ddc84] transition-colors"
            title={isBookmarked ? "Remove Bookmark" : "Bookmark this article"}
        >
            {isBookmarked ? (
                <BookmarkIconSolid className="w-5 h-5 text-[#3ddc84]" />
            ) : (
                <BookmarkIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
            <span>{isBookmarked ? 'Saved' : 'Save'}</span>
        </button>
    )
}
