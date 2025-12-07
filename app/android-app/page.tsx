'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AndroidAppPage() {
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
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Android App</h1>
                        <p className="text-xl text-gray-400">Building blocks of the Android ecosystem</p>
                    </div>

                    <div className="space-y-12">
                        {/* App Structure */}
                        <section className="bg-[#1e1e1e] rounded-3xl p-8 border border-[#30363d]">
                            <h2 className="text-2xl font-bold text-white mb-4">App Structure</h2>
                            <p className="text-gray-300 leading-relaxed">
                                An Android app is a package (APK) containing code, resources, and a manifest.
                                It consists of components that interact with the system and users.
                            </p>
                        </section>

                        {/* Core Components */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Core Components</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { title: 'Activities', desc: 'UI screens for user interaction and navigation between different parts of the app.' },
                                    { title: 'Services', desc: 'Background tasks without UI that can run independently of activities.' },
                                    { title: 'Broadcast Receivers', desc: 'Respond to system-wide events and notifications from other apps.' },
                                    { title: 'Content Providers', desc: 'Manage shared app data and provide data access to other applications.' },
                                ].map((item) => (
                                    <div key={item.title} className="bg-[#1e1e1e] p-6 rounded-2xl border border-[#30363d] hover:border-[#3ddc84]/50 transition-colors">
                                        <h3 className="text-lg font-bold text-[#3ddc84] mb-2">{item.title}</h3>
                                        <p className="text-gray-400 text-sm">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* App Lifecycle */}
                        <section className="bg-[#1e1e1e] rounded-3xl p-8 border border-[#30363d]">
                            <h2 className="text-2xl font-bold text-white mb-6">App Lifecycle</h2>
                            <p className="text-gray-400 mb-6">
                                Android manages app components&apos; lifecycles, ensuring efficient resource use and smooth user experience.
                                Developers must handle state transitions and resource cleanup.
                            </p>

                            <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
                                {['Created', 'Started', 'Resumed'].map((state) => (
                                    <div key={state} className="w-full p-3 bg-[#252525] rounded-xl text-center text-gray-300 border border-[#30363d]">{state}</div>
                                ))}
                                <div className="w-full p-3 bg-[#3ddc84]/20 rounded-xl text-center text-[#3ddc84] font-bold border border-[#3ddc84] shadow-[0_0_15px_rgba(61,220,132,0.3)]">Running</div>
                                {['Paused', 'Stopped', 'Destroyed'].map((state) => (
                                    <div key={state} className="w-full p-3 bg-[#252525] rounded-xl text-center text-gray-300 border border-[#30363d]">{state}</div>
                                ))}
                            </div>
                        </section>

                        {/* Interaction with OS */}
                        <section className="bg-[#1e1e1e] rounded-3xl p-8 border border-[#30363d]">
                            <h2 className="text-2xl font-bold text-white mb-4">Interaction with OS</h2>
                            <ul className="space-y-3 text-gray-300 list-disc list-inside">
                                <li>Apps communicate with the OS via the Framework and system services.</li>
                                <li>Permissions control access to sensitive features and device resources.</li>
                                <li>Apps can interact with each other using Intents and Content Providers.</li>
                                <li>Background processing is managed through Services and WorkManager.</li>
                            </ul>
                        </section>

                        {/* CTA */}
                        <div className="text-center pt-8">
                            <h3 className="text-2xl font-bold text-white mb-4">Learn More</h3>
                            <p className="text-gray-400 mb-6">Explore the official Android app development documentation for comprehensive guides.</p>
                            <a
                                href="https://developer.android.com/guide/components/fundamentals"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-8 py-3 rounded-full bg-[#3ddc84] text-black font-bold hover:bg-[#16a34a] transition-all"
                            >
                                Android App Fundamentals
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
