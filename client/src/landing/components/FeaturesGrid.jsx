import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BarChart3, KeyRound, Building2, Bell, Shield, Calendar, RefreshCw } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function FeaturesGrid() {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  
  // States for interactive showcases
  const [activeKey, setActiveKey] = useState('ak_prod_x87f9h2m4...');
  const [activeEnv, setActiveEnv] = useState('production');
  const [tenantOrg, setTenantOrg] = useState('Acme Corp');

  // Rotate API Key animation every 3 seconds
  useEffect(() => {
    const keys = {
      production: 'ak_prod_x87f9h2m4...',
      staging: 'ak_stag_m39fk2n8p...',
      development: 'ak_dev_t79xk5p1d...'
    };

    const interval = setInterval(() => {
      setActiveEnv(prev => {
        const next = prev === 'production' ? 'staging' : prev === 'staging' ? 'development' : 'production';
        setActiveKey(keys[next]);
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Self-building chart on viewport scroll
  useEffect(() => {
    const chartBars = gsap.utils.toArray('.feature-chart-bar');
    if (chartBars.length === 0) return;

    gsap.fromTo(chartBars, 
      { scaleY: 0 },
      {
        scaleY: 1,
        duration: 1.2,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: chartRef.current,
          start: 'top 85%',
        }
      }
    );
  }, []);

  return (
    <section ref={containerRef} className="py-24 relative overflow-hidden bg-surface-secondary/30">
      {/* Background spotlights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent-primary/5 blur-3xl pointer-events-none" />

      <div className="landing-container">
        
        {/* Header */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                        border border-accent-primary/20 bg-accent-primary/5
                        text-accent-primary text-xs font-semibold mb-6">
            Feature Deep Dive
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight mb-5">
            Engineered for <span className="gradient-text">Developer Speed</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            API Guard is built around visual telemetry, sandbox decoupling, and secure key distribution.
          </p>
        </div>

        {/* Alternating Showcase Panel 1: Analytics (Text Left, Chart Right) */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32">
          <div>
            <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center mb-6 border border-accent-primary/20">
              <BarChart3 className="text-accent-primary" size={22} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-4">
              Real-Time Visual Latency & Hit Aggregations
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              Track latency curves, request counters, and error ratios. Our metrics system resolves queries instantly over configurable windows from 1 hour up to 30 days.
            </p>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                Aggregated hits, success volumes, and errors per second
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                Spike and anomaly visual tracking via continuous stream charts
              </li>
            </ul>
          </div>

          {/* Interactive Chart Container */}
          <div ref={chartRef} className="glass-landing border border-border/30 rounded-2xl p-6 shadow-2xl bg-surface-card/20 relative">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Telemetry Engine / Charts</span>
              <span className="text-[10px] text-success bg-success-bg px-2.5 py-0.5 rounded-full font-semibold">Active Ingestion</span>
            </div>

            {/* Self-building Bar Chart */}
            <div className="h-32 flex items-end gap-2 px-2 pt-4 relative">
              <div className="absolute inset-x-0 bottom-0 top-4 border-b border-border/10 flex flex-col justify-between pointer-events-none">
                <div className="w-full border-t border-border/5" />
                <div className="w-full border-t border-border/5" />
              </div>

              {[45, 78, 62, 98, 54, 88, 72, 90, 80, 95].map((val, i) => (
                <div 
                  key={i} 
                  className="feature-chart-bar flex-1 rounded-t bg-gradient-to-t from-accent-primary/20 to-accent-primary origin-bottom"
                  style={{ height: `${val}%` }} 
                />
              ))}
            </div>
            
            <div className="flex justify-between mt-3 text-[10px] text-text-tertiary">
              <span>9:00 AM</span>
              <span>Now</span>
            </div>
          </div>
        </div>

        {/* Alternating Showcase Panel 2: Key Management (Animation Left, Text Right) */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32">
          {/* Key Rotator Visual */}
          <div className="glass-landing border border-border/30 rounded-2xl p-6 shadow-2xl bg-surface-card/20 lg:order-first order-last relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-warning/5 rounded-full blur-2xl" />
            
            <div className="flex items-center justify-between mb-6 border-b border-border/10 pb-4">
              <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Key Rotator Vault</span>
              <span className="flex items-center gap-1.5 text-[10px] text-warning font-mono">
                <RefreshCw size={10} className="animate-spin" />
                Auto Rotated
              </span>
            </div>

            {/* Simulated Live Rotation */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                {['production', 'staging', 'development'].map(env => (
                  <span 
                    key={env} 
                    className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold transition-all duration-300
                      ${activeEnv === env 
                        ? 'bg-warning-bg text-warning border border-warning/25' 
                        : 'bg-surface-secondary/40 text-text-tertiary border border-border/10'
                      }`}
                  >
                    {env}
                  </span>
                ))}
              </div>

              <div className="bg-surface-secondary/50 border border-border/20 rounded-xl p-4 font-mono text-sm leading-relaxed flex items-center justify-between">
                <span className="text-text-secondary select-none">API_KEY:</span>
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={activeKey}
                    initial={{ opacity: 0, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(5px)' }}
                    transition={{ duration: 0.25 }}
                    className="text-warning font-bold"
                  >
                    {activeKey}
                  </motion.span>
                </AnimatePresence>
              </div>

              <div className="text-[10px] text-text-tertiary font-medium">
                Vault hashes are encrypted at rest with AES-256. Re-scoping takes effect globally under 1.2 seconds.
              </div>
            </div>
          </div>

          <div>
            <div className="w-12 h-12 rounded-xl bg-warning-bg flex items-center justify-center mb-6 border border-warning/20">
              <KeyRound className="text-warning" size={22} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-4">
              Complete Sandbox-to-Prod Key Rotation
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              Distribute sandbox and production API keys for developer units. Instantly rotate keys, configure retention rates, or revoke accesses from a clean console panel.
            </p>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                Isolate logs based on sandbox, staging, or production key scopes
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                Configure custom IP block-listings or origin security validations
              </li>
            </ul>
          </div>
        </div>

        {/* Alternating Showcase Panel 3: Multi-Tenant Workspace (Text Left, Visual Right) */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32">
          <div>
            <div className="w-12 h-12 rounded-xl bg-accent-secondary/10 flex items-center justify-center mb-6 border border-accent-secondary/20">
              <Building2 className="text-accent-secondary" size={22} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-4">
              Multi-Tenant Isolated Organization Workspaces
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              Deploy client-specific organization nodes. Assign isolated user lists, separate database analytics indices, and manage nested tenant memberships effortlessly.
            </p>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary" />
                Super Admin visibility to govern nested client groups
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary" />
                Isolated indices ensure zero inter-tenant data leakage
              </li>
            </ul>
          </div>

          {/* Org Selector Visual */}
          <div className="glass-landing border border-border/30 rounded-2xl p-6 shadow-2xl bg-surface-card/20 relative">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Tenant Index Isolation</span>
              <span className="text-[10px] text-accent-secondary font-semibold font-mono">Index Isolation: Enabled</span>
            </div>
 
            {/* Interactive Tenant Switcher */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                {['Acme Corp', 'Globex Inc', 'Initech'].map(org => (
                  <button
                    key={org}
                    onClick={() => setTenantOrg(org)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-300
                      ${tenantOrg === org 
                        ? 'border-accent-secondary bg-accent-secondary/10 text-accent-secondary' 
                        : 'border-border bg-surface-secondary/40 text-text-secondary hover:text-text-primary'
                      }`}
                  >
                    {org}
                  </button>
                ))}
              </div>
 
              {/* Display Isolated Index data */}
              <div className="bg-surface-secondary/50 border border-border/20 rounded-xl p-4 font-mono text-xs flex flex-col gap-1.5 text-text-secondary">
                <div>SELECT * FROM telemetries WHERE org = <strong className="text-accent-secondary">"{tenantOrg}"</strong>;</div>
                <div className="text-text-tertiary mt-2 border-t border-border/20 pt-2">
                  [Returned index: {tenantOrg === 'Acme Corp' ? 'idx_acme_prod' : tenantOrg === 'Globex Inc' ? 'idx_globex_prod' : 'idx_initech_prod'}]
                </div>
                <div className="text-success font-bold">✓ Data isolation validation verified.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Supporting Grid (Grid of Cards) */}
        <div className="border-t border-border/15 pt-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Alerting */}
            <div className="p-6 rounded-2xl border border-border/20 bg-surface-card/10 hover:bg-surface-card/20 transition-all">
              <div className="w-9 h-9 rounded-lg bg-success-bg border border-success/20 flex items-center justify-center mb-4">
                <Bell size={18} className="text-success" />
              </div>
              <h4 className="text-sm font-bold text-text-primary mb-2">Automated Notifications</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Connect email channels or custom webhooks to dispatch latency triggers automatically.
              </p>
            </div>

            {/* Security */}
            <div className="p-6 rounded-2xl border border-border/20 bg-surface-card/10 hover:bg-surface-card/20 transition-all">
              <div className="w-9 h-9 rounded-lg bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center mb-4">
                <Shield size={18} className="text-accent-primary" />
              </div>
              <h4 className="text-sm font-bold text-text-primary mb-2">Granular Roles (RBAC)</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Enforce Client Admin, Client Viewer, and Organization Reader permissions.
              </p>
            </div>

            {/* Time windows */}
            <div className="p-6 rounded-2xl border border-border/20 bg-surface-card/10 hover:bg-surface-card/20 transition-all">
              <div className="w-9 h-9 rounded-lg bg-warning-bg border border-warning/20 flex items-center justify-center mb-4">
                <Calendar size={18} className="text-warning" />
              </div>
              <h4 className="text-sm font-bold text-text-primary mb-2">Relative Time Filters</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Quickly adjust monitoring dashboards across 1h, 6h, 24h, or custom monthly date boundaries.
              </p>
            </div>

            {/* High Performance */}
            <div className="p-6 rounded-2xl border border-border/20 bg-surface-card/10 hover:bg-surface-card/20 transition-all">
              <div className="w-9 h-9 rounded-lg bg-accent-secondary/10 border border-accent-secondary/20 flex items-center justify-center mb-4">
                <RefreshCw size={18} className="text-accent-secondary" />
              </div>
              <h4 className="text-sm font-bold text-text-primary mb-2">Event Queue Ingestion</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                RabbitMQ buffered queues ensure ingestion rates scale to millions of telemetry points.
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
