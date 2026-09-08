import type { Metadata } from 'next';
import BranchesView from '@/components/BranchesView';

export const metadata: Metadata = {
  title: 'Our Branches — Bondok Fried Chicken',
  description: 'Find your nearest Bondok branch - locations, pickup, and live availability.',
};

/* Layout per the designer's approved Branches design. Display data is
   sample until client branch data / Cloud-Kitchen API arrives. */
export default function Page() {
  return <BranchesView />;
}
