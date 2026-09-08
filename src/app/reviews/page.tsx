import type { Metadata } from 'next';
import ReviewsView from '@/components/ReviewsView';

export const metadata: Metadata = {
  title: 'Reviews — Bondok Fried Chicken',
  description: 'What people say about Bondok - real reviews, video reactions, and community moments.',
};

/* Layout per the designer's approved Reviews design. Review content is
   sample data until Google Reviews connect; videos/photos are client files. */
export default function Page() {
  return <ReviewsView />;
}
