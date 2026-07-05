import SEO from '../components/SEO';
import HeroSection from '../features/public/HeroSection';
import AboutSection from '../features/public/AboutSection';
import WhyChooseUs from '../features/public/WhyChooseUs';
import ServicesSection from '../features/public/ServicesSection';
import DoctorsSection from '../features/public/DoctorsSection';
import DepartmentsSection from '../features/public/DepartmentsSection';
import FacilitiesSection from '../features/public/FacilitiesSection';
import TestimonialsSection from '../features/public/TestimonialsSection';
import FAQSection from '../features/public/FAQSection';
import GallerySection from '../features/public/GallerySection';
import NewsSection from '../features/public/NewsSection';
import AppointmentSection from '../features/public/AppointmentSection';
import ContactSection from '../features/public/ContactSection';

const HomePage = () => (
  <>
    <SEO
      title="Home"
      description="Mechi Clinic - Trusted Healthcare for Every Family. Book appointments, view services, and meet our expert doctors."
    />
    <HeroSection />
    <AboutSection />
    <WhyChooseUs />
    <ServicesSection />
    <DoctorsSection />
    <DepartmentsSection />
    <FacilitiesSection />
    <TestimonialsSection />
    <FAQSection />
    <GallerySection />
    <NewsSection />
    <AppointmentSection />
    <ContactSection />
  </>
);

export default HomePage;
