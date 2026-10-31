import type { Metadata } from 'next';
import { OPEN_URLS, PERSON_ABBA, SURFACE_ORG } from '../../../../lib/canonical-claims';
import { openPageSocial } from '../../shared-metadata';

export { default } from '../../../press/abba-lawal/page';

export const metadata: Metadata = {
  title: `${PERSON_ABBA.name} · Founder · ${SURFACE_ORG.open.name}`,
  description: PERSON_ABBA.description,
  alternates: { canonical: OPEN_URLS.personAbba },
  ...openPageSocial({
    title: `${PERSON_ABBA.name} · Founder | ${SURFACE_ORG.open.name}`,
    description: PERSON_ABBA.description,
    url: OPEN_URLS.personAbba,
    type: 'profile',
  }),
};
