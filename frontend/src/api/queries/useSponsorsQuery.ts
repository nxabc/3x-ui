import type { SponsorList } from '@/generated/types';

// Privacy Edition: never request commercial placement data, even from the panel.
const EMPTY: SponsorList = { sponsors: [] };

export function useSponsorsQuery() {
  return { data: EMPTY, fetched: true };
}
