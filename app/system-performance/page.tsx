'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function SystemPerformancePage() {
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
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">System Performance</h1>
                        <p className="text-xl text-gray-400">Optimizing Android for speed and efficiency</p>
                    </div>

                    <div className="space-y-12">
                        {/* Optimization */}
                        <section className="bg-[#1e1e1e] rounded-3xl p-8 border border-[#30363d]">
                            <h2 className="text-2xl font-bold text-white mb-4">Performance Optimization</h2>
                            <p className="text-gray-300 leading-relaxed mb-6">
                                Android system performance optimization focuses on creating smooth, responsive, and battery-efficient applications.
                                Understanding performance principles is crucial for building high-quality Android apps.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { title: 'Memory Management', desc: 'Efficient memory management and garbage collection strategies.' },
                                    { title: 'Startup Optimization', desc: 'Reducing app startup time and cold boot performance.' },
                                    { title: 'Background Work', desc: 'Minimizing background work and battery usage.' },
                                    { title: 'UI Rendering', desc: 'Optimizing UI rendering and maintaining 60fps frame rates.' },
                                ].map((item) => (
                                    <div key={item.title} className="bg-[#252525] p-6 rounded-2xl border border-[#30363d]">
                                        <h3 className="text-lg font-bold text-[#3ddc84] mb-2">{item.title}</h3>
                                        <p className="text-gray-400 text-sm">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Resource Management */}
                        <section className="bg-[#1e1e1e] rounded-3xl p-8 border border-[#30363d]">
                            <h2 className="text-2xl font-bold text-white mb-4">Resource Management</h2>
                            <ul className="space-y-3 text-gray-300 list-disc list-inside">
                                <li>Using JobScheduler and WorkManager for background tasks</li>
                                <li>Managing network and disk I/O efficiently</li>
                                <li>Profiling and monitoring app resource usage</li>
                                <li>Implementing efficient caching strategies</li>
                            </ul>
                        </section>

                        {/* Profiling Tools */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Profiling Tools</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { title: 'Android Studio Profiler', desc: 'Real-time performance monitoring and analysis.' },
                                    { title: 'Systrace', desc: 'System-wide performance analysis tool.' },
                                    { title: 'Traceview', desc: 'Method-level performance profiling.' },
                                    { title: 'Battery Historian', desc: 'Battery usage analysis and optimization.' },
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
                            <p className="text-gray-400 mb-6">Explore the official Android performance documentation for comprehensive optimization guides.</p>
                            <a
                                href="https://developer.android.com/topic/performance"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-8 py-3 rounded-full bg-[#3ddc84] text-black font-bold hover:bg-[#16a34a] transition-all"
                            >
                                Android Performance Guide
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
