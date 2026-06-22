import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { useState } from 'react';
import RequestAccessModal from './RequestAccessModal';

/* ── Fake live dashboard data for the hero visual ── */
const FAKE_METRICS = [
  { label: 'Total Hits', value: '1.2M', trend: '+12.5%', color: '#4f46e5' },
  { label: 'Error Rate', value: '0.03%', trend: '-8.2%', color: '#10b981' },
  { label: 'Avg Latency', value: '42ms', trend: '-3.1%', color: '#06b6d4' },
  { label: 'Endpoints', value: '148', trend: '+5', color: '#8b5cf6' },
];

const FAKE_CHART_BARS = [85, 92, 78, 95, 88, 96, 82, 90, 94, 87, 91, 98];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function HeroSection() {
  const [showRequestModal, setShowRequestModal] = useState(false);

  return (
    <>
      <section className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 landing-grid-bg" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px]
                      bg-gradient-radial from-accent-primary/10 via-transparent to-transparent
                      blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px]
                      bg-gradient-radial from-cyan-500/5 via-transparent to-transparent
                      blur-3xl pointer-events-none" />

      <div className="landing-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Copy */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5
                          rounded-full border border-accent-primary/30 bg-accent-primary/5
                          text-accent-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
              Lightweight API Monitoring
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary
                       tracking-tight leading-[1.1] mb-6"
            >
              Track Every API Hit.{' '}
              <span className="gradient-text">Spot Issues Before Users Do.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-text-secondary leading-relaxed mb-10
                       max-w-xl mx-auto lg:mx-0"
            >
              Real-time API monitoring with hit tracking, latency analytics, error rate dashboards,
              and multi-tenant management — all in one lightweight platform.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4
                          justify-center lg:justify-start">
              <button
                onClick={() => setShowRequestModal(true)}
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5
                         text-base font-semibold rounded-xl accent-gradient text-white
                         shadow-lg shadow-accent-primary/25 hover:shadow-xl
                         hover:shadow-accent-primary/30 transition-all duration-300 cursor-pointer"
              >
                Request Access
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
              <Link
                to="/login"
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5
                         text-base font-semibold rounded-xl border border-border
                         bg-surface-card hover:bg-surface-card-hover text-text-primary
                         transition-all duration-300"
              >
                <Play size={16} className="text-accent-primary" />
                View Dashboard
              </Link>
            </motion.div>
          </motion.div>

          {/* Right — Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotateY: -5 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="relative"
          >
            {/* Main Dashboard Card */}
            <div className="glass-landing p-6 rounded-2xl shadow-2xl">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="text-xs text-text-tertiary font-mono">api-guard.io/dashboard</div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {FAKE_METRICS.map((m, i) => (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="bg-surface-secondary/50 rounded-xl p-3.5 border border-border/50"
                  >
                    <div className="text-xs text-text-tertiary mb-1">{m.label}</div>
                    <div className="text-xl font-bold text-text-primary">{m.value}</div>
                    <div className="text-xs font-medium mt-0.5"
                         style={{ color: m.trend.startsWith('-') && m.label !== 'Error Rate'
                           ? '#ef4444' : '#10b981' }}>
                      {m.trend}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Fake Chart */}
              <div className="bg-surface-secondary/30 rounded-xl p-4 border border-border/30">
                <div className="text-xs text-text-tertiary mb-3 font-medium">
                  API Hits — Last 12 Hours
                </div>
                <div className="flex items-end gap-1.5 h-24">
                  {FAKE_CHART_BARS.map((val, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${val}%` }}
                      transition={{ delay: 0.8 + i * 0.05, duration: 0.5, ease: 'easeOut' }}
                      className="flex-1 rounded-t-sm"
                      style={{
                        background: `linear-gradient(to top, rgba(79, 70, 229, 0.3), rgba(79, 70, 229, 0.8))`,
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-text-tertiary">12h ago</span>
                  <span className="text-[10px] text-text-tertiary">Now</span>
                </div>
              </div>
            </div>

            {/* Floating Metric Cards */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -right-4 glass-landing px-4 py-3 rounded-xl shadow-xl
                       border border-accent-primary/20"
            >
              <div className="text-xs text-text-tertiary">Active Now</div>
              <div className="text-lg font-bold text-accent-primary">2,847</div>
              <div className="text-[10px] text-emerald-400">● Live</div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-3 -left-4 glass-landing px-4 py-3 rounded-xl shadow-xl
                       border border-emerald-500/20"
            >
              <div className="text-xs text-text-tertiary">Uptime</div>
              <div className="text-lg font-bold text-emerald-400">99.98%</div>
              <div className="flex gap-0.5 mt-1">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="w-3 h-1.5 rounded-full bg-emerald-400/60" />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      </section>

      <RequestAccessModal 
        isOpen={showRequestModal} 
        onClose={() => setShowRequestModal(false)} 
      />
    </>
  );
}
