'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function SystemAppPage() {
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
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">System App</h1>
                        <p className="text-xl text-gray-400">Core apps with elevated privileges</p>
                    </div>

                    <div className="space-y-12">
                        {/* What are System Apps */}
                        <section className="bg-[#1e1e1e] rounded-3xl p-8 border border-[#30363d]">
                            <h2 className="text-2xl font-bold text-white mb-4">What are System Apps?</h2>
                            <p className="text-gray-300 leading-relaxed">
                                System apps are pre-installed applications that reside in the system partition of an Android device.
                                They have elevated privileges and are essential for core device functionality.
                            </p>
                        </section>

                        {/* Privileges */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Privileges of System Apps</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { title: 'Protected APIs', desc: 'Access to system-level APIs not available to regular user apps.' },
                                    { title: 'Persistence', desc: 'Cannot be uninstalled by regular users, ensuring core functionality.' },
                                    { title: 'Special Permissions', desc: 'Can request permissions not available to user-installed applications.' },
                                    { title: 'System Integration', desc: 'Deep integration with Android system services and components.' },
                                ].map((item) => (
                                    <div key={item.title} className="bg-[#1e1e1e] p-6 rounded-2xl border border-[#30363d] hover:border-[#3ddc84]/50 transition-colors">
                                        <h3 className="text-lg font-bold text-[#3ddc84] mb-2">{item.title}</h3>
                                        <p className="text-gray-400 text-sm">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Differences */}
                        <section className="bg-[#1e1e1e] rounded-3xl p-8 border border-[#30363d]">
                            <h2 className="text-2xl font-bold text-white mb-6">Differences from User Apps</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-6 bg-[#252525] rounded-xl border border-[#30363d]">
                                    <h3 className="text-xl font-bold text-white mb-4">User Apps</h3>
                                    <ul className="space-y-2 text-gray-400">
                                        <li>- Installed in data partition</li>
                                        <li>- Can be removed by users</li>
                                        <li>- Limited system access</li>
                                    </ul>
                                </div>
                                <div className="p-6 bg-[#3ddc84]/10 rounded-xl border border-[#3ddc84]">
                                    <h3 className="text-xl font-bold text-[#3ddc84] mb-4">System Apps</h3>
                                    <ul className="space-y-2 text-gray-300">
                                        <li>- Installed in system partition</li>
                                        <li>- Cannot be uninstalled</li>
                                        <li>- Elevated privileges</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Common System Apps */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Common System Apps</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { title: 'Settings', desc: 'System configuration and device management interface.' },
                                    { title: 'Phone', desc: 'Telephony and call management functionality.' },
                                    { title: 'System UI', desc: 'Status bar, navigation bar, and system interface elements.' },
                                    { title: 'Package Installer', desc: 'Manages app installation and updates from various sources.' },
                                    { title: 'Launcher', desc: 'Home screen and app drawer management.' },
                                    { title: 'System Services', desc: 'Core system services like PackageManager, ActivityManager.' },
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
                            <p className="text-gray-400 mb-6">Explore the official Android documentation for system app development and management.</p>
                            <a
                                href="https://source.android.com/docs/core/architecture/overview#system-apps"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-8 py-3 rounded-full bg-[#3ddc84] text-black font-bold hover:bg-[#16a34a] transition-all"
                            >
                                Android System Apps
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
