'use client';

import { usePathname } from 'next/navigation';
import JsonApiStickyPrompt from '@/app/components/JsonApiStickyPrompt';
import { jsonApiBridgeCopy } from '@/app/lib/seo/jsonApiInternalLinks';
import { bridgeSurfaceFromPathname } from '@/app/lib/seo/symbolRouteSurface';

type Props = {
  normalizedSymbol: string;
};

/**
 * Single sticky for all /s/[symbol]/* routes: path-aware `bridge_surface`, same ticker `bridge_hook`.
 */
export default function SovereignStickyPromptClient({ normalizedSymbol }: Props) {
  const pathname = usePathname() || '/';
  const surface = bridgeSurfaceFromPathname(pathname);
  const bridgeVariant = process.env.NEXT_PUBLIC_BRIDGE_CTA_VARIANT === 'B' ? 'B' : 'A';
  const jsonApiBridge = jsonApiBridgeCopy(normalizedSymbol, bridgeVariant);
  const sym = normalizedSymbol.toLowerCase();
  const utmSource = surface === 'json_api' ? 'json_api' : 'symbol_layout';
  const dashboardHref = `/dashboard?utm_source=${utmSource}&utm_medium=sticky_prompt&utm_campaign=activation&utm_content=${encodeURIComponent(sym)}`;

  return (
    <JsonApiStickyPrompt
      dashboardHref={dashboardHref}
      contextId={sym}
      bridgeVariant={bridgeVariant}
      bridgeHook={jsonApiBridge.hook}
      bridgeSurface={surface}
      pageSource={surface === 'json_api' ? 'json_api' : 'symbol_hub'}
    />
  );
}
