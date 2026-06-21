import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { LayoutDashboard, BarChart3, Building2, KeyRound } from 'lucide-react';

const TABS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    content: {
      title: 'Real-Time Overview',
      description: 'See your API performance at a glance with live stat cards, top endpoints, and activity charts.',
      stats: [
        { label: 'Total Hits', value: '1,247,839', color: '#4f46e5' },
        { label: 'Error Rate', value: '0.12%', color: '#ef4444' },
        { label: 'Avg Latency', value: '38ms', color: '#06b6d4' },
        { label: 'Endpoints', value: '64', color: '#8b5cf6' },
      ],
      chart: 'bar',
    },
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    content: {
      title: 'Deep Dive Analytics',
      description: 'Hits, errors, and latency over time with configurable time ranges from 1 hour to 30 days.',
      stats: [
        { label: 'Peak Hits/min', value: '4,218', color: '#4f46e5' },
        { label: 'P95 Latency', value: '124ms', color: '#f59e0b' },
        { label: 'Success Rate', value: '99.88%', color: '#10b981' },
        { label: 'Services', value: '12', color: '#8b5cf6' },
      ],
      chart: 'line',
    },
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: Building2,
    content: {
      title: 'Multi-Tenant Management',
      description: 'Onboard client organizations, manage their users, and view per-client analytics.',
      table: [
        { name: 'Acme Corp', slug: 'acme-corp', status: 'Active', users: 8 },
        { name: 'Globex Inc', slug: 'globex-inc', status: 'Active', users: 5 },
        { name: 'Initech', slug: 'initech', status: 'Active', users: 12 },
      ],
    },
  },
  {
    id: 'keys',
    label: 'API Keys',
    icon: KeyRound,
    content: {
      title: 'Key Lifecycle Management',
      description: 'Create, rotate, revoke, and delete API keys across production, staging, and dev environments.',
      keys: [
        { name: 'Production Key', env: 'production', status: 'Active', id: 'ak_prod_x8f2...' },
        { name: 'Staging Key', env: 'staging', status: 'Active', id: 'ak_stg_m3k9...' },
        { name: 'Dev Key', env: 'development', status: 'Revoked', id: 'ak_dev_p7n1...' },
      ],
    },
  },
];

/* ── Fake chart SVGs ── */
function BarChartMock() {
  const bars = [65, 82, 45, 90, 73, 95, 68, 88, 78, 92];
  return (
    <div className="flex items-end gap-2 h-32 px-4 pt-4">
      {bars.map((val, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${val}%` }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
          className="flex-1 rounded-t-md bg-gradient-to-t from-indigo-600/40 to-indigo-500/80"
        />
      ))}
    </div>
  );
}

function LineChartMock() {
  const points = '20,80 60,60 100,70 140,30 180,45 220,25 260,40 300,20 340,35 380,15';
  return (
    <svg viewBox="0 0 400 100" className="w-full h-32" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(79,70,229,0.3)" />
          <stop offset="100%" stopColor="rgba(79,70,229,0)" />
        </linearGradient>
      </defs>
      <motion.polygon
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        points={`0,100 ${points} 400,100`}
        fill="url(#lineGrad)"
      />
      <motion.polyline
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.2, duration: 1, ease: 'easeOut' }}
        points={points}
        fill="none"
        stroke="#4f46e5"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TableMock({ rows, columns }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/50">
      <div className="grid gap-px bg-border/30">
        <div className="grid bg-surface-secondary/50 px-4 py-2.5"
             style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
          {columns.map(col => (
            <div key={col} className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
              {col}
            </div>
          ))}
        </div>
        {rows.map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="grid bg-surface-card/30 px-4 py-3"
            style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
          >
            {Object.values(row).map((val, j) => (
              <div key={j} className="text-sm text-text-secondary">
                {val === 'Active' ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {val}
                  </span>
                ) : val === 'Revoked' ? (
                  <span className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {val}
                  </span>
                ) : (
                  val
                )}
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function ProductDemo() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ref, isInView] = useInView({ threshold: 0.15 });
  const tab = TABS.find(t => t.id === activeTab);

  return (
    <section ref={ref} className="py-24 relative">
      <div className="landing-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                        border border-accent-primary/30 bg-accent-primary/5
                        text-accent-primary text-sm font-medium mb-6">
            Product Preview
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mb-4">
            See It in Action
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            A dashboard that's powerful enough for DevOps teams, simple enough for everyone.
          </p>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-landing rounded-2xl overflow-hidden shadow-2xl max-w-5xl mx-auto"
        >
          {/* Browser Chrome */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border/30">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-1 rounded-md bg-surface-secondary/50 text-xs text-text-tertiary
                            font-mono border border-border/30">
                api-guard.io/dashboard
              </div>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex border-b border-border/30 px-5 relative">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium
                         transition-colors duration-200 relative cursor-pointer focus:outline-none
                         ${activeTab === t.id
                           ? 'text-accent-primary'
                           : 'text-text-tertiary hover:text-text-secondary'}`}
              >
                <t.icon size={16} />
                {t.label}
                {activeTab === t.id && (
                  <motion.div
                    layoutId="demo-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 min-h-[360px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-text-primary mb-1">{tab.content.title}</h3>
                  <p className="text-sm text-text-secondary">{tab.content.description}</p>
                </div>

                {tab.content.stats && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    {tab.content.stats.map(s => (
                      <div key={s.label}
                           className="bg-surface-secondary/50 rounded-xl p-4 border border-border/30">
                        <div className="text-xs text-text-tertiary mb-1">{s.label}</div>
                        <div className="text-2xl font-bold text-text-primary">{s.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {tab.content.chart === 'bar' && (
                  <div className="bg-surface-secondary/30 rounded-xl border border-border/30 overflow-hidden">
                    <div className="px-4 pt-4 text-xs text-text-tertiary font-medium">
                      Top Endpoints — Hits Distribution
                    </div>
                    <BarChartMock />
                  </div>
                )}

                {tab.content.chart === 'line' && (
                  <div className="bg-surface-secondary/30 rounded-xl border border-border/30 overflow-hidden">
                    <div className="px-4 pt-4 text-xs text-text-tertiary font-medium">
                      Hits Over Time — Last 24h
                    </div>
                    <LineChartMock />
                  </div>
                )}

                {tab.content.table && (
                  <TableMock
                    rows={tab.content.table}
                    columns={['Name', 'Slug', 'Status', 'Users']}
                  />
                )}

                {tab.content.keys && (
                  <TableMock
                    rows={tab.content.keys}
                    columns={['Name', 'Environment', 'Status', 'Key ID']}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
