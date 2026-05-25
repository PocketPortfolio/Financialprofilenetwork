'use client';

import { useCallback, useMemo, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import { ACCENT, MONO, MUTED, OBSIDIAN, TEXT } from './constants';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

function pieceGlyph(piece: { type: string; color: string } | undefined): string {
  if (!piece) return '';
  const map: Record<string, Record<string, string>> = {
    w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
    b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
  };
  return map[piece.color]?.[piece.type] ?? '';
}

/** IAD 1 — Stateless Chess: client FEN + demo stateless payload HUD (no live API). */
export default function StatelessChessIAD() {
  const [game, setGame] = useState(() => new Chess());
  const [selected, setSelected] = useState<Square | null>(null);
  const [lastPayload, setLastPayload] = useState<string | null>(null);
  const [status, setStatus] = useState('Select an amber piece · demo mode');

  const fen = game.fen();
  const board = game.board();

  const legalFrom = useMemo(() => {
    if (!selected) return new Set<string>();
    return new Set(
      game.moves({ square: selected, verbose: true }).map((m) => m.to as string)
    );
  }, [game, selected]);

  const emitPayload = useCallback((next: Chess, label: string) => {
    const f = next.fen();
    setLastPayload(
      JSON.stringify(
        { demo: true, route: 'POST /api/ai/chat', context: { fen: f }, memory: null },
        null,
        0
      )
    );
    setStatus(label);
  }, []);

  const machineReply = useCallback((current: Chess) => {
    const moves = current.moves({ verbose: true });
    if (moves.length === 0) return current;
    const pick = moves[Math.floor(Math.random() * moves.length)];
    const next = new Chess(current.fen());
    next.move({ from: pick.from, to: pick.to, promotion: 'q' });
    return next;
  }, []);

  const onSquare = (sq: Square) => {
    if (game.isGameOver()) return;

    const piece = game.get(sq);
    if (selected) {
      try {
        const next = new Chess(game.fen());
        const move = next.move({ from: selected, to: sq, promotion: 'q' });
        if (!move) {
          if (piece?.color === 'w') setSelected(sq);
          else setSelected(null);
          return;
        }
        setSelected(null);
        emitPayload(next, 'Your move · FEN compressed client-side');
        const afterMachine = machineReply(next);
        setGame(afterMachine);
        emitPayload(afterMachine, 'Machine reply · stateless round-trip (demo engine)');
        if (afterMachine.isGameOver()) setStatus('Game over · zero server memory retained');
      } catch {
        setSelected(piece?.color === 'w' ? sq : null);
      }
      return;
    }
    if (piece?.color === 'w') setSelected(sq);
  };

  const reset = () => {
    const fresh = new Chess();
    setGame(fresh);
    setSelected(null);
    setLastPayload(null);
    setStatus('Select an amber piece · demo mode');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 6 }}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          gap: 8,
          minHeight: 0,
          alignItems: 'stretch',
        }}
      >
        <div
          style={{
            flex: '1 1 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gridTemplateRows: 'repeat(8, 1fr)',
            border: `1px solid rgba(245,158,11,0.35)`,
            borderRadius: 4,
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          {board.map((row, ri) =>
            row.map((cell, ci) => {
              const sq = `${FILES[ci]}${8 - ri}` as Square;
              const dark = (ri + ci) % 2 === 1;
              const isSel = selected === sq;
              const isTarget = legalFrom.has(sq);
              const isWhite = cell?.color === 'w';
              return (
                <button
                  key={sq}
                  type="button"
                  onClick={() => onSquare(sq)}
                  aria-label={`square ${sq}`}
                  style={{
                    border: 'none',
                    margin: 0,
                    padding: 0,
                    cursor: 'pointer',
                    background: isSel
                      ? 'rgba(245,158,11,0.35)'
                      : isTarget
                        ? 'rgba(245,158,11,0.12)'
                        : dark
                          ? '#141416'
                          : OBSIDIAN,
                    color: isWhite ? ACCENT : '#52525b',
                    fontSize: 'clamp(10px, 2.2vw, 16px)',
                    lineHeight: 1,
                    fontFamily: MONO,
                    textShadow: isWhite ? `0 0 8px ${ACCENT}` : undefined,
                  }}
                >
                  {pieceGlyph(cell ?? undefined)}
                </button>
              );
            })
          )}
        </div>
        <div
          style={{
            flex: '0 0 38%',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            fontFamily: MONO,
            fontSize: 'clamp(6px, 1.1vw, 8px)',
          }}
        >
          <p style={{ margin: 0, color: ACCENT, fontWeight: 700, letterSpacing: '0.06em' }}>
            STATELESS PAYLOAD
          </p>
          <p style={{ margin: 0, color: MUTED, lineHeight: 1.35 }}>{status}</p>
          <pre
            style={{
              margin: 0,
              flex: 1,
              padding: 6,
              background: 'rgba(0,0,0,0.45)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 4,
              color: TEXT,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              fontSize: 'inherit',
            }}
          >
            {lastPayload ?? `{ fen: "${fen.split(' ')[0]}…", memory: ∅ }`}
          </pre>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '4px 8px',
              fontSize: 'inherit',
              fontFamily: MONO,
              background: 'transparent',
              border: `1px solid rgba(245,158,11,0.4)`,
              color: ACCENT,
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Reset board
          </button>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 'clamp(6px, 1vw, 7px)', color: MUTED, fontFamily: MONO }}>
        Demo · client-side engine · no production inference on public landing
      </p>
    </div>
  );
}
