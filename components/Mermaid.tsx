"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { TransformWrapper, TransformComponent, ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { useTheme } from "next-themes";

interface MermaidProps {
    chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
    const [svg, setSvg] = useState<string>("");
    const [isError, setIsError] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const id = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);
    const transformComponentRef = useRef<ReactZoomPanPinchContentRef>(null);
    const { resolvedTheme } = useTheme();
    // Add a key to force re-render when theme changes to ensure fresh Mermaid init
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Re-initialize mermaid with current theme settings
        const isDark = resolvedTheme === 'dark';

        mermaid.initialize({
            startOnLoad: false,
            theme: "base",
            securityLevel: "loose",
            fontFamily: "var(--font-inter), sans-serif",
            themeVariables: isDark ? {
                darkMode: true,
                background: "#1e1e1e",
                primaryColor: "#2d2d2d",
                primaryTextColor: "#ffffff",
                primaryBorderColor: "#3ddc84",
                lineColor: "#3ddc84",
                secondaryColor: "#1e1e1e",
                tertiaryColor: "#1e1e1e",
                noteBkgColor: "#2d2d2d",
                noteTextColor: "#ffffff",
                noteBorderColor: "#3ddc84",
                actorTextColor: "#ffffff",
                signalTextColor: "#ffffff",
                loopTextColor: "#ffffff",
                activationBorderColor: "#3ddc84",
                sequenceNumberColor: "#ffffff",
            } : {
                darkMode: false,
                background: "#ffffff",
                primaryColor: "#f3f4f6", // gray-100
                primaryTextColor: "#111827", // gray-900
                primaryBorderColor: "#d1d5db", // gray-300
                lineColor: "#374151", // gray-700
                secondaryColor: "#ffffff",
                tertiaryColor: "#ffffff",
                noteBkgColor: "#f3f4f6",
                noteTextColor: "#111827",
                noteBorderColor: "#d1d5db",
                actorTextColor: "#111827",
                signalTextColor: "#111827",
                loopTextColor: "#111827",
                activationBorderColor: "#6b7280",
                sequenceNumberColor: "#111827",
            }
        });

        const renderChart = async () => {
            try {
                // Reset SVG to empty to avoid stale render flashing
                const { svg } = await mermaid.render(id.current, chart);

                // Fix: Remove fixed width/height and add responsive styles
                // This ensures the SVG scales to fit the container (fullscreen or not)
                const responsiveSvg = svg
                    .replace(/width="[^"]*"/, '')
                    .replace(/height="[^"]*"/, '')
                    .replace(/style="[^"]*"/, 'style="max-width: 100%; max-height: 100%; height: auto;"');

                setSvg(responsiveSvg);
                setIsError(false);
            } catch (error) {
                console.error("Failed to render mermaid chart:", error);
                setIsError(true);
            }
        };

        if (chart) {
            renderChart();
        }
    }, [chart, resolvedTheme, mounted]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsFullScreen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    if (!mounted) {
        return <div className="mermaid-wrapper my-8 h-[500px] bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-light)] animate-pulse" />;
    }

    if (isError) {
        return (
            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-sm font-mono overflow-auto">
                Failed to render diagram.
                <pre>{chart}</pre>
            </div>
        )
    }

    const Controls = ({ fullScreenMode = false }) => (
        <div className={`flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg p-1.5 shadow-lg ${fullScreenMode ? 'fixed bottom-8 left-1/2 -translate-x-1/2 z-[10001]' : 'absolute bottom-4 right-4'}`}>
            <button
                onClick={() => transformComponentRef.current?.zoomIn()}
                className="p-2 hover:bg-[var(--bg-secondary)] rounded-md text-[var(--text-secondary)] hover:text-[#3ddc84] transition-colors"
                title="Zoom In"
            >
                <ZoomIn className="w-4 h-4" />
            </button>
            <button
                onClick={() => transformComponentRef.current?.zoomOut()}
                className="p-2 hover:bg-[var(--bg-secondary)] rounded-md text-[var(--text-secondary)] hover:text-[#3ddc84] transition-colors"
                title="Zoom Out"
            >
                <ZoomOut className="w-4 h-4" />
            </button>
            <button
                onClick={() => transformComponentRef.current?.resetTransform()}
                className="p-2 hover:bg-[var(--bg-secondary)] rounded-md text-[var(--text-secondary)] hover:text-[#3ddc84] transition-colors"
                title="Reset"
            >
                <RotateCcw className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-[var(--border-light)] mx-1" />
            <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 hover:bg-[var(--bg-secondary)] rounded-md text-[var(--text-secondary)] hover:text-[#3ddc84] transition-colors"
                title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
            >
                {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
        </div>
    );

    const DiagramContent = () => (
        <div
            className="mermaid-content w-full h-full flex items-center justify-center p-8"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );

    if (isFullScreen) {
        return (
            <div className="fixed inset-0 z-[9999] bg-[var(--bg-primary)] flex flex-col">
                <div className="absolute top-4 right-4 z-[10000]">
                    <button
                        onClick={() => setIsFullScreen(false)}
                        className="p-2 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg text-[var(--text-secondary)] hover:text-white hover:border-[#3ddc84] transition-colors"
                    >
                        <Minimize2 className="w-6 h-6" />
                    </button>
                </div>

                <TransformWrapper
                    ref={transformComponentRef}
                    initialScale={1}
                    minScale={0.5}
                    maxScale={4}
                    centerOnInit
                    limitToBounds={false}
                >
                    <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
                        <DiagramContent />
                    </TransformComponent>
                </TransformWrapper>

                <Controls fullScreenMode={true} />
            </div>
        );
    }

    return (
        <div className="mermaid-wrapper my-8 relative group bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-light)] overflow-hidden h-[500px]">
            <TransformWrapper
                ref={transformComponentRef}
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit
            >
                <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
                    <DiagramContent />
                </TransformComponent>
            </TransformWrapper>
            <Controls />
        </div>
    );
}
