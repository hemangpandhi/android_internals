'use client'

import { useEffect, useState } from 'react'
import { ArrowUpIcon } from 'lucide-react'

export default function BackToTop() {
    const [isVisible, setIsVisible] = useState(false)

    const toggleVisibility = () => {
        if (window.scrollY > 300) {
            setIsVisible(true)
        } else {
            setIsVisible(false)
        }
    }

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility)
        return () => {
            window.removeEventListener('scroll', toggleVisibility)
        }
    }, [])

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <button
                type="button"
                onClick={scrollToTop}
                className={`
          p-3 rounded-full bg-[#3ddc84] text-black shadow-lg shadow-[#3ddc84]/20 
          hover:bg-[#16a34a] hover:scale-110 active:scale-95 transition-all duration-300
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
        `}
                aria-label="Back to top"
            >
                <ArrowUpIcon className="w-6 h-6" />
            </button>
        </div>
    )
}
