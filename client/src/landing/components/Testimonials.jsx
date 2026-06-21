import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Senior Backend Engineer',
    company: 'NovaPay',
    avatar: 'SC',
    color: '#4f46e5',
    quote: 'We replaced a bloated Grafana setup with API Guard and our team couldn\'t be happier. The dashboard is clean, the API key management is exactly what we needed, and setup took 5 minutes.',
    rating: 5,
  },
  {
    name: 'Marcus Rodriguez',
    role: 'CTO',
    company: 'FleetOps',
    avatar: 'MR',
    color: '#06b6d4',
    quote: 'The multi-tenant architecture is a game changer. We manage 12 client environments from a single dashboard. Latency monitoring caught a regression we would have missed for days.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'DevOps Lead',
    company: 'HealthStack',
    avatar: 'PS',
    color: '#10b981',
    quote: 'Finally, an API monitoring tool that doesn\'t require a PhD to configure. The RabbitMQ-based pipeline handles our 500K daily hits without breaking a sweat.',
    rating: 5,
  },
  {
    name: 'James Park',
    role: 'Full-Stack Developer',
    company: 'CodeCraft',
    avatar: 'JP',
    color: '#8b5cf6',
    quote: 'I integrated API Guard into our Express backend in under 10 minutes. The error rate analytics helped us identify a flaky database connection the same day.',
    rating: 5,
  },
  {
    name: 'Elena Kowalski',
    role: 'Engineering Manager',
    company: 'DataBridge',
    avatar: 'EK',
    color: '#f59e0b',
    quote: 'The time-range analytics are incredibly useful for sprint retrospectives. We can show stakeholders exactly how our API performance improved week over week.',
    rating: 5,
  },
];

export default function Testimonials() {
  const [ref, isInView] = useInView({ threshold: 0.15 });
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % TESTIMONIALS.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent(c => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  // Auto-advance
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      <div className="landing-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                        border border-accent-primary/30 bg-accent-primary/5
                        text-accent-primary text-sm font-medium mb-6">
            Testimonials
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mb-4">
            Loved by <span className="gradient-text">Engineering Teams</span>
          </h2>
        </motion.div>

        {/* Carousel */}
        <div
          className="max-w-3xl mx-auto relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-surface-card border border-border rounded-2xl p-8 sm:p-10 text-center"
          >
            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(TESTIMONIALS[current].rating)].map((_, i) => (
                <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
              ))}
            </div>

            {/* Quote */}
            <motion.blockquote
              key={current}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-lg sm:text-xl text-text-primary leading-relaxed mb-8
                       font-medium italic"
            >
              "{TESTIMONIALS[current].quote}"
            </motion.blockquote>

            {/* Author */}
            <motion.div
              key={`author-${current}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center justify-center gap-3"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white
                         text-sm font-bold"
                style={{ backgroundColor: TESTIMONIALS[current].color }}
              >
                {TESTIMONIALS[current].avatar}
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-text-primary">
                  {TESTIMONIALS[current].name}
                </div>
                <div className="text-xs text-text-secondary">
                  {TESTIMONIALS[current].role} at {TESTIMONIALS[current].company}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-border bg-surface-card
                       flex items-center justify-center hover:bg-surface-card-hover
                       transition-colors duration-200 cursor-pointer focus:outline-none"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={18} className="text-text-secondary" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer
                           focus:outline-none ${
                    i === current
                      ? 'bg-accent-primary w-6'
                      : 'bg-border hover:bg-border-light'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-border bg-surface-card
                       flex items-center justify-center hover:bg-surface-card-hover
                       transition-colors duration-200 cursor-pointer focus:outline-none"
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} className="text-text-secondary" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
