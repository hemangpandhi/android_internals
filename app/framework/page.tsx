'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function FrameworkPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-20">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Android Framework</h1>
                        <p className="text-xl text-gray-400">The backbone of Android app development</p>
                    </div>

                    <div className="space-y-12">
                        {/* What is Framework */}
                        <section className="bg-[#1e1e1e] rounded-3xl p-8 border border-[#30363d]">
                            <h2 className="text-2xl font-bold text-white mb-4">What is the Android Framework?</h2>
                            <p className="text-gray-300 leading-relaxed">
                                The Android Framework is a set of Java APIs and system services that provide the building blocks for app development.
                                It abstracts the underlying hardware and OS, allowing developers to create powerful apps without dealing with low-level details.
                            </p>
                        </section>

                        {/* Key Components */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Key Components</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { title: 'Activity Manager', desc: 'Manages the lifecycle and stack of activities.' },
                                    { title: 'Window Manager', desc: 'Handles windows and their layout on the screen.' },
                                    { title: 'Content Providers', desc: 'Manage access to structured data.' },
                                    { title: 'View System', desc: 'UI components and layouts.' },
                                    { title: 'Resource Manager', desc: 'Accesses non-code resources like strings, layouts, and images.' },
                                    { title: 'Notification Manager', desc: 'Manages notifications.' },
                                    { title: 'Package Manager', desc: 'Manages app installation and updates.' },
                                    { title: 'Telephony Manager', desc: 'Manages telephony services.' },
                                ].map((item) => (
                                    <div key={item.title} className="bg-[#1e1e1e] p-6 rounded-2xl border border-[#30363d] hover:border-[#3ddc84]/50 transition-colors">
                                        <h3 className="text-lg font-bold text-[#3ddc84] mb-2">{item.title}</h3>
                                        <p className="text-gray-400 text-sm">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Role in App Development */}
                        <section className="bg-[#1e1e1e] rounded-3xl p-8 border border-[#30363d]">
                            <h2 className="text-2xl font-bold text-white mb-4">Role in App Development</h2>
                            <p className="text-gray-400 mb-4">The Framework provides a consistent environment for apps, handling communication with the system and hardware. Developers use the Framework to:</p>
                            <ul className="space-y-3 text-gray-300 list-disc list-inside">
                                <li>Build user interfaces</li>
                                <li>Access device features (camera, sensors, etc.)</li>
                                <li>Manage app lifecycle and resources</li>
                                <li>Interact with other apps and system services</li>
                            </ul>
                        </section>

                        {/* CTA */}
                        <div className="text-center pt-8">
                            <h3 className="text-2xl font-bold text-white mb-4">Learn More</h3>
                            <p className="text-gray-400 mb-6">Explore the official Android Framework documentation for comprehensive guides.</p>
                            <a
                                href="https://developer.android.com/guide/components/fundamentals"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-8 py-3 rounded-full bg-[#3ddc84] text-black font-bold hover:bg-[#16a34a] transition-all"
                            >
                                Android Framework Guide
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
