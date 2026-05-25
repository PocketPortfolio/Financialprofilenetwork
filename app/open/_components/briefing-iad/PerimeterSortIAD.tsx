'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ACCENT, COMPLIANCE_LOCKOUT, MONO, MUTED, OBSIDIAN } from './constants';

type PacketKind = 'pii' | 'aggregate';

interface Packet {
  id: number;
  x: number;
  y: number;
  kind: PacketKind;
  speed: number;
}

const GATE_X_RATIO = 0.38;
const GATE_W_RATIO = 0.24;

/** IAD 2 — Perimeter Sort: burn PII at edge, pass aggregates through gate. */
export default function PerimeterSortIAD() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lockout, setLockout] = useState(false);
  const [running, setRunning] = useState(true);
  const stateRef = useRef<{ packets: Packet[]; id: number; frame: number }>({
    packets: [],
    id: 0,
    frame: 0,
  });

  const spawn = useCallback((w: number) => {
    const kind: PacketKind = Math.random() > 0.45 ? 'pii' : 'aggregate';
    stateRef.current.packets.push({
      id: ++stateRef.current.id,
      x: Math.random() * (w - 24) + 12,
      y: -20,
      kind,
      speed: 1.2 + Math.random() * 1.8,
    });
  }, []);

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
      if (!running) {
        raf = requestAnimationFrame(loop);
        return;
      }
      const w = canvas.width / devicePixelRatio;
      const h = canvas.height / devicePixelRatio;
      const dpr = devicePixelRatio;
      const gateX = w * GATE_X_RATIO;
      const gateW = w * GATE_W_RATIO;
      const gateY = h * 0.78;

      stateRef.current.frame++;
      if (stateRef.current.frame % 45 === 0) spawn(w);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = OBSIDIAN;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(245,158,11,0.45)';
      ctx.lineWidth = 2;
      ctx.strokeRect(gateX, gateY, gateW, h - gateY - 8);
      ctx.fillStyle = 'rgba(245,158,11,0.08)';
      ctx.fillRect(gateX, gateY, gateW, h - gateY - 8);
      ctx.font = `9px ${MONO}`;
      ctx.fillStyle = ACCENT;
      ctx.fillText('INFERENCE GATE', gateX + 6, gateY - 6);

      const next: Packet[] = [];
      for (const p of stateRef.current.packets) {
        p.y += p.speed;
        const r = 10;

        if (p.kind === 'pii') {
          ctx.fillStyle = 'rgba(239,68,68,0.85)';
          ctx.shadowColor = 'rgba(239,68,68,0.5)';
        } else {
          ctx.fillStyle = ACCENT;
          ctx.shadowColor = ACCENT;
        }
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.rect(p.x - r, p.y - r, r * 2, r * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        const inGate = p.y > gateY && p.x > gateX && p.x < gateX + gateW;

        if (inGate && p.kind === 'pii') {
          setLockout(true);
          setRunning(false);
          setTimeout(() => {
            setLockout(false);
            setRunning(true);
            stateRef.current.packets = [];
          }, 2200);
        } else if (inGate && p.kind === 'aggregate') {
          setScore((s) => s + 1);
        } else if (p.y < h + 20) {
          next.push(p);
        }
      }
      stateRef.current.packets = next;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [running, spawn]);

  const onPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    stateRef.current.packets = stateRef.current.packets.filter((p) => {
      if (p.kind !== 'pii') return true;
      const hit = Math.hypot(p.x - x, p.y - y) < 28;
      return !hit;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 4 }}>
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <canvas
          ref={canvasRef}
          onPointerDown={onPointer}
          style={{
            width: '100%',
            height: '100%',
            touchAction: 'none',
            borderRadius: 4,
            border: '1px solid rgba(245,158,11,0.25)',
            cursor: 'crosshair',
          }}
        />
        {lockout && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(127,29,29,0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 12,
              textAlign: 'center',
              fontFamily: MONO,
              fontSize: 'clamp(8px, 1.4vw, 11px)',
              color: '#fecaca',
              fontWeight: 700,
            }}
          >
            COMPLIANCE LOCKOUT
            <br />
            {COMPLIANCE_LOCKOUT}
          </div>
        )}
      </div>
      <p style={{ margin: 0, fontFamily: MONO, fontSize: 'clamp(6px, 1vw, 8px)', color: MUTED }}>
        Tap red PII packets to burn at edge · amber aggregates through gate · score {score}
      </p>
    </div>
  );
}
