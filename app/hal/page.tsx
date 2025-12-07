'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function HalPage() {
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
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">HAL (Hardware Abstraction Layer)</h1>
                        <p className="text-xl text-gray-400">Bridging Android software and device hardware</p>
                    </div>

                    <div className="space-y-12">
                        {/* What is HAL */}
                        <section className="bg-[#1e1e1e] rounded-3xl p-8 border border-[#30363d]">
                            <h2 className="text-2xl font-bold text-white mb-4">What is HAL?</h2>
                            <p className="text-gray-300 leading-relaxed">
                                The Hardware Abstraction Layer (HAL) in Android provides a standard interface for hardware vendors to implement,
                                allowing Android OS to communicate with device hardware without knowing the hardware specifics.
                                HAL modules act as a bridge between the Android system and hardware drivers.
                            </p>
                        </section>

                        {/* Role in Android */}
                        <section className="bg-[#1e1e1e] rounded-3xl p-8 border border-[#30363d]">
                            <h2 className="text-2xl font-bold text-white mb-4">Role in Android</h2>
                            <ul className="space-y-3 text-gray-300 list-disc list-inside">
                                <li>Enables Android to support a wide range of hardware with minimal changes to the OS.</li>
                                <li>Vendors implement HAL modules for their hardware, which the Android system calls via defined interfaces.</li>
                                <li>Ensures modularity and easier updates for both hardware and software.</li>
                            </ul>
                        </section>

                        {/* Architecture */}
                        <section className="bg-[#1e1e1e] rounded-3xl p-8 border border-[#30363d]">
                            <h2 className="text-2xl font-bold text-white mb-6">Architecture</h2>
                            <p className="text-gray-400 mb-6">HAL sits between the Android Framework and the Linux kernel drivers. The typical stack is:</p>

                            <div className="space-y-2 max-w-lg mx-auto">
                                <div className="p-4 bg-[#252525] rounded-xl text-center text-gray-300 border border-[#30363d]">Android App</div>
                                <div className="p-4 bg-[#252525] rounded-xl text-center text-gray-300 border border-[#30363d]">Android Framework</div>
                                <div className="p-4 bg-[#252525] rounded-xl text-center text-gray-300 border border-[#30363d]">JNI (Java Native Interface)</div>
                                <div className="p-4 bg-[#3ddc84]/20 rounded-xl text-center text-[#3ddc84] font-bold border border-[#3ddc84]">HAL</div>
                                <div className="p-4 bg-[#252525] rounded-xl text-center text-gray-300 border border-[#30363d]">Linux Kernel Driver</div>
                                <div className="p-4 bg-[#252525] rounded-xl text-center text-gray-300 border border-[#30363d]">Hardware</div>
                            </div>
                        </section>

                        {/* Examples */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Examples of HAL Modules</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { title: 'Camera HAL', desc: 'Manages camera hardware interfaces and image processing.' },
                                    { title: 'Audio HAL', desc: 'Handles audio input/output and audio processing.' },
                                    { title: 'Bluetooth HAL', desc: 'Manages Bluetooth connectivity and protocols.' },
                                    { title: 'Wi-Fi HAL', desc: 'Controls Wi-Fi hardware and network management.' },
                                    { title: 'Sensor HAL', desc: 'Manages various device sensors (accelerometer, gyroscope, etc.).' },
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
                            <p className="text-gray-400 mb-6">Explore the official Android HAL documentation for detailed implementation guides.</p>
                            <a
                                href="https://source.android.com/docs/core/architecture/hal"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-8 py-3 rounded-full bg-[#3ddc84] text-black font-bold hover:bg-[#16a34a] transition-all"
                            >
                                Official Documentation
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
