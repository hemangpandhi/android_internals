export default function Footer() {
    return (
        <footer className="bg-[#0a0a0a] border-t border-[#30363d] mt-auto">
            <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
                <div className="flex justify-center space-x-6 md:order-2">
                    <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                    <a href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                </div>
                <div className="mt-8 md:order-1 md:mt-0">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <img src="/images/android_logo.PNG" alt="Logo" className="h-6 w-auto opacity-70" />
                        <p className="text-center text-xs leading-5 text-gray-400">
                            &copy; {new Date().getFullYear()} Android Internals. All rights reserved.
                        </p>
                    </div>
                    <p className="text-center text-xs text-gray-500 md:text-left">
                        Not affiliated with Google or Android. Built with ❤️ for the community.
                    </p>
                </div>
            </div>
        </footer>
    )
}
