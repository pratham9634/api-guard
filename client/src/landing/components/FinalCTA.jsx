import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FinalCTA() {
  const [ref, isInView] = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-24 relative">
      <div className="landing-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl gradient-mesh"
        >
          {/* Inner padding */}
          <div className="relative z-10 px-8 py-20 sm:px-16 sm:py-24 text-center">
            {/* Decorative glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          w-[400px] h-[400px] bg-accent-primary/10 rounded-full blur-[100px]
                          pointer-events-none" />

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="relative text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary
                       tracking-tight mb-6 max-w-3xl mx-auto leading-tight"
            >
              Start Monitoring Your{' '}
              <span className="gradient-text">APIs Today</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative text-lg text-text-secondary mb-10 max-w-xl mx-auto"
            >
              Join teams who trust API Guard to keep their APIs fast, reliable, and visible.
              Free to start — no credit card required.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/onboard"
                className="group inline-flex items-center justify-center gap-2.5 px-8 py-4
                         text-base font-semibold rounded-xl accent-gradient text-white
                         shadow-lg shadow-accent-primary/25 hover:shadow-xl
                         hover:shadow-accent-primary/30 transition-all duration-300"
              >
                Start Free
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4
                         text-base font-semibold rounded-xl border border-border
                         bg-surface-card/50 hover:bg-surface-card text-text-primary
                         backdrop-blur-sm transition-all duration-300"
              >
                Book a Demo
              </Link>
            </motion.div>
          </div>

          {/* Border */}
          <div className="absolute inset-0 rounded-3xl border border-border/50 pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}
