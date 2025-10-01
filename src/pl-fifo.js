export function fifoPL({ opens = [], buys = [], sells = [] }) {
  const q = [...opens, ...buys].sort((a,b)=>a.ts-b.ts).map(x => ({...x}));
  let realized = 0, fees = 0;
  for (const s of sells) {
    let remain = s.qty;
    while (remain > 0 && q.length) {
      const b = q[0];
      const take = Math.min(remain, b.qty);
      realized += (s.price - b.price) * take;
      fees += (b.fee || 0);
      b.qty -= take; remain -= take;
      if (b.qty === 0) q.shift();
    }
  }
  return { realizedBase: realized, feesBase: fees, explain: ["FIFO lots applied", `Fees included: ${fees}`] };
}
