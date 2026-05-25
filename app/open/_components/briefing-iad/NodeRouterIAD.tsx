'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ACCENT, MONO, MUTED, OBSIDIAN } from './constants';

const COLS = 7;
const ROWS = 5;

/** Grid edges: user toggles perimeter vs cloud paths. */
export default function NodeRouterIAD() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [usePerimeter, setUsePerimeter] = useState(true);
  const [budget, setBudget] = useState(100);
  const [throughput, setThroughput] = useState(0);
  const pulseRef = useRef({ t: 0, x: 0, y: 0 });

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, dpr: number) => {
      const cellW = w / (COLS + 1);
      const cellH = h / (ROWS + 1);
      const ox = cellW * 0.5;
      const oy = cellH * 0.5;

      const node = (c: number, r: number) => ({
        x: ox + c * cellW,
        y: oy + r * cellH,
      });

      const origin = node(0, 2);
      const dest = node(COLS - 1, 2);
      const cloud = node(Math.floor(COLS / 2), Math.floor(ROWS / 2));

      ctx.fillStyle = OBSIDIAN;
      ctx.fillRect(0, 0, w, h);

      const path = usePerimeter
        ? [origin, node(0, 0), node(COLS - 1, 0), node(COLS - 1, 2), dest]
        : [origin, cloud, dest];

      ctx.strokeStyle = usePerimeter ? 'rgba(245,158,11,0.35)' : 'rgba(161,161,170,0.2)';
      ctx.lineWidth = 1.5 * dpr;
      for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS; r++) {
          const n = node(c, r);
          ctx.strokeRect(n.x - 8 * dpr, n.y - 8 * dpr, 16 * dpr, 16 * dpr);
        }
      }

      ctx.beginPath();
      path.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.strokeStyle = usePerimeter ? ACCENT : 'rgba(239,68,68,0.6)';
      ctx.lineWidth = 2.5 * dpr;
      ctx.stroke();

      ctx.fillStyle = 'rgba(239,68,68,0.15)';
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, 22 * dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = MUTED;
      ctx.font = `${8 * dpr}px ${MONO}`;
      ctx.fillText('CLOUD', cloud.x - 18 * dpr, cloud.y + 3 * dpr);

      const pulse = pulseRef.current;
      const seg = usePerimeter ? 4 : 2;
      const prog = (pulse.t % 120) / 120;
      const idx = Math.min(seg - 1, Math.floor(prog * seg));
      const local = (prog * seg) % 1;
      const a = path[idx];
      const b = path[idx + 1] ?? dest;
      pulse.x = a.x + (b.x - a.x) * local;
      pulse.y = a.y + (b.y - a.y) * local;

      ctx.fillStyle = ACCENT;
      ctx.shadowColor = ACCENT;
      ctx.shadowBlur = 12 * dpr;
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, 6 * dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = ACCENT;
      ctx.font = `${9 * dpr}px ${MONO}`;
      ctx.fillText('ORIGIN', origin.x - 20 * dpr, origin.y + 24 * dpr);
      ctx.fillText('DEST', dest.x - 14 * dpr, dest.y + 24 * dpr);
    },
    [usePerimeter]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * devicePixelRatio);
      canvas.height = Math.floor(rect.height * devicePixelRatio);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const loop = () => {
      pulseRef.current.t++;
      if (pulseRef.current.t % 120 === 0) {
        setThroughput((t) => t + 1);
        if (!usePerimeter) setBudget((b) => Math.max(0, b - 18));
        else setBudget((b) => Math.min(100, b + 2));
      }
      const w = canvas.width / devicePixelRatio;
      const h = canvas.height / devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      draw(ctx, w, h, 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [draw, usePerimeter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 6 }}>
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 4,
            border: '1px solid rgba(245,158,11,0.25)',
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
          fontFamily: MONO,
          fontSize: 'clamp(6px, 1vw, 8px)',
        }}
      >
        <button
          type="button"
          onClick={() => {
            setUsePerimeter(true);
            setBudget((b) => Math.min(100, b + 5));
          }}
          style={{
            padding: '5px 10px',
            background: usePerimeter ? 'rgba(245,158,11,0.2)' : 'transparent',
            border: `1px solid ${usePerimeter ? ACCENT : 'rgba(161,161,170,0.4)'}`,
            color: usePerimeter ? ACCENT : MUTED,
            borderRadius: 4,
            cursor: 'pointer',
            fontFamily: MONO,
            fontSize: 'inherit',
          }}
        >
          Perimeter nodes
        </button>
        <button
          type="button"
          onClick={() => setUsePerimeter(false)}
          style={{
            padding: '5px 10px',
            background: !usePerimeter ? 'rgba(239,68,68,0.15)' : 'transparent',
            border: `1px solid ${!usePerimeter ? 'rgba(239,68,68,0.6)' : 'rgba(161,161,170,0.4)'}`,
            color: !usePerimeter ? '#fca5a5' : MUTED,
            borderRadius: 4,
            cursor: 'pointer',
            fontFamily: MONO,
            fontSize: 'inherit',
          }}
        >
          Centralized cloud
        </button>
        <span style={{ color: MUTED }}>
          Budget {budget}% · pulses {throughput}
        </span>
      </div>
    </div>
  );
}
