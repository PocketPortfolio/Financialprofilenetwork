import type { Metadata } from 'next';
import BlogPage from '../../blog/page';
import { OPEN_URLS, SURFACE_ORG } from '../../../lib/canonical-claims';

export const metadata: Metadata = {
  title: 'Engineering & Research Blog',
  description:
    'Technical deep-dives on sovereign finance, local-first architecture, and stateless inference from Open Portfolio.',
  alternates: { canonical: `${OPEN_URLS.home}/blog` },
  openGraph: {
    title: 'Open Portfolio Blog',
    description: SURFACE_ORG.open.description,
    url: `${OPEN_URLS.home}/blog`,
    siteName: SURFACE_ORG.open.name,
  },
};

export default BlogPage;
