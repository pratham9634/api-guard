import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Smartphone, Shield, Radio, Cpu, Database, BarChart3 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ARCH_STEPS = [
  {
    icon: Smartphone,
    title: '1. Client App Request',
    subtitle: 'Telemetry Ingestion',
    description: 'Every time an API endpoint is hit, a lightweight metadata event is sent asynchronously. Zero impact on primary API latency.',
    color: 'var(--color-info)',
  },
  {
    icon: Shield,
    title: '2. API Guard Ingest',
    subtitle: 'Authorization & Validation',
    description: 'The ingestion server receives the payload, verifies the sandbox/production API keys in microseconds, and prepares the message queue routing key.',
    color: 'var(--color-accent-primary)',
  },
  {
    icon: Radio,
    title: '3. RabbitMQ Message Bus',
    subtitle: 'Asynchronous Decoupling',
    description: 'The validated event is published onto a persistent RabbitMQ buffer. This ensures zero data loss and handles heavy spikes of traffic smoothly.',
    color: 'var(--color-warning)',
  },
  {
    icon: Cpu,
    title: '4. Worker Ingestion Service',
    subtitle: 'Consuming & Parsing',
    description: 'Stateless consumer workers poll the RabbitMQ queues. They format, validate schemas, and prepare events for bulk storage indexing.',
    color: 'var(--color-danger)',
  },
  {
    icon: Database,
    title: '5. Time Series & Document Storage',
    subtitle: 'Analytical Database Storage',
    description: 'Events are indexed into PostgreSQL (for time-series aggregations) and MongoDB (for raw request/response logging details).',
    color: 'var(--color-success)',
  },
  {
    icon: BarChart3,
    title: '6. Live Analytics Query',
    subtitle: 'Telemetry Dashboard Feed',
    description: 'The analytical engine processes queries and populates the dashboard, rendering live hit metrics and error alerts within seconds.',
    color: 'var(--color-accent-secondary)',
  },
];

const NodeCard = ({ stepIndex, label, activeStep }) => {
  const step = ARCH_STEPS[stepIndex];
  const isActive = activeStep >= stepIndex;
  const isCurrent = activeStep === stepIndex;
  const Icon = step.icon;
  
  return (
    <motion.div
      className={`relative z-10 flex flex-col items-center text-center gap-2 sm:gap-3 p-2 sm:p-4 rounded-2xl transition-all duration-500 w-20 sm:w-28 shrink-0
        ${isActive ? 'bg-surface-secondary/90 border border-border/40 shadow-xl' : 'bg-surface-card/30 border border-border/10 opacity-50'}`}
      style={{
        backdropFilter: 'blur(12px)',
        boxShadow: isCurrent ? `0 0 20px -5px color-mix(in srgb, ${step.color} 40%, transparent)` : 'none'
      }}
      animate={{
        y: isCurrent ? -4 : 0,
        scale: isCurrent ? 1.05 : 1
      }}
    >
      <div 
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors duration-500"
        style={{
           backgroundColor: isActive ? `color-mix(in srgb, ${step.color} 15%, transparent)` : 'var(--color-surface-elevated)',
           border: `1px solid ${isActive ? step.color : 'var(--color-border-light)'}`
        }}
      >
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: isActive ? step.color : 'var(--color-text-tertiary)' }} />
      </div>
      <div className={`font-mono text-[9px] sm:text-[10px] uppercase tracking-wider font-bold ${isActive ? 'text-text-primary' : 'text-text-tertiary'}`}>
        {label}
      </div>
    </motion.div>
  );
};

export default function ArchitectureDiagram() {
  const containerRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Pin the architecture section and step through updates smoothly
    const scrollTriggerInstance = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: '+=2000', // Scroll length to complete all steps
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const index = Math.min(
          ARCH_STEPS.length - 1,
          Math.floor(progress * ARCH_STEPS.length)
        );
        setActiveStep(index);
      }
    });

    return () => {
      scrollTriggerInstance.kill();
    };
  }, []);

  return (
    <section 
      id="architecture"
      ref={containerRef} 
      className="min-h-screen flex items-center justify-center bg-surface-primary relative overflow-hidden py-16"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-accent-primary-rgb,rgba(79,70,229,0.02)),transparent_60%)]" />
      
      <div className="landing-container w-full relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Panel: Narrative Context Card (5 columns) */}
          <div className="lg:col-span-5 flex flex-col justify-center text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                          border border-accent-primary/20 bg-accent-primary/5
                          text-accent-primary text-xs font-semibold mb-6 self-start">
              System Flow
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mb-4">
              How API Guard <span className="gradient-text">Ingests Data</span>
            </h2>
            <p className="text-sm text-text-secondary mb-8">
              Scroll down to track a telemetry point as it speeds through our event-driven system pipeline.
            </p>

            {/* Slider Info Box */}
            <div className="min-h-[220px] bg-surface-card/35 border border-border/20 rounded-2xl p-6 relative overflow-hidden">
              <div 
                className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl transition-all duration-500" 
                style={{ backgroundColor: `color-mix(in srgb, ${ARCH_STEPS[activeStep].color} 20%, transparent)` }}
              />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col"
                >
                  <div className="flex items-center gap-3.5 mb-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                      style={{ 
                        backgroundColor: `color-mix(in srgb, ${ARCH_STEPS[activeStep].color} 15%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${ARCH_STEPS[activeStep].color} 30%, transparent)`
                      }}
                    >
                      {(() => {
                        const Icon = ARCH_STEPS[activeStep].icon;
                        return <Icon size={20} style={{ color: ARCH_STEPS[activeStep].color }} />;
                      })()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary uppercase tracking-wide">
                        {ARCH_STEPS[activeStep].subtitle}
                      </h4>
                      <h3 className="text-lg font-extrabold text-text-primary" style={{ color: ARCH_STEPS[activeStep].color }}>
                        {ARCH_STEPS[activeStep].title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-text-secondary leading-relaxed pt-2">
                    {ARCH_STEPS[activeStep].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress Indicator */}
              <div className="absolute bottom-0 inset-x-0 h-1 bg-border/20">
                <motion.div 
                  className="h-full bg-accent-primary"
                  animate={{ width: `${((activeStep + 1) / ARCH_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* Right Panel: Interactive Glassmorphic Pipeline (7 columns) */}
          <div className="lg:col-span-7 flex justify-center items-center">
            <div className="w-full relative glass-landing border border-border/20 p-6 sm:p-10 rounded-[2rem] shadow-2xl flex flex-col">
              
              {/* Row 1 */}
              <div className="flex items-center w-full relative z-10">
                <NodeCard stepIndex={0} label="Client App" activeStep={activeStep} />
                <div className="flex-1 h-[2px] bg-border-light/40 relative shrink overflow-hidden mx-1">
                   <motion.div 
                     className="absolute inset-y-0 left-0" 
                     style={{ background: `linear-gradient(90deg, ${ARCH_STEPS[0].color}, ${ARCH_STEPS[1].color})` }}
                     initial={{ width: 0 }}
                     animate={{ width: activeStep >= 1 ? '100%' : 0 }} 
                     transition={{ duration: 0.4 }} 
                   />
                   {activeStep === 0 && (
                     <motion.div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full absolute top-1/2 -translate-y-1/2 blur-[1px] sm:blur-[2px]" 
                       style={{ backgroundColor: ARCH_STEPS[0].color, boxShadow: `0 0 10px ${ARCH_STEPS[0].color}` }}
                       animate={{ left: ['0%', '100%'] }} transition={{ repeat: Infinity, duration: 1.5 }} />
                   )}
                </div>
                <NodeCard stepIndex={1} label="Ingest" activeStep={activeStep} />
                <div className="flex-1 h-[2px] bg-border-light/40 relative shrink overflow-hidden mx-1">
                   <motion.div 
                     className="absolute inset-y-0 left-0" 
                     style={{ background: `linear-gradient(90deg, ${ARCH_STEPS[1].color}, ${ARCH_STEPS[2].color})` }}
                     initial={{ width: 0 }}
                     animate={{ width: activeStep >= 2 ? '100%' : 0 }} 
                     transition={{ duration: 0.4 }} 
                   />
                   {activeStep === 1 && (
                     <motion.div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full absolute top-1/2 -translate-y-1/2 blur-[1px] sm:blur-[2px]" 
                       style={{ backgroundColor: ARCH_STEPS[1].color, boxShadow: `0 0 10px ${ARCH_STEPS[1].color}` }}
                       animate={{ left: ['0%', '100%'] }} transition={{ repeat: Infinity, duration: 1.5 }} />
                   )}
                </div>
                <NodeCard stepIndex={2} label="RabbitMQ" activeStep={activeStep} />
              </div>

              {/* Vertical Line Row */}
              <div className="flex w-full">
                 <div className="flex-1" />
                 <div className="w-20 sm:w-28 shrink-0 flex justify-center h-10 sm:h-14 relative">
                    <div className="w-[2px] h-full bg-border-light/40 relative overflow-hidden">
                       <motion.div 
                         className="absolute inset-x-0 top-0" 
                         style={{ background: `linear-gradient(180deg, ${ARCH_STEPS[2].color}, ${ARCH_STEPS[3].color})` }}
                         initial={{ height: 0 }}
                         animate={{ height: activeStep >= 3 ? '100%' : 0 }} 
                         transition={{ duration: 0.4 }} 
                       />
                       {activeStep === 2 && (
                         <motion.div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full absolute left-1/2 -translate-x-1/2 blur-[1px] sm:blur-[2px]" 
                           style={{ backgroundColor: ARCH_STEPS[2].color, boxShadow: `0 0 10px ${ARCH_STEPS[2].color}` }}
                           animate={{ top: ['0%', '100%'] }} transition={{ repeat: Infinity, duration: 1.5 }} />
                       )}
                    </div>
                 </div>
              </div>

              {/* Row 2 */}
              <div className="flex items-center w-full relative z-10 flex-row-reverse">
                <NodeCard stepIndex={3} label="Workers" activeStep={activeStep} />
                <div className="flex-1 h-[2px] bg-border-light/40 relative shrink overflow-hidden mx-1">
                   <motion.div 
                     className="absolute inset-y-0 right-0" 
                     style={{ background: `linear-gradient(270deg, ${ARCH_STEPS[3].color}, ${ARCH_STEPS[4].color})` }}
                     initial={{ width: 0 }}
                     animate={{ width: activeStep >= 4 ? '100%' : 0 }} 
                     transition={{ duration: 0.4 }} 
                   />
                   {activeStep === 3 && (
                     <motion.div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full absolute top-1/2 -translate-y-1/2 blur-[1px] sm:blur-[2px]" 
                       style={{ backgroundColor: ARCH_STEPS[3].color, boxShadow: `0 0 10px ${ARCH_STEPS[3].color}` }}
                       animate={{ right: ['0%', '100%'] }} transition={{ repeat: Infinity, duration: 1.5 }} />
                   )}
                </div>
                <NodeCard stepIndex={4} label="Database" activeStep={activeStep} />
                <div className="flex-1 h-[2px] bg-border-light/40 relative shrink overflow-hidden mx-1">
                   <motion.div 
                     className="absolute inset-y-0 right-0" 
                     style={{ background: `linear-gradient(270deg, ${ARCH_STEPS[4].color}, ${ARCH_STEPS[5].color})` }}
                     initial={{ width: 0 }}
                     animate={{ width: activeStep >= 5 ? '100%' : 0 }} 
                     transition={{ duration: 0.4 }} 
                   />
                   {activeStep === 4 && (
                     <motion.div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full absolute top-1/2 -translate-y-1/2 blur-[1px] sm:blur-[2px]" 
                       style={{ backgroundColor: ARCH_STEPS[4].color, boxShadow: `0 0 10px ${ARCH_STEPS[4].color}` }}
                       animate={{ right: ['0%', '100%'] }} transition={{ repeat: Infinity, duration: 1.5 }} />
                   )}
                </div>
                <NodeCard stepIndex={5} label="Console" activeStep={activeStep} />
              </div>
              
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
