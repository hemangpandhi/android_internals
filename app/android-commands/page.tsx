'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AndroidCommandsPage() {
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
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Android Commands</h1>
                        <p className="text-xl text-gray-400">Essential shell and system commands for Android</p>
                    </div>

                    <div className="space-y-12">
                        {/* Access */}
                        <section className="bg-[#1e1e1e] rounded-3xl p-8 border border-[#30363d]">
                            <h2 className="text-2xl font-bold text-white mb-4">Common Android Shell Commands</h2>
                            <p className="text-gray-300 leading-relaxed mb-6">
                                These commands provide powerful control over Android devices and are essential for development, debugging, and system administration.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { cmd: 'pm list packages', desc: 'List all installed packages on the device' },
                                    { cmd: 'am start -n <package/activity>', desc: 'Start a specific activity or application' },
                                    { cmd: 'settings get <namespace> <key>', desc: 'Get system setting values' },
                                    { cmd: 'logcat', desc: 'View system logs and debugging information' },
                                    { cmd: 'top', desc: 'Show running processes and resource usage' },
                                    { cmd: 'df', desc: 'Display disk usage and storage information' },
                                    { cmd: 'getprop', desc: 'Get system properties and configuration' },
                                    { cmd: 'svc wifi enable/disable', desc: 'Control Wi-Fi connectivity' },
                                ].map((item) => (
                                    <div key={item.cmd} className="bg-[#252525] p-4 rounded-xl border border-[#30363d] flex flex-col">
                                        <code className="text-[#3ddc84] font-mono text-sm mb-1">{item.cmd}</code>
                                        <span className="text-gray-400 text-xs">{item.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Package Management */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Package Management Commands</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { title: 'Package Installation', cmd: 'pm install <apk-path>', desc: 'Install APK file' },
                                    { title: 'Package Removal', cmd: 'pm uninstall <package-name>', desc: 'Remove app' },
                                    { title: 'Package Information', cmd: 'pm list packages -f', desc: 'List with file paths' },
                                    { title: 'Package Permissions', cmd: 'pm list permissions', desc: 'Show all permissions' },
                                ].map((item) => (
                                    <div key={item.title} className="bg-[#1e1e1e] p-6 rounded-2xl border border-[#30363d] hover:border-[#3ddc84]/50 transition-colors">
                                        <h3 className="text-lg font-bold text-[#3ddc84] mb-2">{item.title}</h3>
                                        <code className="block bg-[#0a0a0a] p-2 rounded text-gray-300 font-mono text-xs mb-2">{item.cmd}</code>
                                        <p className="text-gray-400 text-sm">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Activity Management */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Activity Management Commands</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { title: 'Start Activity', cmd: 'am start -a <action>', desc: 'Start by intent action' },
                                    { title: 'Force Stop', cmd: 'am force-stop <package>', desc: 'Force stop app' },
                                    { title: 'Broadcast Intent', cmd: 'am broadcast -a <action>', desc: 'Send broadcast' },
                                    { title: 'Clear App Data', cmd: 'pm clear <package>', desc: 'Clear app data' },
                                ].map((item) => (
                                    <div key={item.title} className="bg-[#1e1e1e] p-6 rounded-2xl border border-[#30363d] hover:border-[#3ddc84]/50 transition-colors">
                                        <h3 className="text-lg font-bold text-[#3ddc84] mb-2">{item.title}</h3>
                                        <code className="block bg-[#0a0a0a] p-2 rounded text-gray-300 font-mono text-xs mb-2">{item.cmd}</code>
                                        <p className="text-gray-400 text-sm">{item.desc}</p>
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
                                    { title: 'Check Wi-Fi status:', cmd: 'adb shell settings get global wifi_on' },
                                    { title: 'Get device model:', cmd: 'adb shell getprop ro.product.model' },
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
                            <p className="text-gray-400 mb-6">Explore the official Android command-line tools documentation for advanced usage.</p>
                            <a
                                href="https://developer.android.com/studio/command-line"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-8 py-3 rounded-full bg-[#3ddc84] text-black font-bold hover:bg-[#16a34a] transition-all"
                            >
                                Android Command-Line Tools
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
