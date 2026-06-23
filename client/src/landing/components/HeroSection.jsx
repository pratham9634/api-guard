import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Terminal, Database, Cpu, Activity, RefreshCw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RequestAccessModal from './RequestAccessModal';

gsap.registerPlugin(ScrollTrigger);

const FAKE_METRICS = [
  { label: 'Total Hits', value: '1,284,792', color: '#4f46e5' },
  { label: 'Error Rate', value: '0.04%', color: '#10b981' },
  { label: 'Avg Latency', value: '38ms', color: '#06b6d4' },
];

const INITIAL_LOGS = [
  { id: 1, method: 'GET', path: '/api/v1/auth/session', status: 200, latency: '12ms' },
  { id: 2, method: 'POST', path: '/api/v1/payments/charge', status: 201, latency: '142ms' },
  { id: 3, method: 'GET', path: '/api/v1/users/profile', status: 200, latency: '24ms' },
];

export default function HeroSection() {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [liveLogs, setLiveLogs] = useState(INITIAL_LOGS);
  const [hitCount, setHitCount] = useState(1284792);
  const [latency, setLatency] = useState(38);
  const [errorRate, setErrorRate] = useState(0.04);

  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const dashboardRef = useRef(null);

  // GSAP Scroll Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Scale down dashboard and rotate slightly on scroll
      gsap.fromTo(dashboardRef.current,
        { scale: 1, rotateX: 0, rotateY: 0, y: 0 },
        {
          scale: 0.88,
          rotateX: 4,
          rotateY: -3,
          y: 60,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          }
        }
      );

      // Slide and fade headline/badge on scroll
      gsap.fromTo(headlineRef.current,
        { opacity: 1, y: 0 },
        {
          opacity: 0.15,
          y: -50,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Real-time Dashboard Event Stream & Counter Incrementor
  useEffect(() => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    const endpoints = ['/api/v1/payments', '/api/v1/users/profile', '/api/v1/items', '/api/v1/auth/login', '/api/v1/analytics'];
    const statuses = [200, 201, 204, 400, 401, 403, 500];

    const interval = setInterval(() => {
      const randomMethod = methods[Math.floor(Math.random() * methods.length)];
      const randomPath = endpoints[Math.floor(Math.random() * endpoints.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomLatencyVal = Math.floor(Math.random() * 200) + 12;

      // Update counters
      setHitCount(prev => prev + 1);
      if (randomStatus >= 400) {
        setErrorRate(prev => Math.min(5, Math.max(0.01, prev + 0.01)));
      } else {
        setErrorRate(prev => Math.max(0.01, prev - 0.005));
      }
      setLatency(prev => Math.floor((prev * 9 + randomLatencyVal) / 10));

      const newLog = {
        id: Date.now(),
        method: randomMethod,
        path: randomPath,
        status: randomStatus,
        latency: `${randomLatencyVal}ms`,
      };

      setLiveLogs(prev => [newLog, ...prev.slice(0, 2)]);
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  const getStatusStyle = (code) => {
    if (code >= 500) return 'text-red-400 font-bold';
    if (code >= 400) return 'text-amber-400 font-bold';
    return 'text-emerald-400 font-semibold';
  };

  return (
    <>
      <section ref={sectionRef} className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 landing-grid-bg" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px]
                        bg-gradient-radial from-accent-primary/10 via-transparent to-transparent
                        blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[500px]
                        bg-gradient-radial from-cyan-500/5 via-transparent to-transparent
                        blur-3xl pointer-events-none" />

        {/* Floating background particles */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-accent-primary/20"
              style={{
                top: `${15 + i * 14}%`,
                left: `${10 + (i * 18) % 80}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 5 + i * 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <div className="landing-container relative z-10">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            {/* Left — Headline Copy */}
            <div ref={headlineRef} className="lg:col-span-5 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5
                            rounded-full border border-accent-primary/30 bg-accent-primary/5
                            text-accent-primary text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
                Lightweight API Monitoring
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary
                           tracking-tight leading-[1.1] mb-6">
                Track Every API Hit.{' '}
                <span className="gradient-text">Spot Issues Instantly.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-text-secondary leading-relaxed mb-10
                           max-w-xl mx-auto lg:mx-0">
                Real-time API monitoring with asynchronous hit tracking, latency analytics, and multi-tenant management — all inside a lightweight, highly-visual framework.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5
                           text-base font-semibold rounded-xl accent-gradient text-white
                           shadow-lg shadow-accent-primary/25 hover:shadow-xl
                           hover:shadow-accent-primary/30 active:scale-[0.98] transition-all duration-300 cursor-pointer"
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
              </div>
            </div>

            {/* Right — Interactive Visual Dashboard Preview (7 Columns) */}
            <div ref={dashboardRef} className="lg:col-span-7 relative perspective-1000">
              <div className="glass-landing p-6 rounded-2xl shadow-2xl border border-border/20">
                {/* Dashboard Browser Header */}
                <div className="flex items-center justify-between mb-5 border-b border-border/10 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="text-xs text-text-tertiary font-mono bg-surface-secondary/50 px-3 py-1 rounded-md border border-border/30">
                    api-guard.io/telemetry
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-success font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
                    Live View
                  </div>
                </div>

                {/* Real-time Telemetry Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-surface-secondary/40 rounded-xl p-3.5 border border-border/40">
                    <div className="text-xs text-text-tertiary mb-1">Total Hits</div>
                    <div className="text-xl font-bold text-text-primary font-mono tracking-tight">
                      {hitCount.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-surface-secondary/40 rounded-xl p-3.5 border border-border/40">
                    <div className="text-xs text-text-tertiary mb-1">Error Rate</div>
                    <div className="text-xl font-bold text-danger font-mono">
                      {errorRate.toFixed(2)}%
                    </div>
                  </div>
                  <div className="bg-surface-secondary/40 rounded-xl p-3.5 border border-border/40">
                    <div className="text-xs text-text-tertiary mb-1">Avg Latency</div>
                    <div className="text-xl font-bold text-accent-secondary font-mono">
                      {latency}ms
                    </div>
                  </div>
                </div>

                {/* Live Event Stream Teaser */}
                <div className="bg-surface-secondary/20 rounded-xl p-4 border border-border/30 mb-6 font-mono text-[11px] overflow-hidden h-[156px]">
                  <div className="text-[10px] text-text-secondary uppercase font-bold tracking-wider mb-2 flex items-center justify-between h-[16px]">
                    <span>Live Event Bus Stream</span>
                    <RefreshCw size={10} className="animate-spin text-text-tertiary" />
                  </div>
                  <div className="flex flex-col gap-2 h-[100px] overflow-hidden relative">
                    <AnimatePresence initial={false}>
                      {liveLogs.map((log) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -15, height: 0 }}
                          animate={{ opacity: 1, x: 0, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center justify-between py-1.5 px-2.5 rounded bg-surface-card border border-border/30"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-accent-primary font-bold">{log.method}</span>
                            <span className="text-text-primary truncate max-w-[170px]">{log.path}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={getStatusStyle(log.status)}>{log.status}</span>
                            <span className="text-text-tertiary">{log.latency}</span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Pipeline SVG Graphic with flowing dots */}
                <div className="bg-surface-secondary/40 rounded-xl p-4 border border-border/30 flex flex-col items-center">
                  <div className="text-[10px] text-text-secondary uppercase font-bold tracking-wider mb-4 self-start">
                    Pipeline Topology
                  </div>

                  <div className="w-full relative py-2">
                    {/* SVG Graphic */}
                    <svg viewBox="0 0 540 80" className="w-full h-auto overflow-visible">
                      {/* Connection lines */}
                      <path id="pipelinePath" d="M 30,40 L 130,40 L 250,40 L 370,40 L 490,40" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="3" />
                      
                      {/* Flowing animated dashes */}
                      <path d="M 30,40 L 490,40" fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeDasharray="8 6" className="flow-line" />
                      
                      {/* Gradients */}
                      <defs>
                        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="var(--color-accent-primary)" />
                          <stop offset="50%" stopColor="var(--color-accent-secondary)" />
                          <stop offset="100%" stopColor="var(--color-success)" />
                        </linearGradient>
                      </defs>

                      {/* Moving particles (Framer Motion along coordinates) */}
                      <motion.circle r="4" fill="var(--color-accent-primary)" filter="drop-shadow(0 0 4px var(--color-accent-primary))"
                        animate={{ cx: [30, 130, 250, 370, 490] }}
                        transition={{ repeat: Infinity, duration: 2.8, ease: 'linear' }}
                        cy="40"
                      />
                      <motion.circle r="4" fill="var(--color-accent-secondary)" filter="drop-shadow(0 0 4px var(--color-accent-secondary))"
                        animate={{ cx: [30, 130, 250, 370, 490] }}
                        transition={{ repeat: Infinity, duration: 2.8, ease: 'linear', delay: 0.9 }}
                        cy="40"
                      />
                      <motion.circle r="4" fill="var(--color-success)" filter="drop-shadow(0 0 4px var(--color-success))"
                        animate={{ cx: [30, 130, 250, 370, 490] }}
                        transition={{ repeat: Infinity, duration: 2.8, ease: 'linear', delay: 1.8 }}
                        cy="40"
                      />

                      {/* Nodes */}
                      {/* Node 1: Client */}
                      <circle cx="30" cy="40" r="16" fill="var(--color-surface-card)" stroke="var(--color-accent-primary)" strokeWidth="2" />
                      <text x="30" y="44" fill="var(--color-text-primary)" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">API</text>

                      {/* Node 2: Queue */}
                      <circle cx="130" cy="40" r="16" fill="var(--color-surface-card)" stroke="var(--color-accent-primary)" strokeWidth="2" />
                      <text x="130" y="44" fill="var(--color-text-primary)" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Q</text>

                      {/* Node 3: Consumer */}
                      <circle cx="250" cy="40" r="16" fill="var(--color-surface-card)" stroke="var(--color-accent-secondary)" strokeWidth="2" />
                      <text x="250" y="44" fill="var(--color-text-primary)" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">SRV</text>

                      {/* Node 4: DB */}
                      <circle cx="370" cy="40" r="16" fill="var(--color-surface-card)" stroke="var(--color-warning)" strokeWidth="2" />
                      <text x="370" y="44" fill="var(--color-text-primary)" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">DB</text>

                      {/* Node 5: Analytics */}
                      <circle cx="490" cy="40" r="16" fill="var(--color-surface-card)" stroke="var(--color-success)" strokeWidth="2" />
                      <text x="490" y="44" fill="var(--color-text-primary)" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">GRA</text>
                    </svg>

                    {/* Node Labels */}
                    <div className="flex justify-between w-full text-[9px] text-text-secondary px-1 font-semibold uppercase tracking-wider mt-2.5">
                      <span>Event Source</span>
                      <span>RabbitMQ</span>
                      <span>Consumer</span>
                      <span>Database</span>
                      <span>Analytics</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Active Metric Card */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-5 -right-4 glass-landing px-4 py-3 rounded-xl shadow-xl
                         border border-accent-primary/20 backdrop-blur-md"
              >
                <div className="text-[10px] text-text-tertiary">Ingestion Health</div>
                <div className="text-base font-bold text-accent-primary font-mono mt-0.5">99.99%</div>
                <div className="text-[9px] text-success flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
                  Telemetry Active
                </div>
              </motion.div>
            </div>
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
