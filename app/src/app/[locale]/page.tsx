import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import HeroSlider from '@/components/HeroSlider';
import ContactStrip from '@/components/ContactStrip';
import AboutSection from '@/components/AboutSection';
import PromoSection from '@/components/PromoSection';
import FeaturedProducts from '@/components/FeaturedProducts';
import ServicesSection from '@/components/ServicesSection';
import BrandsSection from '@/components/BrandsSection';
import ClientsSection from '@/components/ClientsSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import StatsSection from '@/components/StatsSection';
import SiteFooter from '@/components/SiteFooter';
import ScrollReveal from '@/components/ScrollReveal';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <>
      <ScrollReveal />
      <TopBar />
      <Header />
      <HeroSlider />
      <ContactStrip />
      <AboutSection />
      <FeaturedProducts />
      <PromoSection />
      <ServicesSection />
      <BrandsSection />
      <ClientsSection />
      <TestimonialsSection />
      <StatsSection />
      <SiteFooter />
    </>
  );
}
