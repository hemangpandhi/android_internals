'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminDashboard() {
    const [subscribers, setSubscribers] = useState<any[]>([])
    const [messages, setMessages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'subscribers' | 'messages' | 'newsletter' | 'comments'>('subscribers')
    const router = useRouter()

    // New State for Newsletter
    const [broadcastSubject, setBroadcastSubject] = useState('')
    const [broadcastMessage, setBroadcastMessage] = useState('')
    const [isTestMode, setIsTestMode] = useState(true)
    const [sending, setSending] = useState(false)
    const [broadcastStatus, setBroadcastStatus] = useState('')
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])

    // Template State
    const [templateType, setTemplateType] = useState<'custom' | 'article'>('custom')
    const [articleTitle, setArticleTitle] = useState('')
    const [articleUrl, setArticleUrl] = useState('')
    const [articleDesc, setArticleDesc] = useState('')

    // Auto-generate message when inputs change (if using article template)
    useEffect(() => {
        if (templateType === 'article') {
            const html = `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #000; margin-bottom: 10px;">New Article: ${articleTitle || '[Title]'}</h2>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">${articleDesc || '[Short description of the article...]'}</p>
                    <div style="margin-top: 24px;">
                        <a href="${articleUrl || '#'}" style="background-color: #3ddc84; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Read Full Article</a>
                    </div>
                    <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;" />
                    <p style="font-size: 12px; color: #999;">Android Internals Newsletter</p>
                </div>
            `
            setBroadcastMessage(html)
            setBroadcastSubject(`New Article: ${articleTitle}`)
        }
    }, [templateType, articleTitle, articleUrl, articleDesc])

    // Update selected recipients when subscribers fetch
    useEffect(() => {
        if (subscribers.length > 0) {
            setSelectedRecipients(subscribers.map(s => s.email))
        }
    }, [subscribers])

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/auth/login')
                return
            }
            // Simple email whitelist check
            const allowedEmails = ['info@hemangpandhi.com', 'hemangpandhi@gmail.com']
            if (!allowedEmails.includes(user.email || '')) {
                // Access allowed for demo
            }
            fetchData()
        }
        checkAuthAndFetch()
    }, [router])

    const fetchData = async () => {
        setLoading(true)
        const res = await fetch('/api/admin/data')
        if (res.ok) {
            const data = await res.json()
            setSubscribers(data.subscribers || [])
            setMessages(data.messages || [])
        } else {
            console.error('Failed to fetch admin data')
        }
        setLoading(false)
    }

    const downloadCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Email,Joined At\n"
            + subscribers.map(s => `${s.email},${new Date(s.created_at).toLocaleDateString()}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "subscribers_list.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handleBroadcast = async () => {
        const recipientsToSend = isTestMode ? [] : selectedRecipients

        if (!isTestMode && recipientsToSend.length === 0) {
            alert("Please select at least one recipient.")
            return
        }

        const confirmMessage = isTestMode
            ? "Send TEST email to yourself?"
            : `Confirm: Send this to ${recipientsToSend.length} subscribers?`

        if (!confirm(confirmMessage)) return

        setSending(true)
        setBroadcastStatus('Sending...')

        try {
            const res = await fetch('/api/admin/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: broadcastSubject,
                    message: broadcastMessage,
                    testMode: isTestMode,
                    recipients: recipientsToSend
                })
            })

            const data = await res.json()
            if (res.ok) {
                setBroadcastStatus(`Success! Sent: ${data.sent}, Failed: ${data.failed}`)
                if (!isTestMode) {
                    setBroadcastSubject('')
                    setBroadcastMessage('')
                }
            } else {
                setBroadcastStatus(`Error: ${data.error}`)
            }
        } catch (e) {
            setBroadcastStatus('Network Error')
            console.error(e)
        }
        setSending(false)
    }

    const toggleRecipient = (email: string) => {
        if (selectedRecipients.includes(email)) {
            setSelectedRecipients(selectedRecipients.filter(e => e !== email))
        } else {
            setSelectedRecipients([...selectedRecipients, email])
        }
    }

    const toggleSelectAll = () => {
        if (selectedRecipients.length === subscribers.length) {
            setSelectedRecipients([])
        } else {
            setSelectedRecipients(subscribers.map(s => s.email))
        }
    }

    if (loading) return <div className="min-h-screen bg-[var(--bg-primary)] p-20 text-center text-[var(--text-primary)]">Loading Admin Data...</div>

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Admin Dashboard</h1>
                    <Link href="/" className="text-[#3ddc84] hover:underline">Back to Home</Link>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-8 border-b border-[var(--border-light)]">
                    <button
                        className={`pb-2 px-4 ${activeTab === 'subscribers' ? 'border-b-2 border-[#3ddc84] text-[#3ddc84]' : 'text-[var(--text-secondary)]'}`}
                        onClick={() => setActiveTab('subscribers')}
                    >
                        Subscribers ({subscribers.length})
                    </button>
                    <button
                        className={`pb-2 px-4 ${activeTab === 'messages' ? 'border-b-2 border-[#3ddc84] text-[#3ddc84]' : 'text-[var(--text-secondary)]'}`}
                        onClick={() => setActiveTab('messages')}
                    >
                        Messages ({messages.length})
                    </button>
                    <button
                        className={`pb-2 px-4 ${activeTab === 'newsletter' ? 'border-b-2 border-[#3ddc84] text-[#3ddc84]' : 'text-[var(--text-secondary)]'}`}
                        onClick={() => setActiveTab('newsletter')}
                    >
                        Newsletter (Broadcast)
                    </button>
                    <button
                        className={`pb-2 px-4 ${activeTab === 'comments' ? 'border-b-2 border-[#3ddc84] text-[#3ddc84]' : 'text-[var(--text-secondary)]'}`}
                        onClick={() => setActiveTab('comments')}
                    >
                        Comments
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'subscribers' && (
                    <div>
                        <div className="mb-4 flex justify-end">
                            <button onClick={downloadCSV} className="bg-[#3ddc84] text-black px-4 py-2 rounded font-bold hover:bg-[#16a34a]">
                                Download CSV
                            </button>
                        </div>
                        <div className="bg-[var(--bg-card)] rounded-xl overflow-hidden border border-[var(--border-light)]">
                            <table className="w-full text-left text-[var(--text-primary)]">
                                <thead className="bg-black/20 text-[#3ddc84]">
                                    <tr>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Joined At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-light)]">
                                    {subscribers.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-white/5">
                                            <td className="p-4">{sub.email}</td>
                                            <td className="p-4">{new Date(sub.created_at).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {subscribers.length === 0 && (
                                        <tr><td colSpan={2} className="p-8 text-center text-[var(--text-secondary)]">No subscribers yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'messages' && (
                    <div className="grid gap-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-light)]">
                                <div className="flex justify-between mb-2">
                                    <h3 className="font-bold text-lg text-[var(--text-primary)]">{msg.name}</h3>
                                    <span className="text-sm text-[var(--text-secondary)]">{new Date(msg.created_at).toLocaleString()}</span>
                                </div>
                                <p className="text-[#3ddc84] mb-2">{msg.email}</p>
                                <p className="text-[var(--text-secondary)] whitespace-pre-wrap">{msg.message}</p>
                            </div>
                        ))}
                        {messages.length === 0 && (
                            <div className="text-center text-[var(--text-secondary)] p-8">No messages yet.</div>
                        )}
                    </div>
                )}

                {activeTab === 'comments' && (
                    <CommentsAdminTab />
                )}

                {activeTab === 'newsletter' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* LEFT: Editor */}
                        <div className="bg-[var(--bg-card)] p-8 rounded-xl border border-[var(--border-light)]">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Create Broadcast</h2>

                            {/* Template Selector */}
                            <div className="flex space-x-4 mb-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="template"
                                        checked={templateType === 'custom'}
                                        onChange={() => setTemplateType('custom')}
                                    />
                                    <span className="text-[var(--text-primary)]">Custom HTML</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="template"
                                        checked={templateType === 'article'}
                                        onChange={() => setTemplateType('article')}
                                    />
                                    <span className="text-[var(--text-primary)]">New Article Annoucement</span>
                                </label>
                            </div>

                            {templateType === 'article' ? (
                                <div className="space-y-4 mb-6 p-4 bg-black/10 rounded border border-[var(--border-light)]">
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Article Title</label>
                                        <input type="text" value={articleTitle} onChange={e => setArticleTitle(e.target.value)} className="w-full bg-black/20 border border-[var(--border-light)] rounded p-2 text-[var(--text-primary)] text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Article URL (e.g. https://hemangpandhi.com/articles/...)</label>
                                        <input type="text" value={articleUrl} onChange={e => setArticleUrl(e.target.value)} className="w-full bg-black/20 border border-[var(--border-light)] rounded p-2 text-[var(--text-primary)] text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Short Description</label>
                                        <textarea value={articleDesc} onChange={e => setArticleDesc(e.target.value)} rows={3} className="w-full bg-black/20 border border-[var(--border-light)] rounded p-2 text-[var(--text-primary)] text-sm" />
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Subject</label>
                                    <input
                                        type="text"
                                        value={broadcastSubject}
                                        onChange={(e) => setBroadcastSubject(e.target.value)}
                                        className="w-full bg-black/20 border border-[var(--border-light)] rounded p-2 text-[var(--text-primary)] focus:border-[#3ddc84] outline-none"
                                    />
                                </div>
                            )}

                            {templateType === 'custom' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Message (HTML)</label>
                                    <textarea
                                        rows={8}
                                        value={broadcastMessage}
                                        onChange={(e) => setBroadcastMessage(e.target.value)}
                                        className="w-full bg-black/20 border border-[var(--border-light)] rounded p-2 text-[var(--text-primary)] focus:border-[#3ddc84] outline-none font-mono text-sm"
                                    />
                                </div>
                            )}

                            {/* Recipient Selection */}
                            <div className="mb-6">
                                <div className="flex items-center space-x-2 mb-4">
                                    <input
                                        type="checkbox"
                                        id="testMode"
                                        checked={isTestMode}
                                        onChange={(e) => setIsTestMode(e.target.checked)}
                                        className="rounded border-[var(--border-light)]"
                                    />
                                    <label htmlFor="testMode" className="text-[var(--text-primary)] cursor-pointer font-bold">
                                        Test Mode (Only to me)
                                    </label>
                                </div>

                                {!isTestMode && (
                                    <div className="mt-4 border border-[var(--border-light)] rounded p-4 bg-black/10">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-medium text-[var(--text-secondary)]">Recipients ({selectedRecipients.length})</label>
                                            <button onClick={toggleSelectAll} className="text-xs text-[#3ddc84] hover:underline">
                                                {selectedRecipients.length === subscribers.length ? 'Deselect All' : 'Select All'}
                                            </button>
                                        </div>
                                        <div className="max-h-40 overflow-y-auto space-y-2">
                                            {subscribers.map(sub => (
                                                <div key={sub.id} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRecipients.includes(sub.email)}
                                                        onChange={() => toggleRecipient(sub.email)}
                                                        className="rounded border-[var(--border-light)]"
                                                    />
                                                    <span className="text-sm text-[var(--text-primary)]">{sub.email}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleBroadcast}
                                disabled={sending || !broadcastSubject || !broadcastMessage}
                                className="w-full bg-[#3ddc84] text-black font-bold py-3 rounded hover:bg-[#16a34a] disabled:opacity-50"
                            >
                                {sending ? 'Sending...' : (isTestMode ? 'Send Test Email' : `BROADCAST TO ${selectedRecipients.length} SUBSCRIBERS`)}
                            </button>

                            {broadcastStatus && (
                                <div className="mt-4 p-3 bg-black/30 rounded text-center text-[var(--text-primary)] text-sm whitespace-pre-wrap">
                                    {broadcastStatus}
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Live Preview */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-lg h-fit sticky top-8">
                            <div className="bg-gray-100 p-4 border-b border-gray-200 flex justify-between items-center">
                                <span className="text-gray-500 font-bold text-sm">Email Preview</span>
                            </div>
                            <div className="p-4 bg-white min-h-[400px] text-black">
                                <div className="mb-4 pb-4 border-b border-gray-100">
                                    <p className="text-xs text-gray-400 font-bold uppercase">Subject</p>
                                    <p className="text-lg font-medium text-gray-900">{broadcastSubject || '(No Subject)'}</p>
                                </div>
                                <div
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: broadcastMessage || '<p class="text-gray-400 italic">Start typing to generate preview...</p>' }}
                                />
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}

function CommentsAdminTab() {
    const [comments, setComments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchComments()
    }, [])

    const fetchComments = async () => {
        try {
            const res = await fetch('/api/admin/comments')
            if (res.ok) {
                const data = await res.json()
                setComments(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return

        try {
            const res = await fetch(`/api/admin/comments?id=${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchComments()
            } else {
                alert('Failed to delete comment')
            }
        } catch (error) {
            console.error(error)
            alert('Error deleting comment')
        }
    }

    if (loading) return <div className="text-[var(--text-secondary)]">Loading comments...</div>

    return (
        <div className="bg-[var(--bg-card)] rounded-xl overflow-hidden border border-[var(--border-light)]">
            <table className="w-full text-left text-[var(--text-primary)]">
                <thead className="bg-black/20 text-[#3ddc84]">
                    <tr>
                        <th className="p-4">Date</th>
                        <th className="p-4">User</th>
                        <th className="p-4">Article</th>
                        <th className="p-4">Comment</th>
                        <th className="p-4">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                    {comments.map((comment) => (
                        <tr key={comment.id} className="hover:bg-white/5">
                            <td className="p-4 text-sm text-[var(--text-secondary)] whitespace-nowrap">
                                {new Date(comment.created_at).toLocaleString()}
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    <img src={comment.avatar_url || `https://ui-avatars.com/api/?name=${comment.user_name}`} className="w-6 h-6 rounded-full" />
                                    <div className="text-sm">
                                        <div className="font-medium">{comment.user_name}</div>
                                        <div className="text-[var(--text-secondary)] text-xs">{comment.user_email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-sm text-[#3ddc84] whitespace-nowrap">
                                {comment.article_slug}
                            </td>
                            <td className="p-4 text-sm max-w-xs truncate">
                                {comment.content}
                            </td>
                            <td className="p-4">
                                <button
                                    onClick={() => handleDelete(comment.id)}
                                    className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    {comments.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-[var(--text-secondary)]">No comments yet.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
