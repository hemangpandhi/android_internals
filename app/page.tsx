'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'


// Animation variants
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const topics = [
  {
    title: "HAL (Hardware Abstraction Layer)",
    description: "Understand how Android interfaces with device hardware through HAL modules.",
    icon: "🔧",
    href: "/hal",
    color: "bg-blue-100 text-blue-600"
  },
  {
    title: "Framework",
    description: "Dive into the Android Framework layer, APIs and system services.",
    icon: "🏗️",
    href: "/framework",
    color: "bg-green-100 text-green-600"
  },
  {
    title: "Android App",
    description: "Learn about Android application structure, lifecycle, and components.",
    icon: "📱",
    href: "/android-app",
    color: "bg-purple-100 text-purple-600"
  },
  {
    title: "System App",
    description: "Explore the role of system apps and their privileges.",
    icon: "⚙️",
    href: "/system-app",
    color: "bg-orange-100 text-orange-600"
  },
  {
    title: "OS Internals",
    description: "Uncover the core of Android OS: processes, memory, and security.",
    icon: "🔬",
    href: "/os-internals",
    color: "bg-red-100 text-red-600"
  },
  {
    title: "System Performance",
    description: "Insights into optimizing Android system performance and profiling.",
    icon: "⚡",
    href: "/system-performance",
    color: "bg-yellow-100 text-yellow-600"
  },
  {
    title: "ADB (Android Debug Bridge)",
    description: "Master ADB for device communication and debugging.",
    icon: "🔌",
    href: "/adb",
    color: "bg-cyan-100 text-cyan-600"
  },
  {
    title: "Android Commands",
    description: "Curated list of powerful Android shell and system commands.",
    icon: "⌨️",
    href: "/android-commands",
    color: "bg-gray-100 text-gray-600"
  }
]

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img src="/images/android_logo.PNG" alt="Android Internals Logo" className="hero-logo" />
          </motion.div>

          <motion.h1
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            transition={{ delay: 0.2 }}
            className="hero-title"
          >
            Android Internals
          </motion.h1>

          <motion.p
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            transition={{ delay: 0.3 }}
            className="hero-subtitle text-center"
          >
            Uncovering the Hidden Depths of Android. The comprehensive guide to OS architecture, HAL, Framework, and System Performance.
          </motion.p>

          <motion.div
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            transition={{ delay: 0.4 }}
            className="hero-stats flex flex-wrap justify-center gap-6 mt-12"
          >
            <Link href="/articles" className="group">
              <div className="flex flex-col items-center justify-center w-40 h-32 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] group-hover:border-[#3ddc84] group-hover:shadow-[0_0_20px_rgba(61,220,132,0.1)] transition-all duration-300">
                <span className="text-4xl font-bold text-[#3ddc84] mb-2 group-hover:scale-110 transition-transform">9</span>
                <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">Latest Articles</span>
              </div>
            </Link>
            <Link href="/#topics" className="group">
              <div className="flex flex-col items-center justify-center w-40 h-32 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] group-hover:border-[#3ddc84] group-hover:shadow-[0_0_20px_rgba(61,220,132,0.1)] transition-all duration-300">
                <span className="text-4xl font-bold text-[#3ddc84] mb-2 group-hover:scale-110 transition-transform">11</span>
                <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">Core Topics</span>
              </div>
            </Link>
            <Link href="/books" className="group">
              <div className="flex flex-col items-center justify-center w-40 h-32 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] group-hover:border-[#3ddc84] group-hover:shadow-[0_0_20px_rgba(61,220,132,0.1)] transition-all duration-300">
                <span className="text-4xl font-bold text-[#3ddc84] mb-2 group-hover:scale-110 transition-transform">7</span>
                <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">Reference Books</span>
              </div>
            </Link>
            <Link href="/videos" className="group">
              <div className="flex flex-col items-center justify-center w-40 h-32 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] group-hover:border-[#3ddc84] group-hover:shadow-[0_0_20px_rgba(61,220,132,0.1)] transition-all duration-300">
                <span className="text-4xl font-bold text-[#3ddc84] mb-2 group-hover:scale-110 transition-transform">6</span>
                <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">Reference Videos</span>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            transition={{ delay: 0.6 }}
            className="mt-12 flex gap-4"
          >
            <Link href="#topics" className="px-8 py-3 rounded-full bg-[#3ddc84] text-black font-bold hover:bg-[#16a34a] transition-all">
              Start Learning
            </Link>
            {mounted && !user && (
              <Link href="/auth/login" className="px-8 py-3 rounded-full bg-transparent border border-[#3ddc84] text-[#3ddc84] font-bold hover:bg-[#3ddc84] hover:text-black transition-all">
                Sign In
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Topics Section */}
      <section id="topics" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="section-title">Explore Android Internals</h2>
            <p className="section-description text-center mx-auto">Deep dive into the essential components of the Android Operating System.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {topics.map((topic, index) => (
              <motion.div
                key={topic.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={topic.href} className="block group h-full">
                  <div className="p-6 h-full rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] hover:border-[#3ddc84] hover:bg-[var(--bg-tertiary)] transition-all">
                    <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                      {topic.icon}
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[#3ddc84] transition-colors">{topic.title}</h3>
                    <p className="text-[var(--text-secondary)] text-sm">{topic.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Discussions Section */}
      <section id="discussions" className="py-20 bg-[var(--bg-secondary)]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="section-title">Community Discussions</h2>
            <p className="section-description text-center mx-auto">Join the conversation with other Android developers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)]">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">General Discussion</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-4">Share ideas and discuss Android topics.</p>
              <span className="text-xs font-bold text-[#3ddc84] bg-[#3ddc84]/10 px-2 py-1 rounded">🚀 Coming Soon</span>
            </div>
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)]">
              <div className="text-3xl mb-4">❓</div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Q&A Forum</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-4">Get help with development challenges.</p>
              <span className="text-xs font-bold text-[#3ddc84] bg-[#3ddc84]/10 px-2 py-1 rounded">🚀 Coming Soon</span>
            </div>
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)]">
              <div className="text-3xl mb-4">🔧</div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Deep Dives</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-4">Advanced discussions on HAL & Framework.</p>
              <span className="text-xs font-bold text-[#3ddc84] bg-[#3ddc84]/10 px-2 py-1 rounded">🚀 Coming Soon</span>
            </div>
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)]">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Showcase</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-4">Share your projects and custom ROMs.</p>
              <span className="text-xs font-bold text-[#3ddc84] bg-[#3ddc84]/10 px-2 py-1 rounded">🚀 Coming Soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about-me" className="py-20 bg-[var(--bg-primary)]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-[var(--bg-card)] rounded-3xl p-8 md:p-12 border border-[var(--border-light)]">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6 text-center">About Android Internals</h2>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed text-center">
              Android Internals is your comprehensive resource for understanding the Android operating system architecture,
              from hardware abstraction layers to application frameworks. Whether you&apos;re a developer, system administrator,
              or Android enthusiast, our guides provide deep insights into Android&apos;s core components and development practices.
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section id="newsletter" className="py-20 bg-[var(--bg-secondary)]">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Stay Updated</h2>
            <p className="text-[var(--text-secondary)] mb-8">Get notified when new articles are published and receive exclusive Android internals insights.</p>

            <NewsletterForm />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-[var(--bg-primary)]">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Get in Touch</h2>
              <p className="text-[var(--text-secondary)]">Have questions about Android internals? Want to collaborate? Let's connect!</p>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  )
}



function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      // Call Next.js API Route
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setStatus('success')
      setStatusMessage('Message sent successfully! We will get back to you soon.')
      setName('')
      setEmail('')
      setMessage('')
    } catch (error: any) {
      console.error('Contact form error:', error)
      setStatus('error')
      setStatusMessage(error.message || 'Failed to send message. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          className="w-full bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#3ddc84]"
          required
          disabled={status === 'loading'}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your Email"
          className="w-full bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#3ddc84]"
          required
          disabled={status === 'loading'}
        />
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Your Message"
        rows={5}
        className="w-full bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#3ddc84]"
        required
        disabled={status === 'loading'}
      ></textarea>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full px-6 py-4 rounded-lg bg-[#3ddc84] text-black font-bold hover:bg-[#16a34a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Sending...' : 'Send Message'}
      </button>
      {statusMessage && (
        <p className={`text-center text-sm ${status === 'error' ? 'text-red-500' : 'text-green-500'}`}>
          {statusMessage}
        </p>
      )}
    </form>
  )
}


function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      // Call Next.js API Route
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) { // Unique violation
          setStatus('error')
          setMessage('You are already subscribed!')
          return
        }
        throw new Error(data.error || 'Failed to subscribe')
      }

      setStatus('success')
      setMessage('Thank you for subscribing!')
      setEmail('')
    } catch (error: any) {
      console.error('Subscription error:', error)
      setStatus('error')
      setMessage(error.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubscribe} className="flex gap-4 mb-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="flex-1 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#3ddc84]"
          required
          disabled={status === 'loading' || status === 'success'}
        />
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="px-6 py-3 rounded-lg bg-[#3ddc84] text-black font-bold hover:bg-[#16a34a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? '...' : (status === 'success' ? 'Joined!' : 'Subscribe')}
        </button>
      </form>
      {message && (
        <p className={`text-sm ${status === 'error' ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
