/**
 * Pocket Ask AI — curated desk actions (guided prompts over raw chat).
 * Same inference path: buildPortfolioContext → /api/ai/chat.
 * Claim-safe: conversation points only; no personal tax/advice.
 */

export type DeskActionId =
  | 'concentration'
  | 'allocation'
  | 'risk_narrative'
  | 'review_prep'
  | 'what_changed';

export type DeskAction = {
  id: DeskActionId;
  label: string;
  shortHint: string;
  /** Full prompt sent to /api/ai/chat (user bubble shows `label`). */
  prompt: string;
};

const PROMPT_GUARD =
  'Use only the portfolio context provided with this request. Reply in clear Markdown (short sections, bullets). Do not give personal investment, tax, or regulated advice — frame outputs as analytical observations and conversation points for a human advisor review. If context is thin, say what is missing instead of inventing numbers.';

export const DESK_ACTIONS: readonly DeskAction[] = [
  {
    id: 'concentration',
    label: 'Concentration',
    shortHint: 'Single-name and top-holding risk',
    prompt: `${PROMPT_GUARD}

Task: Concentration review.
From the portfolio context, identify the largest holdings and any material single-name or sector concentration. Quantify approximate weights where the context supports it. Flag conversation points an advisor might raise before a review (e.g. liquidity event overhang, block-sale considerations) without recommending a trade.`,
  },
  {
    id: 'allocation',
    label: 'Allocation',
    shortHint: 'Asset and region mix',
    prompt: `${PROMPT_GUARD}

Task: Allocation snapshot.
Summarise how the book is allocated across asset classes, regions, and any other mix dimensions present in the context. Call out what is driving the overall shape of the portfolio. Keep it desk-ready and concise.`,
  },
  {
    id: 'risk_narrative',
    label: 'Risk narrative',
    shortHint: 'What could go wrong',
    prompt: `${PROMPT_GUARD}

Task: Risk narrative for a client review.
In plain language, describe the main risks visible in this book (market, concentration, currency, liquidity, or structural). Prioritise highest-signal risks. End with 3–5 conversation points — not product recommendations.`,
  },
  {
    id: 'review_prep',
    label: 'Review prep',
    shortHint: 'Talking points for a meeting',
    prompt: `${PROMPT_GUARD}

Task: Client review prep.
Produce 5–7 talking points an advisor could use in an upcoming review meeting, grounded only in the portfolio context. Order by importance. Each point: one sentence observation + why it matters in the room. No personal advice; no tax.`,
  },
  {
    id: 'what_changed',
    label: 'What stands out',
    shortHint: 'Highest-signal quirks',
    prompt: `${PROMPT_GUARD}

Task: What stands out.
Scan the bounded portfolio summary for the highest-signal quirks, imbalances, or notable patterns. List 4–6 observations ranked by how likely they are to matter in a desk conversation. Skip generic market commentary unless tied to this book.`,
  },
] as const;

/** Brewin pilot: pin concentration + review_prep to the front of the chip row. */
const BREWIN_PINNED: readonly DeskActionId[] = ['concentration', 'review_prep'];

export function getDeskActions(options?: { brewinPilot?: boolean }): DeskAction[] {
  const list = [...DESK_ACTIONS];
  if (!options?.brewinPilot) return list;
  const pinned = new Set(BREWIN_PINNED);
  const head = BREWIN_PINNED.map((id) => list.find((a) => a.id === id)).filter(
    (a): a is DeskAction => !!a
  );
  const tail = list.filter((a) => !pinned.has(a.id));
  return [...head, ...tail];
}

export function getDeskAction(id: DeskActionId): DeskAction | undefined {
  return DESK_ACTIONS.find((a) => a.id === id);
}
