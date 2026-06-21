import { useState, useEffect } from 'react';

const CONFETTI_COLORS = ['#10b981','#34d399','#f59e0b','#a78bfa','#38bdf8','#f43f5e','#fbbf24','#6ee7b7'];

type ConfettiParticle = {
  id: number;
  x: number;
  y: number;
  color: string;
  fallX: string;
  fallY: string;
  spin: string;
  dur: string;
};

interface ConfettiBurstProps {
  active: boolean;
  onDone: () => void;
}

/**
 * ConfettiBurst Component
 * Generates an animated celebration burst of confetti particles from the center-top.
 */
export default function ConfettiBurst({ active, onDone }: ConfettiBurstProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (active) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 3;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setParticles(Array.from({ length: 80 }, (_, i) => ({
        id: i,
        x: cx + (Math.random() - 0.5) * 60,
        y: cy + (Math.random() - 0.5) * 30,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        fallX: `${(Math.random() - 0.5) * 320}px`,
        fallY: `${120 + Math.random() * 280}px`,
        spin: `${(Math.random() - 0.5) * 720}deg`,
        dur: `${0.8 + Math.random() * 0.7}s`,
      })));
    } else {
      setParticles([]);
    }
  }, [active]);

  if (!active || particles.length === 0) return null;

  return (
    <>
      {particles.map(p => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: p.x,
            top: p.y,
            background: p.color,
            ['--fall-x' as string]: p.fallX,
            ['--fall-y' as string]: p.fallY,
            ['--spin' as string]: p.spin,
            ['--duration' as string]: p.dur,
          }}
          onAnimationEnd={p.id === 0 ? onDone : undefined}
        />
      ))}
    </>
  );
}
