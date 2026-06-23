import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTheme } from '../landing/hooks/useTheme';
import '../landing/styles/landing.css';

gsap.registerPlugin(ScrollTrigger);

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
import PlaygroundPreview from '../landing/components/PlaygroundPreview';
import Roadmap from '../landing/components/Roadmap';
import Testimonials from '../landing/components/Testimonials';
import Pricing from '../landing/components/Pricing';
import FAQ from '../landing/components/FAQ';
import FinalCTA from '../landing/components/FinalCTA';
import Footer from '../landing/components/Footer';

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const containerRef = useRef(null);

  // Initialize Lenis Smooth Scroll & Sync with GSAP Ticker
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.075, // Silky smooth deceleration
      smoothWheel: true,
      wheelMultiplier: 1.15,
      touchMultiplier: 1.5,
    });

    // Notify ScrollTrigger to update on every scroll event
    lenis.on('scroll', ScrollTrigger.update);

    // Sync Lenis RAF with GSAP Ticker for frame-perfect animations
    const tickHandler = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickHandler);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickHandler);
    };
  }, []);

  // Track Mouse Movement for Spotlight Effect
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      container.style.setProperty('--mouse-x', `${x}px`);
      container.style.setProperty('--mouse-y', `${y}px`);
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="landing-page min-h-screen bg-surface-primary text-text-primary overflow-x-hidden relative"
    >
      {/* Premium Visual Layers */}
      <div className="noise-bg" />
      <div className="mouse-glow-bg" />

      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <main className="relative z-10">
        <HeroSection />
        <TrustedMetrics />
        <ProblemSolution />
        <ArchitectureDiagram />
        <FeaturesGrid />
        <PlaygroundPreview />
        <ProductDemo />
        <Pricing />
        <Roadmap />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
