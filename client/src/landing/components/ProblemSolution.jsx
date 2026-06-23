import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EyeOff, Clock, AlertOctagon, Heart, ShieldCheck, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function ProblemSolution() {
  const containerRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Left panel entry (Without API Guard)
      gsap.fromTo(leftPanelRef.current,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            end: 'top 30%',
            scrub: true,
          }
        }
      );

      // Right panel entry (With API Guard)
      gsap.fromTo(rightPanelRef.current,
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 70%',
            end: 'top 20%',
            scrub: true,
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-24 relative overflow-hidden">
      {/* Background radial lights */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[350px] h-[350px] bg-danger/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[350px] h-[350px] bg-success/5 blur-3xl pointer-events-none" />

      <div className="landing-container">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                        border border-danger/20 bg-danger-bg
                        text-danger text-sm font-medium mb-6">
            The Cost of Blind APIs
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight mb-5 max-w-3xl mx-auto">
            Stop Guessing if Your <span className="gradient-text">APIs Are Healthy</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Most engineering teams don't know their endpoints are struggling until support tickets start piling up.
          </p>
        </div>

        {/* Comparative Side-by-Side Narrative */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
          
          {/* Left Panel: The Problem (Without API Guard) */}
          <div 
            ref={leftPanelRef}
            className="flex flex-col justify-between p-8 rounded-2xl bg-gradient-to-br from-danger-bg to-transparent border border-danger/10 relative overflow-hidden"
          >
            {/* Ambient Red Glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-danger/10 rounded-full blur-2xl" />

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-danger-bg flex items-center justify-center border border-danger/20">
                  <EyeOff className="text-danger" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-danger uppercase tracking-wider text-xs">Scenario A</h3>
                  <h4 className="text-xl font-bold text-text-primary">Without API Guard</h4>
                </div>
              </div>

              <p className="text-text-secondary text-sm leading-relaxed mb-8">
                Your services are running, but silent errors are failing silently in background routines. Latency is creepily creeping up, and you have zero trace visibility.
              </p>

              {/* Erratic Red Chart Visual */}
              <div className="bg-surface-secondary/50 border border-danger/10 rounded-xl p-5 mb-8 relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] text-danger font-mono flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                    SYSTEM INCIDENT: 504 GATEWAY TIMEOUT
                  </span>
                  <span className="text-[10px] text-text-tertiary font-mono">Hits / min</span>
                </div>

                {/* Spiky Jagged SVG Chart */}
                <svg viewBox="0 0 300 100" className="w-full h-24 overflow-visible" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="300" y2="20" stroke="var(--color-danger-bg)" />
                  <line x1="0" y1="60" x2="300" y2="60" stroke="var(--color-danger-bg)" />
                  
                  {/* Jagged Spiked Polyline */}
                  <polyline
                    fill="none"
                    stroke="var(--color-danger)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="0,80 30,70 60,85 90,20 120,95 150,15 180,90 210,85 240,10 270,95 300,90"
                  />
                  {/* Spike Circles */}
                  <circle cx="150" cy="15" r="4.5" fill="var(--color-danger)" className="animate-ping" />
                  <circle cx="240" cy="10" r="4.5" fill="var(--color-danger)" className="animate-ping" />
                </svg>

                {/* Simulated Panic Alerts */}
                <div className="flex gap-2 mt-4">
                  <div className="flex-1 py-2 px-3 rounded bg-danger-bg border border-danger/20 flex items-center gap-2 text-[10px] text-danger font-mono">
                    <AlertOctagon size={12} className="text-danger animate-bounce" />
                    Stripe webhooks failing (502)
                  </div>
                  <div className="py-2 px-3 rounded bg-danger-bg border border-danger/20 flex items-center gap-2 text-[10px] text-danger font-mono">
                    <Clock size={12} className="text-danger" />
                    Avg Latency: 1.4s
                  </div>
                </div>
              </div>
            </div>
 
            {/* Pain list */}
            <ul className="space-y-3.5 text-sm text-text-secondary pt-4 border-t border-border/10">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-danger mt-2 flex-shrink-0" />
                <span>Users complain about loading freezes before your alarms ring</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-danger mt-2 flex-shrink-0" />
                <span>Ops spends hours filtering bloated Datadog/Grafana query panels</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-danger mt-2 flex-shrink-0" />
                <span>Stale, unrevoked staging API keys expose database access routes</span>
              </li>
            </ul>
          </div>

          {/* Right Panel: The Solution (With API Guard) */}
          <div 
            ref={rightPanelRef}
            className="flex flex-col justify-between p-8 rounded-2xl bg-gradient-to-br from-success-bg to-transparent border border-success/15 relative overflow-hidden"
          >
            {/* Ambient Green Glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-success/10 rounded-full blur-2xl" />

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-success-bg flex items-center justify-center border border-success/20">
                  <ShieldCheck className="text-success" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-success uppercase tracking-wider text-xs">Scenario B</h3>
                  <h4 className="text-xl font-bold text-text-primary">With API Guard</h4>
                </div>
              </div>

              <p className="text-text-secondary text-sm leading-relaxed mb-8">
                Your event pipeline immediately captures all query hits. Real-time dashboards reflect traffic levels, latency trends, and key usages under a clean, unified screen.
              </p>

              {/* Stable Green Chart Visual */}
              <div className="bg-surface-secondary/50 border border-success/10 rounded-xl p-5 mb-8 relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] text-success font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    PIPELINE HEALTHY: 99.98% SUCCESS
                  </span>
                  <span className="text-[10px] text-text-tertiary font-mono">Hits / min</span>
                </div>

                {/* Smooth Curve SVG Chart */}
                <svg viewBox="0 0 300 100" className="w-full h-24 overflow-visible" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="300" y2="20" stroke="var(--color-success-bg)" />
                  <line x1="0" y1="60" x2="300" y2="60" stroke="var(--color-success-bg)" />
                  
                  {/* Smooth Sine-like Polyline */}
                  <polyline
                    fill="none"
                    stroke="var(--color-success)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="0,60 30,58 60,62 90,55 120,58 150,57 180,60 210,59 240,61 270,58 300,60"
                  />
                  {/* Pulse Circle */}
                  <circle cx="300" cy="60" r="4.5" fill="var(--color-success)" />
                </svg>
 
                {/* Simulated Success Indicators */}
                <div className="flex gap-2 mt-4">
                  <div className="flex-1 py-2 px-3 rounded bg-success-bg border border-success/20 flex items-center gap-2 text-[10px] text-success font-mono">
                    <Heart size={12} className="text-success" />
                    All nodes operational
                  </div>
                  <div className="py-2 px-3 rounded bg-success-bg border border-success/20 flex items-center gap-2 text-[10px] text-success font-mono">
                    <Zap size={12} className="text-success" />
                    Latency stable: 24ms
                  </div>
                </div>
              </div>
            </div>
 
            {/* Benefit list */}
            <ul className="space-y-3.5 text-sm text-text-secondary pt-4 border-t border-border/10">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0" />
                <span>Instant notifications for spike anomalies before user load degrades</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0" />
                <span>Lightweight REST tracking that connects in 5 minutes, not 5 hours</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0" />
                <span>Complete key lifecycle console allowing instant environment rotations</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
