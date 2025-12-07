'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Dialog, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon, UserCircleIcon } from '@heroicons/react/24/outline'


import { useTheme } from 'next-themes'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { Fragment } from 'react'

const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Topics', href: '/#topics' },
    { name: 'Articles', href: '/articles' },
    { name: 'Discussions', href: '/#discussions' },
    { name: 'About Me', href: '/#about-me' },
    { name: 'Newsletter', href: '/#newsletter' },
    { name: 'Reference Books', href: '/books' },
    { name: 'Reference Videos', href: '/videos' },
]

export default function Navbar() {
    const { theme, setTheme } = useTheme()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setMobileMenuOpen(false) // Close mobile menu if open
    }

    // Don't render auth elements during SSR to prevent hydration mismatch
    const AuthButton = () => {
        if (!mounted) return null

        if (user) {
            return (
                <Menu as="div" className="relative ml-3">
                    <div>
                        <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 h-8 w-8 items-center justify-center">
                            <span className="absolute -inset-1.5" />
                            <span className="sr-only">Open user menu</span>
                            {user.user_metadata.avatar_url ? (
                                <img
                                    className="h-8 w-8 rounded-full"
                                    src={user.user_metadata.avatar_url}
                                    alt=""
                                />
                            ) : (
                                <UserCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
                            )}
                        </Menu.Button>
                    </div>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm">Signed in as</p>
                                <p className="truncate text-sm font-medium text-gray-900">{user.email}</p>
                            </div>
                            <Menu.Item>
                                {({ active }) => (
                                    <Link
                                        href="/profile"
                                        className={`${active ? 'bg-gray-100' : ''
                                            } block px-4 py-2 text-sm text-gray-700`}
                                    >
                                        Your Profile
                                    </Link>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={handleSignOut}
                                        className={`${active ? 'bg-gray-100' : ''
                                            } block w-full px-4 py-2 text-left text-sm text-gray-700`}
                                    >
                                        Sign out
                                    </button>
                                )}
                            </Menu.Item>
                        </Menu.Items>
                    </Transition>
                </Menu>
            )
        }

        return (
            <Link href="/auth/login" className="btn-login whitespace-nowrap">
                Sign In
            </Link>
        )
    }

    return (
        <header className="main-nav">
            <nav className="nav-container" aria-label="Global">
                <Link href="/" className="flex items-center gap-2">
                    <img className="h-[80px] w-[80px] object-contain" src="/images/android_logo.PNG" alt="Android Internals" />
                </Link>

                {/* Mobile Menu Button */}
                <div className="flex lg:hidden ml-auto items-center gap-4">
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            {theme === 'dark' ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6 text-[var(--primary)]" />}
                        </button>
                    )}
                    <button
                        type="button"
                        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <span className="sr-only">Open main menu</span>
                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>

                {/* Desktop Menu */}
                <div className="hidden lg:flex lg:gap-x-4 items-center">
                    {navigation.map((item) => (
                        <Link key={item.name} href={item.href} className="nav-link whitespace-nowrap">
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Auth & Theme Button (Desktop) */}
                <div className="hidden lg:flex lg:ml-6 items-center gap-4">
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            aria-label="Toggle Dark Mode"
                        >
                            {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5 text-[var(--primary)]" />}
                        </button>
                    )}
                    <AuthButton />
                </div>
            </nav>

            <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
                <div className="fixed inset-0 z-50 bg-black/80" />
                <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-[var(--bg-primary)] px-6 py-6 sm:max-w-sm border-l border-[var(--border-light)]">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                            <img className="h-10 w-auto" src="/images/android_logo.PNG" alt="Android Internals" />
                        </Link>
                        <button
                            type="button"
                            className="-m-2.5 rounded-md p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="sr-only">Close menu</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="mt-6 flow-root">
                        <div className="-my-6 divide-y divide-gray-500/10">
                            <div className="space-y-2 py-6">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                            <div className="py-6">
                                {mounted && user ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 px-3">
                                            <img
                                                className="h-10 w-10 rounded-full"
                                                src={user.user_metadata.avatar_url || "https://ui-avatars.com/api/?name=" + (user.email || "User")}
                                                alt=""
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-[var(--text-primary)]">{user.email}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Link
                                                href="/profile"
                                                className="-mx-3 block w-full rounded-lg px-3 py-2 text-left text-base font-semibold leading-7 text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Your Profile
                                            </Link>
                                            <button
                                                onClick={handleSignOut}
                                                className="-mx-3 block w-full rounded-lg px-3 py-2 text-left text-base font-semibold leading-7 text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                                            >
                                                Sign out
                                            </button>
                                        </div>
                                    </div>) : (
                                    <Link
                                        href="/auth/login"
                                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Log in
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </Dialog.Panel>
            </Dialog>
        </header>
    )
}
