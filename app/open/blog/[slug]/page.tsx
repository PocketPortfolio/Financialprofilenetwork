export { default, generateMetadata } from '../../../blog/[slug]/page';

/** Open re-export does not inherit route segment config from app/blog/[slug]. */
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
