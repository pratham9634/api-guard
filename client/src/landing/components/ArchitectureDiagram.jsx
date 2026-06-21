import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';

const NODES = [
  { id: 'app', label: 'Your Application', x: 50, y: 30, color: '#8b5cf6' },
  { id: 'api', label: 'Express API Server', x: 50, y: 120, color: '#4f46e5' },
  { id: 'rabbit', label: 'RabbitMQ Queue', x: 50, y: 210, color: '#f59e0b' },
  { id: 'consumer', label: 'Consumer Service', x: 50, y: 300, color: '#06b6d4' },
  { id: 'pg', label: 'PostgreSQL', x: 25, y: 390, color: '#3b82f6', sub: 'Time Series' },
  { id: 'mongo', label: 'MongoDB', x: 75, y: 390, color: '#10b981', sub: 'Documents' },
  { id: 'analytics', label: 'Analytics Engine', x: 50, y: 480, color: '#ec4899' },
  { id: 'dashboard', label: 'React Dashboard', x: 50, y: 570, color: '#4f46e5' },
];

const CONNECTIONS = [
  { from: 'app', to: 'api', label: 'POST /api/hit' },
  { from: 'api', to: 'rabbit', label: 'Publish Event' },
  { from: 'rabbit', to: 'consumer', label: 'Consume' },
  { from: 'consumer', to: 'pg', label: '' },
  { from: 'consumer', to: 'mongo', label: '' },
  { from: 'pg', to: 'analytics', label: '' },
  { from: 'mongo', to: 'analytics', label: '' },
  { from: 'analytics', to: 'dashboard', label: 'Query' },
];

export default function ArchitectureDiagram() {
  const [ref, isInView] = useInView({ threshold: 0.15 });

  return (
    <section id="architecture" ref={ref} className="py-24 relative">
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
            Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mb-4">
            Built for <span className="gradient-text">Scale & Reliability</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            An event-driven architecture powered by RabbitMQ ensures zero data loss
            and real-time processing at any scale.
          </p>
        </motion.div>

        {/* Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative flex flex-col items-center gap-4">
            {NODES.map((node, i) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                className="relative z-10 w-full max-w-xs"
              >
                {/* Connection arrow (except first and split nodes) */}
                {i > 0 && node.id !== 'pg' && node.id !== 'mongo' && (
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-px h-6 bg-gradient-to-b from-border to-border/50" />
                    <div className="w-2 h-2 border-r-2 border-b-2 border-border
                                transform rotate-45 -mt-1" />
                  </div>
                )}

                {/* Split connection for PG/Mongo */}
                {node.id === 'pg' && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-3/4 flex justify-between">
                    <div className="flex flex-col items-center">
                      <div className="w-px h-6 bg-border" />
                      <div className="w-2 h-2 border-r-2 border-b-2 border-border
                                  transform rotate-45 -mt-1" />
                    </div>
                  </div>
                )}

                <div
                  className="flex items-center gap-3 px-5 py-4 rounded-xl border
                           bg-surface-card hover:bg-surface-card-hover
                           transition-colors duration-200"
                  style={{ borderColor: `${node.color}30` }}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: node.color }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-text-primary">
                      {node.label}
                    </div>
                    {node.sub && (
                      <div className="text-xs text-text-tertiary">{node.sub}</div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Split row for PG + Mongo */}
            <style>{`
              .arch-split-row {
                display: none;
              }
            `}</style>
          </div>

          {/* Simplified vertical flow for better clarity */}
          <div className="mt-8 text-center">
            <p className="text-xs text-text-tertiary">
              Event-driven pipeline • Zero data loss • Horizontal scaling ready
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
