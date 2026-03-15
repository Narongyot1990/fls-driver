'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: string;
}

interface ParticleEmitterProps {
  count?: number;
  className?: string;
}

const STAR_COLORS = [
  'rgba(255,255,255,',
  'rgba(200,220,255,',
  'rgba(180,200,255,',
  'rgba(255,240,220,',
  'rgba(220,200,255,',
];

export default function ParticleEmitter({ count = 80, className = '' }: ParticleEmitterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resize();
    window.addEventListener('resize', resize);

    // Create stars
    starsRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.3,
      baseAlpha: Math.random() * 0.5 + 0.15,
      twinkleSpeed: Math.random() * 0.008 + 0.002,
      twinkleOffset: Math.random() * Math.PI * 2,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    }));

    let t = 0;
    const animate = () => {
      t++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const star of starsRef.current) {
        // Smooth twinkle using sine wave
        const twinkle = Math.sin(t * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.baseAlpha + twinkle * star.baseAlpha * 0.6;

        // Soft glow for bigger stars
        if (star.size > 1.2) {
          const glowRadius = star.size * 3;
          const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowRadius);
          gradient.addColorStop(0, star.color + (alpha * 0.3).toFixed(3) + ')');
          gradient.addColorStop(1, star.color + '0)');
          ctx.beginPath();
          ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Star dot
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color + alpha.toFixed(3) + ')';
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}
