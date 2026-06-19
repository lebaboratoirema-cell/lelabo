import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import HeroSlider from '@/components/HeroSlider';
import ContactStrip from '@/components/ContactStrip';
import AboutSection from '@/components/AboutSection';
import PromoSection from '@/components/PromoSection';
import ServicesSection from '@/components/ServicesSection';
import BrandsSection from '@/components/BrandsSection';
import StatsSection from '@/components/StatsSection';
import SiteFooter from '@/components/SiteFooter';
import ScrollReveal from '@/components/ScrollReveal';

export default function HomePage() {
  return (
    <>
      <ScrollReveal />
      <TopBar />
      <Header />
      <HeroSlider />
      <ContactStrip />
      <AboutSection />
      <PromoSection />
      <ServicesSection />
      <BrandsSection />
      <StatsSection />
      <SiteFooter />
    </>
  );
}
