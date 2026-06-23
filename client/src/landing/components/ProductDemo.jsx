import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LayoutDashboard, BarChart3, Building2, KeyRound } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const TABS = [
  {
    id: 'dashboard',
    label: 'Overview Console',
    icon: LayoutDashboard,
    content: {
      title: 'Global Performance Dashboard',
      description: 'See your complete system telemetry in a unified timeline. Instantly analyze total hits, error ratios, latency indices, and unique endpoints.',
      stats: [
        { label: 'Ingestion Hits', value: '4.8M', trend: '+14%', color: '#6366f1' },
        { label: 'Worker Latency', value: '28ms', trend: '-2ms', color: '#06b6d4' },
        { label: 'Incident Errors', value: '0.01%', trend: '-0.02%', color: '#10b981' },
      ],
      chart: 'bar',
    },
  },
  {
    id: 'analytics',
    label: 'Deep Analytics',
    icon: BarChart3,
    content: {
      title: 'Time-Series Analytical Visuals',
      description: 'Analyze telemetry distributions across custom ranges. Query database indexes, latency benchmarks, and endpoint response statuses.',
      stats: [
        { label: 'Peak QPS', value: '2,840', trend: 'Active', color: '#6366f1' },
        { label: 'P99 Latency', value: '112ms', trend: 'Stable', color: '#f59e0b' },
        { label: 'Active Services', value: '8 Nodes', trend: 'Healthy', color: '#ec4899' },
      ],
      chart: 'line',
    },
  },
  {
    id: 'clients',
    label: 'Client Manager',
    icon: Building2,
    content: {
      title: 'Multi-Tenant Workspace Management',
      description: 'Onboard nested client groups, define custom schemas, review user accounts, and oversee client telemetry isolated streams.',
      table: [
        { name: 'Tesla Inc', slug: 'tesla-inc', status: 'Active', members: 14 },
        { name: 'SpaceX Org', slug: 'spacex-org', status: 'Active', members: 8 },
        { name: 'Apple Retail', slug: 'apple-retail', status: 'Active', members: 24 },
      ],
    },
  },
  {
    id: 'keys',
    label: 'API Key Vault',
    icon: KeyRound,
    content: {
      title: 'Decoupled Environment Keys',
      description: 'Generate, restrict, rotate, or revoke scoped API credentials. Sandbox routing and live logs take effect automatically.',
      keys: [
        { name: 'Stripe Webhook Key', env: 'production', status: 'Active', key: 'ak_prod_x78...' },
        { name: 'Github Action Key', env: 'staging', status: 'Active', key: 'ak_stag_m89...' },
        { name: 'Local Sandbox Key', env: 'development', status: 'Revoked', key: 'ak_dev_t12...' },
      ],
    },
  },
];

export default function ProductDemo() {
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const tab = TABS.find(t => t.id === activeTab);

  const steps = ['dashboard', 'analytics', 'clients', 'keys'];
  const totalScrollDistance = 2000;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Pin the product demo container and smoothly step through the mockups
    const scrollTriggerInstance = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: `+=${totalScrollDistance}`, // Pin scroll length
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const totalSteps = steps.length;
        const index = Math.min(totalSteps - 1, Math.floor(progress * totalSteps));
        setActiveTab(steps[index]);
      }
    });

    return () => {
      scrollTriggerInstance.kill();
    };
  }, []);

  // Smooth scroll window to the corresponding step position when clicked
  const handleTabClick = (id) => {
    const idx = steps.indexOf(id);
    if (idx === -1 || !containerRef.current) return;

    const scrollTriggerInstance = ScrollTrigger.getById('demo-pin');
    // Calculate scroll coordinates relative to current scroll triggers
    const startScroll = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
    }).start;

    // Map index ratio to absolute window scroll position
    const targetScroll = startScroll + (idx / steps.length) * totalScrollDistance + 50;

    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  };

  return (
    <section 
      ref={containerRef} 
      className="min-h-screen flex items-center justify-center bg-surface-primary relative overflow-hidden py-16"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-accent-secondary-rgb,rgba(0,212,182,0.015)),transparent_60%)]" />

      <div className="landing-container w-full relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left side: Interactive content cards (5 columns) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                          border border-accent-secondary/20 bg-accent-secondary/5
                          text-accent-secondary text-xs font-semibold mb-6 self-start">
              Product Tour
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight mb-5">
              Take a Closer <span className="gradient-text">Look Inside</span>
            </h2>
            
            {/* Feature text descriptions */}
            <div className="flex flex-col gap-3.5">
              {TABS.map((t) => {
                const isActive = activeTab === t.id;
                const Icon = t.icon;
                return (
                  <div 
                    key={t.id}
                    onClick={() => handleTabClick(t.id)}
                    className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer text-left
                      ${isActive 
                        ? 'bg-surface-card border-accent-primary/30 shadow-lg shadow-accent-primary/5' 
                        : 'bg-transparent border-transparent opacity-50 hover:opacity-85 hover:border-border/10'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={isActive ? 'text-accent-primary' : 'text-text-secondary'} />
                      <h4 className="text-sm font-bold text-text-primary">{t.label}</h4>
                    </div>
                    {isActive && (
                      <p className="text-xs text-text-secondary leading-relaxed mt-2 pl-7">
                        {t.content.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right side: Mock dashboard viewport (7 columns) */}
          <div className="lg:col-span-7 flex justify-center items-center">
            <div className="w-full bg-surface-card border border-border/20 rounded-2xl shadow-2xl overflow-hidden relative">
              
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border/15 bg-surface-secondary/70">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-danger/70" />
                  <div className="w-3 h-3 rounded-full bg-warning/70" />
                  <div className="w-3 h-3 rounded-full bg-success/70" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-5 py-0.5 rounded-md bg-surface-secondary/50 text-[10px] text-text-tertiary font-mono border border-border/10">
                    console.api-guard.io/{activeTab}
                  </div>
                </div>
              </div>

              {/* Main panel display */}
              <div className="p-6 min-h-[340px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-text-primary mb-1">{tab.content.title}</h3>
                      <p className="text-xs text-text-secondary">{tab.content.description}</p>
                    </div>

                    {/* Render Stats */}
                    {tab.content.stats && (
                      <div className="grid grid-cols-3 gap-3 mb-5">
                        {tab.content.stats.map(s => (
                          <div key={s.label} className="bg-surface-secondary/50 rounded-xl p-3 border border-border/10">
                            <div className="text-[9px] text-text-tertiary mb-0.5">{s.label}</div>
                            <div className="text-lg font-bold text-text-primary font-mono">{s.value}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Render Charts */}
                    {tab.content.chart === 'bar' && (
                      <div className="bg-surface-secondary/30 rounded-xl border border-border/15 p-4">
                        <div className="h-28 flex items-end gap-2 pt-2">
                          {[65, 82, 45, 90, 73, 95, 68, 88].map((val, i) => (
                            <div 
                              key={i} 
                              className="flex-1 rounded-t bg-gradient-to-t from-accent-primary/20 to-accent-primary" 
                              style={{ height: `${val}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {tab.content.chart === 'line' && (
                      <div className="bg-surface-secondary/30 rounded-xl border border-border/15 p-4">
                        <svg viewBox="0 0 400 100" className="w-full h-24 overflow-visible" preserveAspectRatio="none">
                           <polyline
                            fill="none"
                            stroke="var(--color-accent-secondary)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points="20,80 60,60 100,70 140,30 180,45 220,25 260,40 300,20 340,35 380,15"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Render Tables */}
                    {tab.content.table && (
                      <div className="overflow-hidden rounded-xl border border-border/20">
                        <table className="w-full text-left font-mono text-[11px]">
                          <thead>
                            <tr className="bg-surface-secondary/60 text-text-secondary border-b border-border/10">
                              <th className="p-3">Org Name</th>
                              <th className="p-3">Slug</th>
                              <th className="p-3">Members</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tab.content.table.map((row, i) => (
                              <tr key={i} className="border-b border-border/5 bg-surface-card/10">
                                <td className="p-3 text-text-primary font-bold">{row.name}</td>
                                <td className="p-3 text-text-secondary">{row.slug}</td>
                                <td className="p-3 text-accent-secondary font-semibold">{row.members}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
 
                    {/* Render Keys */}
                    {tab.content.keys && (
                      <div className="overflow-hidden rounded-xl border border-border/20">
                        <table className="w-full text-left font-mono text-[11px]">
                          <thead>
                            <tr className="bg-surface-secondary/60 text-text-secondary border-b border-border/10">
                              <th className="p-3">Key Name</th>
                              <th className="p-3">Env</th>
                              <th className="p-3">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tab.content.keys.map((row, i) => (
                              <tr key={i} className="border-b border-border/5 bg-surface-card/10">
                                <td className="p-3 text-text-primary font-bold">{row.name}</td>
                                <td className="p-3">
                                  <span className="bg-warning-bg text-warning px-2 py-0.5 rounded text-[9px] uppercase border border-warning/20 font-bold">
                                    {row.env}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className={row.status === 'Active' ? 'text-success font-semibold' : 'text-danger'}>
                                    {row.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
