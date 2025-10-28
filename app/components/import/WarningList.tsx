'use client';
export function WarningList({ warnings }:{ warnings: string[] }) {
  if (!warnings?.length) return null;
  return (
    <details className="border rounded p-2 bg-yellow-50 text-yellow-900">
      <summary className="cursor-pointer">Warnings ({warnings.length})</summary>
      <ul className="list-disc ml-6 mt-2 text-sm">
        {warnings.slice(0,50).map((w,i) => <li key={i}>{w}</li>)}
      </ul>
    </details>
  );
}






