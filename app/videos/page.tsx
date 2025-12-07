'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function VideosPage() {
    const videoSections = [
        {
            title: "Rendering Pipeline",
            videos: [
                {
                    title: "droidcon SF 2017 - view to pixel",
                    channel: "droidcon SF",
                    desc: "Deep dive into Android's rendering pipeline from View to Pixel.",
                    img: "https://img.youtube.com/vi/f2AW8ylnxRE/maxresdefault.jpg",
                    url: "https://www.youtube.com/watch?v=f2AW8ylnxRE"
                }
            ]
        },
        {
            title: "Android Internals",
            videos: [
                {
                    title: "Digging Into Android Startup",
                    channel: "Dave Smith",
                    desc: "Comprehensive overview of Android's internal architecture and system services.",
                    img: "https://img.youtube.com/vi/5SQP0qfUDjI/maxresdefault.jpg",
                    url: "https://www.youtube.com/watch?v=5SQP0qfUDjI"
                },
                {
                    title: "Exploring Android internals with ADB",
                    channel: "droidcon & fluttercon",
                    desc: "Chris Simmonds delves into the capabilities of ADB beyond standard debugging.",
                    img: "https://img.youtube.com/vi/inVnbJ7gOoE/maxresdefault.jpg",
                    url: "https://www.youtube.com/watch?v=inVnbJ7gOoE"
                },
                {
                    title: "Kotlin to Dalvik bytecode",
                    channel: "droidcon & fluttercon",
                    desc: "Deep dive into how Kotlin code is translated to Dalvik bytecode.",
                    img: "https://img.youtube.com/vi/XFogDQ2vwiE/maxresdefault.jpg",
                    url: "https://www.youtube.com/watch?v=XFogDQ2vwiE"
                }
            ]
        },
        {
            title: "Performance Optimization",
            videos: [
                {
                    title: "Android Internals for Developers",
                    channel: "droidcon SF",
                    desc: "Dig into the internals of how Android OS manages the apps that we write.",
                    img: "https://img.youtube.com/vi/s_YXezN5EQc/maxresdefault.jpg",
                    url: "https://www.youtube.com/watch?v=s_YXezN5EQc"
                }
            ]
        },
        {
            title: "System Architecture",
            videos: [
                {
                    title: "Android System Services",
                    channel: "Android Developers",
                    desc: "Exploring Android's system services architecture.",
                    img: "https://img.youtube.com/vi/0zJCyKp7-9s/maxresdefault.jpg",
                    url: "https://www.youtube.com/watch?v=0zJCyKp7-9s"
                }
            ]
        },
        {
            title: "Security Framework",
            videos: [
                {
                    title: "Android Security Framework",
                    channel: "InfoQ",
                    desc: "Understanding Android's security model and permission system.",
                    img: "https://img.youtube.com/vi/Jgampt1DOak/maxresdefault.jpg",
                    url: "https://www.youtube.com/watch?v=Jgampt1DOak"
                }
            ]
        }
    ]

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
                        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">Android Internals Reference Videos</h1>
                        <p className="text-xl text-[var(--text-secondary)]">Curated collection from conferences and experts</p>
                    </div>

                    <div className="space-y-16">
                        {videoSections.map((section) => (
                            <section key={section.title}>
                                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 border-b border-[var(--border-light)] pb-2 inline-block pr-8">{section.title}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {section.videos.map((video) => (
                                        <a
                                            key={video.title}
                                            href={video.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-[var(--bg-card)] rounded-xl overflow-hidden border border-[var(--border-light)] flex flex-col hover:border-[var(--primary)]/50 transition-colors group"
                                        >
                                            <div className="aspect-video bg-[var(--bg-secondary)] relative overflow-hidden">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={video.img} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-12 h-12 bg-[var(--primary)] rounded-full flex items-center justify-center pl-1 shadow-lg transform group-hover:scale-110 transition-transform">
                                                        <span className="text-black font-bold text-xl">▶</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-5 flex flex-col flex-grow">
                                                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 line-clamp-2">{video.title}</h3>
                                                <p className="text-[var(--primary)] text-xs font-bold mb-3 uppercase tracking-wider">{video.channel}</p>
                                                <p className="text-[var(--text-secondary)] text-sm line-clamp-3">{video.desc}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>

                    <div className="mt-16 text-center text-[var(--text-secondary)] text-sm">
                        <p>Disclaimer: These videos are external resources provided for reference purposes. <br />All rights belong to the original content creators.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
