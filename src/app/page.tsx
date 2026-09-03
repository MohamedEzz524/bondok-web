import HeroCarousel from '@/components/HeroCarousel';
import OrderButtons from '@/components/OrderButtons';
import Favorites from '@/components/Favorites';
import FeatureCards from '@/components/FeatureCards';

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <OrderButtons />
      <Favorites />
      <FeatureCards />
    </>
  );
}
