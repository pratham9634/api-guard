import { useTheme } from '../landing/hooks/useTheme';
import '../landing/styles/landing.css';

// Landing page sections
import Navbar from '../landing/components/Navbar';
import HeroSection from '../landing/components/HeroSection';
import TrustedMetrics from '../landing/components/TrustedMetrics';
import ProblemSolution from '../landing/components/ProblemSolution';
import FeaturesGrid from '../landing/components/FeaturesGrid';
import ProductDemo from '../landing/components/ProductDemo';
import HowItWorks from '../landing/components/HowItWorks';
import DeveloperExperience from '../landing/components/DeveloperExperience';
import ArchitectureDiagram from '../landing/components/ArchitectureDiagram';
import Roadmap from '../landing/components/Roadmap';
import Testimonials from '../landing/components/Testimonials';
import Pricing from '../landing/components/Pricing';
import FAQ from '../landing/components/FAQ';
import FinalCTA from '../landing/components/FinalCTA';
import Footer from '../landing/components/Footer';

export default function Landing() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="landing-page min-h-screen bg-surface-primary text-text-primary overflow-x-hidden">
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <main>
        <HeroSection />
        <TrustedMetrics />
        <ProblemSolution />
        <FeaturesGrid />
        <ProductDemo />
        <HowItWorks />
        <DeveloperExperience />
        <ArchitectureDiagram />
        <Roadmap />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
