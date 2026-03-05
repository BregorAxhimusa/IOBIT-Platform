'use client';

import { useEffect, useRef } from 'react';

// Floating particles animation
function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    const particles: { x: number; y: number; size: number; speedX: number; speedY: number; opacity: number }[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

export function SplineEarnHeader() {
  return (
    <div className="relative w-full min-h-[300px] md:min-h-[400px] lg:min-h-[600px] bg-[#0a0a0c] overflow-hidden border-b border-[#1a1a1f]">
      {/* Floating Particles */}
      <FloatingParticles />

      {/* Content Container */}
      <div className="relative z-10 w-full h-full min-h-[300px] md:min-h-[400px] lg:min-h-[600px] flex">
        {/* Left Side - Title */}
        <div className="flex-1 flex flex-col justify-start px-4 md:px-8 lg:px-16 pt-8 md:pt-12 lg:pt-16 pb-8 md:pb-12">
          <h1 className="text-2xl md:text-4xl lg:text-6xl font-light text-white leading-tight">
            Grow and Earn
            <br />
            by Powering the
            <br />
            IOBIT Ecosystem
          </h1>

          {/* How to Earn Button */}
          <button className="mt-6 md:mt-8 inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-[#16DE93] hover:bg-[#16DE93]/80 text-black text-xs md:text-sm font-medium rounded-md transition-colors w-fit">
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            How to Earn?
          </button>

          {/* Mobile Info - Hidden on desktop */}
          <div className="mt-6 lg:hidden">
            <p className="flex items-center gap-2 text-white text-xs mb-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Invite 1 friend to get 5% commission
            </p>
            <p className="text-white/50 text-[11px] leading-relaxed">
              Stake your BIT tokens with trusted validators to secure the network and earn rewards.
            </p>
          </div>
        </div>

        {/* Center - Spline 3D Placeholder */}
        <div className="hidden lg:flex flex-1 items-center justify-center">
          {/* Placeholder for Spline 3D - will be replaced with actual Spline component */}
          <div className="relative w-80 h-80">
            {/* 3D Cube placeholder effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 relative transform rotate-12" style={{ perspective: '1000px' }}>
                <div className="absolute w-16 h-16 bg-gradient-to-br from-cyan-400/80 to-cyan-600/80 transform rotate-45 translate-x-8 translate-y-0" />
                <div className="absolute w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 transform rotate-45 translate-x-16 translate-y-8" />
                <div className="absolute w-16 h-16 bg-gradient-to-br from-cyan-300/60 to-cyan-500/60 transform rotate-45 translate-x-24 translate-y-0" />
                <div className="absolute w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 transform rotate-45 translate-x-8 translate-y-16" />
                <div className="absolute w-16 h-16 bg-gradient-to-br from-cyan-400/70 to-teal-500/70 transform rotate-45 translate-x-16 translate-y-24" />
                <div className="absolute w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 transform rotate-45 translate-x-24 translate-y-16" />
                <div className="absolute w-16 h-16 bg-gradient-to-br from-cyan-300/50 to-cyan-400/50 transform rotate-45 translate-x-16 translate-y-40" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Info */}
        <div className="hidden lg:flex flex-1 flex-col justify-end items-end px-8 lg:px-16 py-12">
          <div className="max-w-sm text-right">
            <p className="flex items-center justify-end gap-2 text-white text-sm mb-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Invite 1 friend to get 5% commission
            </p>
            <p className="text-white/50 text-sm">
              Stake your BIT tokens with trusted validators to secure the network and earn rewards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
