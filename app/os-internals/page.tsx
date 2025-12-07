'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function OsInternalsPage() {
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
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">OS Internals</h1>
                        <p className="text-xl text-gray-400">Deep dive into Android&apos;s core</p>
                    </div>

                    <div className="space-y-12">
                        {/* Architecture Stack */}
                        <section className="bg-[#1e1e1e] rounded-3xl p-8 border border-[#30363d]">
                            <h2 className="text-2xl font-bold text-white mb-6">Android OS Architecture</h2>
                            <div className="max-w-lg mx-auto space-y-2">
                                <div className="p-4 bg-[#252525] rounded-xl text-center text-gray-300 border border-[#30363d]">Apps</div>
                                <div className="p-4 bg-[#252525] rounded-xl text-center text-gray-300 border border-[#30363d]">Framework</div>
                                <div className="p-4 bg-[#252525] rounded-xl text-center text-gray-300 border border-[#30363d]">Native Libraries</div>
                                <div className="p-4 bg-[#252525] rounded-xl text-center text-gray-300 border border-[#30363d]">Android Runtime (ART)</div>
                                <div className="p-4 bg-[#3ddc84]/20 rounded-xl text-center text-[#3ddc84] font-bold border border-[#3ddc84]">HAL</div>
                                <div className="p-4 bg-[#252525] rounded-xl text-center text-gray-300 border border-[#30363d]">Linux Kernel</div>
                            </div>
                        </section>

                        {/* Core Components */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Core Components</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { title: 'Linux Kernel', desc: 'Handles low-level hardware interactions, security, and process management.' },
                                    { title: 'HAL', desc: 'Bridges hardware and software through standardized interfaces.' },
                                    { title: 'Native Libraries', desc: 'C/C++ libraries for core features (WebKit, OpenGL, etc.).' },
                                    { title: 'Android Runtime', desc: 'Executes app bytecode with optimized performance.' },
                                    { title: 'Framework', desc: 'Java APIs for app development and system services.' },
                                    { title: 'Apps', desc: 'User and system applications running on the platform.' },
                                ].map((item) => (
                                    <div key={item.title} className="bg-[#1e1e1e] p-6 rounded-2xl border border-[#30363d] hover:border-[#3ddc84]/50 transition-colors">
                                        <h3 className="text-lg font-bold text-[#3ddc84] mb-2">{item.title}</h3>
                                        <p className="text-gray-400 text-sm">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Processes & Memory */}
                        <section className="bg-[#1e1e1e] rounded-3xl p-8 border border-[#30363d]">
                            <h2 className="text-2xl font-bold text-white mb-4">Processes & Memory Management</h2>
                            <ul className="space-y-3 text-gray-300 list-disc list-inside">
                                <li>Each app runs in its own process and sandbox for security.</li>
                                <li>Android manages memory using Linux features (OOM killer, cgroups).</li>
                                <li>Garbage collection in ART/Dalvik for app memory.</li>
                                <li>Process lifecycle management for efficient resource usage.</li>
                            </ul>
                        </section>

                        {/* Security Features */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Security Features</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { title: 'App Sandboxing', desc: 'Each app runs in isolated environment with limited permissions.' },
                                    { title: 'SELinux', desc: 'Mandatory access control for enhanced security enforcement.' },
                                    { title: 'Verified Boot', desc: 'Ensures system integrity from bootloader to system partition.' },
                                    { title: 'Permission Model', desc: 'Granular permission system for app capabilities.' },
                                ].map((item) => (
                                    <div key={item.title} className="bg-[#1e1e1e] p-6 rounded-2xl border border-[#30363d] hover:border-[#3ddc84]/50 transition-colors">
                                        <h3 className="text-lg font-bold text-[#3ddc84] mb-2">{item.title}</h3>
                                        <p className="text-gray-400 text-sm">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* CTA */}
                        <div className="text-center pt-8">
                            <h3 className="text-2xl font-bold text-white mb-4">Learn More</h3>
                            <p className="text-gray-400 mb-6">Explore the official Android OS architecture documentation for detailed insights.</p>
                            <a
                                href="https://source.android.com/docs/core/architecture"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-8 py-3 rounded-full bg-[#3ddc84] text-black font-bold hover:bg-[#16a34a] transition-all"
                            >
                                Android OS Architecture
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
