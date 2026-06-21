import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import {
  Activity, AlertTriangle, Clock, BarChart3,
  Building2, KeyRound, Shield, TrendingUp
} from 'lucide-react';

const FEATURES = [
  {
    icon: Activity,
    title: 'Real-Time Hit Tracking',
    description: 'Monitor every API call with method, endpoint, status code, and latency — as it happens.',
    color: '#4f46e5',
  },
  {
    icon: AlertTriangle,
    title: 'Error Rate Analytics',
    description: 'Instant error/success ratio with time-series breakdown. Spot failure patterns before they escalate.',
    color: '#ef4444',
  },
  {
    icon: Clock,
    title: 'Latency Monitoring',
    description: 'Track average response times across all endpoints over configurable time ranges.',
    color: '#06b6d4',
  },
  {
    icon: BarChart3,
    title: 'Top Endpoints Dashboard',
    description: 'See your busiest and most error-prone endpoints at a glance with comparative charts.',
    color: '#10b981',
  },
  {
    icon: Building2,
    title: 'Multi-Tenant Architecture',
    description: 'Manage multiple client organizations from a single platform with isolated data.',
    color: '#8b5cf6',
  },
  {
    icon: KeyRound,
    title: 'API Key Management',
    description: 'Create, rotate, revoke keys per environment — production, staging, development, testing.',
    color: '#f59e0b',
  },
  {
    icon: Shield,
    title: 'Role-Based Access Control',
    description: 'Super Admin, Client Admin, and Client Viewer roles with granular permission controls.',
    color: '#ec4899',
  },
  {
    icon: TrendingUp,
    title: 'Time Range Analytics',
    description: 'Analyze trends across 1 hour, 6 hours, 24 hours, 7 days, or 30 days with a single click.',
    color: '#14b8a6',
  },
];

export default function FeaturesGrid() {
  const [ref, isInView] = useInView({ threshold: 0.1 });

  return (
    <section id="features" ref={ref} className="py-24 relative">
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
            Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mb-4">
            Everything You Need to{' '}
            <span className="gradient-text">Monitor Your APIs</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            A complete API monitoring toolkit — lightweight enough to get started in minutes,
            powerful enough to scale with your team.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 25 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="feature-card bg-surface-card border border-border rounded-2xl p-6
                       cursor-default group"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4
                         transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${feature.color}15` }}
              >
                <feature.icon size={22} style={{ color: feature.color }} />
              </div>
              <h3 className="text-base font-bold text-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
