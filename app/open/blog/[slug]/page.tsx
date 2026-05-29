export { default, generateMetadata, generateStaticParams } from '../../../blog/[slug]/page';

/** Must match app/blog/[slug]/page.tsx — Open re-export does not inherit route segment config. */
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
