'use client';

import { memo, useRef, useEffect, useState } from 'react';

interface LogoPreviewProps {
  svgContent: string;
  size?: number;
  className?: string;
}

function LogoPreview({ svgContent, size = 200, className = '' }: LogoPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (containerRef.current && mounted) {
      containerRef.current.innerHTML = svgContent;
      const svg = containerRef.current.querySelector('svg');
      if (svg) {
        svg.style.width = `${size}px`;
        svg.style.height = `${size}px`;
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';
      }
    }
  }, [svgContent, size, mounted]);

  if (!mounted) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-900/50 rounded-xl ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center ${className}`}
      style={{ minWidth: size, minHeight: size }}
    />
  );
}

export default memo(LogoPreview);
