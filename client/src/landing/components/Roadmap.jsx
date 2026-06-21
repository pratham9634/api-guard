import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { Bell, Gauge, Package, Wifi, Webhook, Monitor, Sparkles } from 'lucide-react';

const ROADMAP_ITEMS = [
  {
    icon: Bell,
    title: 'Custom Alert Rules',
    description: 'Set thresholds for error rates, latency spikes, and hit volume anomalies.',
    status: 'In Development',
    color: '#4f46e5',
  },
  {
    icon: Monitor,
    title: 'Uptime Monitoring',
    description: 'Synthetic checks to verify your API endpoints are responding correctly.',
    status: 'Planned',
    color: '#06b6d4',
  },
  {
    icon: Webhook,
    title: 'Webhook Integrations',
    description: 'Send alerts to Slack, Discord, Teams, PagerDuty, or any webhook endpoint.',
    status: 'Planned',
    color: '#8b5cf6',
  },
  {
    icon: Package,
    title: 'SDK & CLI',
    description: 'npm package and CLI tool for seamless integration into your CI/CD pipeline.',
    status: 'Planned',
    color: '#f59e0b',
  },
  {
    icon: Wifi,
    title: 'Real-time WebSockets',
    description: 'Live streaming dashboard with instant updates — no page refresh needed.',
    status: 'Planned',
    color: '#10b981',
  },
  {
    icon: Gauge,
    title: 'SLA Monitoring',
    description: 'Track SLA compliance with automated reporting and burn-rate alerts.',
    status: 'Exploring',
    color: '#ec4899',
  },
];

const STATUS_COLORS = {
  'In Development': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', dot: 'bg-indigo-400' },
  'Planned': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  'Exploring': { bg: 'bg-pink-500/10', text: 'text-pink-400', dot: 'bg-pink-400' },
};

export default function Roadmap() {
  const [ref, isInView] = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="py-24 relative">
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
            <Sparkles size={14} />
            Roadmap
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mb-4">
            What's <span className="gradient-text">Coming Next</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            We're building in the open. Here's what's on our radar.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {ROADMAP_ITEMS.map((item, i) => {
            const statusStyle = STATUS_COLORS[item.status];
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-surface-card border border-border rounded-2xl p-6
                         hover:border-border-light transition-colors duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <item.icon size={22} style={{ color: item.color }} />
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                               text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                    {item.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-text-primary mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
