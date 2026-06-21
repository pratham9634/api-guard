import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { useCountUp } from '../hooks/useCountUp';
import { Activity, Zap, Shield, Clock } from 'lucide-react';

const METRICS = [
  { icon: Activity, end: 10, suffix: 'M+', label: 'API Hits Tracked', color: '#4f46e5' },
  { icon: Zap, end: 50, prefix: '<', suffix: 'ms', label: 'Avg Processing Time', color: '#06b6d4' },
  { icon: Shield, end: 99, suffix: '.9%', label: 'Platform Uptime', color: '#10b981' },
  { icon: Clock, end: 5, suffix: ' sec', label: 'Setup Time', color: '#8b5cf6' },
];

function MetricCard({ icon: Icon, end, prefix = '', suffix = '', label, color, isInView, index }) {
  const display = useCountUp(end, { duration: 2000, shouldStart: isInView, prefix, suffix });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex flex-col items-center gap-3 p-8"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-1"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={24} style={{ color }} />
      </div>
      <div className="text-4xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
        {display}
      </div>
      <div className="text-sm text-text-secondary font-medium">
        {label}
      </div>
    </motion.div>
  );
}

export default function TrustedMetrics() {
  const [ref, isInView] = useInView({ threshold: 0.3 });

  return (
    <section ref={ref} className="py-20 relative">
      <div className="section-divider" />
      <div className="landing-container py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {METRICS.map((metric, i) => (
            <MetricCard key={metric.label} {...metric} isInView={isInView} index={i} />
          ))}
        </div>
      </div>
      <div className="section-divider" />
    </section>
  );
}
