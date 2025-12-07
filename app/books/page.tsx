'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function BooksPage() {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-20">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-6xl mx-auto"
                >
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">Android Internals Reference Books</h1>
                        <p className="text-xl text-[var(--text-secondary)]">Recommended reading for AOSP platform development</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Android Internals - A Confectioner's CookBook",
                                author: "Jonathan Levin (2015 to 2025)",
                                desc: "The definitive guide to Android system internals and development.",
                                img: "https://newandroidbook.com/cover2ndv1.2.15.jpg",
                                links: [
                                    { label: "Official Website", url: "https://newandroidbook.com/" },
                                    { label: "Amazon", url: "https://www.amazon.com/Android-Internals-Developers-Jonathan-Levin/dp/0991055543" }
                                ]
                            },
                            {
                                title: "Inside the Android OS",
                                author: "G. Blake Meike and Larry Schiefer (2021)",
                                desc: "Deep dive into Android system services and customization.",
                                img: "https://www.oreilly.com/covers/urn:orm:book:9780134096377/400w",
                                links: [
                                    { label: "Amazon", url: "https://www.amazon.com/Inside-Android-OS-Customizing-Operating/dp/0134096347" }
                                ]
                            },
                            {
                                title: "Android System Programming",
                                author: "Roger Ye (2017)",
                                desc: "Comprehensive guide to Android HAL development and system programming.",
                                img: "https://m.media-amazon.com/images/I/71M7ULE09SL._SY522_.jpg",
                                links: [
                                    { label: "Amazon", url: "https://www.amazon.com/Android-System-Programming-customizing-debugging/dp/178712536X" }
                                ]
                            },
                            {
                                title: "Learning Embedded Android N Programming",
                                author: "Ivan Morgillo and Stefano Viola (2016)",
                                desc: "Learn embedded Android development with practical examples.",
                                img: "https://m.media-amazon.com/images/I/91IY7yjwitL._SY522_.jpg",
                                links: [
                                    { label: "Amazon", url: "https://www.amazon.com/Learning-Embedded-Android-N-Programming-ebook/dp/B01841W9AU" }
                                ]
                            },
                            {
                                title: "Embedded Programming with Android",
                                author: "Roger Ye (2015)",
                                desc: "Step-by-step guide to building Android systems from the ground up.",
                                img: "https://m.media-amazon.com/images/I/51pTZd1TgBL.jpg",
                                links: [
                                    { label: "Amazon", url: "https://www.amazon.com/Embedded-Programming-Android-Bringing-Scratch-ebook/dp/B013IQGX3A" }
                                ]
                            },
                            {
                                title: "Embedded Android",
                                author: "Karim Yaghmour (2013)",
                                desc: "Classic guide to Android porting and customization techniques.",
                                img: "https://www.oreilly.com/covers/urn:orm:book:9781449327958/400w",
                                links: [
                                    { label: "Amazon", url: "https://www.amazon.com/Embedded-Android-Porting-Extending-Customizing/dp/1449308295" }
                                ]
                            },
                            {
                                title: "Androids: The Team that Built the Android Operating System",
                                author: "Chet Haase (2022)",
                                desc: "The fascinating story of the team behind Android's creation.",
                                img: "https://m.media-amazon.com/images/I/71tK4QsctFL._SL1500_.jpg",
                                links: [
                                    { label: "Amazon", url: "https://www.amazon.com/Androids-Built-Android-Operating-System/dp/1718502680" }
                                ]
                            }
                        ].map((book) => (
                            <div key={book.title} className="bg-[var(--bg-card)] rounded-xl overflow-hidden border border-[var(--border-light)] flex flex-col hover:border-[var(--primary)]/50 transition-colors group">
                                <div className="h-64 overflow-hidden bg-[var(--bg-secondary)] relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={book.img} alt={book.title} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 line-clamp-2">{book.title}</h3>
                                    <p className="text-[var(--primary)] text-sm mb-3">{book.author}</p>
                                    <p className="text-[var(--text-secondary)] text-sm mb-6 flex-grow">{book.desc}</p>
                                    <div className="flex gap-4 mt-auto">
                                        {book.links.map(link => (
                                            <a
                                                key={link.label}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-bold text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors"
                                            >
                                                {link.label} &rarr;
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-center text-[var(--text-secondary)] text-sm">
                        <p>These books represent the complete knowledge base for Android system development. <br />Start with the newest publications for the most current information.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
