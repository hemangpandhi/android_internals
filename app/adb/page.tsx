'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AdbPage() {
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
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">ADB (Android Debug Bridge)</h1>
                        <p className="text-xl text-gray-400">Powerful tool for Android development and debugging</p>
                    </div>

                    <div className="space-y-12">
                        {/* What is ADB */}
                        <section className="bg-[#1e1e1e] rounded-3xl p-8 border border-[#30363d]">
                            <h2 className="text-2xl font-bold text-white mb-4">What is ADB?</h2>
                            <p className="text-gray-300 leading-relaxed">
                                ADB is a versatile command-line tool that lets you communicate with and control Android devices.
                                It is essential for development, debugging, and automation.
                            </p>
                        </section>

                        {/* Common Uses */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Common Uses</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { title: 'App Management', desc: 'Install and uninstall apps, manage app data and permissions.' },
                                    { title: 'Device Shell', desc: 'Access device shell for direct command execution.' },
                                    { title: 'File Transfer', desc: 'Transfer files between device and computer seamlessly.' },
                                    { title: 'Logcat', desc: 'View system logs for debugging and monitoring.' },
                                    { title: 'Automation', desc: 'Automate device actions and testing workflows.' },
                                ].map((item) => (
                                    <div key={item.title} className="bg-[#1e1e1e] p-6 rounded-2xl border border-[#30363d] hover:border-[#3ddc84]/50 transition-colors">
                                        <h3 className="text-lg font-bold text-[#3ddc84] mb-2">{item.title}</h3>
                                        <p className="text-gray-400 text-sm">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Common Commands */}
                        <section className="bg-[#1e1e1e] rounded-3xl p-8 border border-[#30363d]">
                            <h2 className="text-2xl font-bold text-white mb-6">Common Commands</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { cmd: 'adb devices', desc: 'List connected devices' },
                                    { cmd: 'adb install <apk>', desc: 'Install an APK' },
                                    { cmd: 'adb shell', desc: 'Open a shell on the device' },
                                    { cmd: 'adb logcat', desc: 'View system logs' },
                                    { cmd: 'adb push <src> <dest>', desc: 'Copy file to device' },
                                    { cmd: 'adb pull <src> <dest>', desc: 'Copy file from device' },
                                ].map((item) => (
                                    <div key={item.cmd} className="bg-[#252525] p-4 rounded-xl border border-[#30363d] flex flex-col">
                                        <code className="text-[#3ddc84] font-mono text-sm mb-1">{item.cmd}</code>
                                        <span className="text-gray-400 text-xs">{item.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Usage Examples */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Usage Examples</h2>
                            <div className="space-y-4">
                                {[
                                    { title: 'List Google packages:', cmd: 'adb shell pm list packages | grep google' },
                                    { title: 'Open URL in browser:', cmd: 'adb shell am start -a android.intent.action.VIEW -d https://www.android.com' },
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-[#1e1e1e] p-6 rounded-2xl border border-[#30363d]">
                                        <h4 className="text-white font-bold mb-2">{item.title}</h4>
                                        <code className="block bg-[#0a0a0a] p-3 rounded-lg text-[#3ddc84] font-mono text-sm overflow-x-auto">
                                            {item.cmd}
                                        </code>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* CTA */}
                        <div className="text-center pt-8">
                            <h3 className="text-2xl font-bold text-white mb-4">Learn More</h3>
                            <p className="text-gray-400 mb-6">Explore the official ADB documentation for comprehensive command reference and advanced usage.</p>
                            <a
                                href="https://developer.android.com/studio/command-line/adb"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-8 py-3 rounded-full bg-[#3ddc84] text-black font-bold hover:bg-[#16a34a] transition-all"
                            >
                                ADB Documentation
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
