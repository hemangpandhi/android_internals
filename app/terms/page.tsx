'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function TermsPage() {
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
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Terms of Service</h1>
                        <p className="text-xl text-gray-400">Last Updated: November 15, 2025</p>
                    </div>

                    <div className="prose prose-invert prose-lg max-w-none space-y-8 bg-[#1e1e1e] p-8 md:p-12 rounded-3xl border border-[#30363d]">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                            <p className="text-gray-300">By accessing and using the Android Internals website (&quot;the Website&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
                            <h3 className="text-xl font-bold text-[#3ddc84] mb-2">2.1 Permission</h3>
                            <p className="text-gray-300 mb-4">Permission is granted to temporarily access and use the materials on Android Internals&apos; website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>

                            <h3 className="text-xl font-bold text-[#3ddc84] mb-2">2.2 Termination</h3>
                            <p className="text-gray-300">This license shall automatically terminate if you violate any of these restrictions and may be terminated by Android Internals at any time.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. Disclaimer</h2>
                            <p className="text-gray-300">The materials on Android Internals&apos; website are provided on an &apos;as is&apos; basis. Android Internals makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">7. Content Usage</h2>
                            <h3 className="text-xl font-bold text-[#3ddc84] mb-2">7.1 Original Content</h3>
                            <p className="text-gray-300 mb-4">All original content on this website, including articles, guides, and documentation, is the property of Android Internals unless otherwise stated.</p>

                            <h3 className="text-xl font-bold text-[#3ddc84] mb-2">7.2 Third-Party Content</h3>
                            <p className="text-gray-300 mb-4">This website may contain references to third-party content, including Videos and Books. All rights belong to original creators.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">12. Contact Information</h2>
                            <p className="text-gray-300 mb-4">If you have any questions about these Terms of Service, please contact us:</p>
                            <ul className="list-disc pl-6 text-gray-300 space-y-2">
                                <li>Through our <Link href="/#contact" className="text-[#3ddc84] hover:underline">contact form</Link></li>
                                <li>Email: info@hemangpandhi.com</li>
                            </ul>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
