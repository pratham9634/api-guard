import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import {
  EyeOff, Clock, Puzzle, BellOff,
  Eye, Zap, Settings, BarChart3
} from 'lucide-react';

const PROBLEMS = [
  { icon: EyeOff, text: 'APIs fail silently — no one notices until users complain' },
  { icon: Clock, text: 'Latency spikes go undetected, degrading user experience' },
  { icon: Puzzle, text: 'Monitoring tools like Grafana/Datadog are overkill' },
  { icon: BellOff, text: 'Managing API keys across environments is painful' },
];

const SOLUTIONS = [
  { icon: Eye, text: 'Real-time hit and error tracking per endpoint' },
  { icon: Zap, text: 'Instant latency trends with configurable time windows' },
  { icon: Settings, text: 'Lightweight — no complex infrastructure needed' },
  { icon: BarChart3, text: 'Full API key lifecycle management per client' },
];

export default function ProblemSolution() {
  const [ref, isInView] = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-24 relative">
      <div className="landing-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mb-4">
            Stop Flying Blind with Your APIs
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Most teams don't know their APIs are struggling until users start leaving.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Problems */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-sm font-bold uppercase tracking-wider text-red-400 mb-6"
            >
              The Problem
            </motion.div>
            <div className="flex flex-col gap-4">
              {PROBLEMS.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  className="flex items-start gap-4 p-5 rounded-xl bg-red-500/5
                           border border-red-500/10"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center
                              flex-shrink-0 mt-0.5">
                    <item.icon size={20} className="text-red-400" />
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed pt-1.5">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-6"
            >
              The Solution
            </motion.div>
            <div className="flex flex-col gap-4">
              {SOLUTIONS.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  className="flex items-start gap-4 p-5 rounded-xl bg-emerald-500/5
                           border border-emerald-500/10"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center
                              flex-shrink-0 mt-0.5">
                    <item.icon size={20} className="text-emerald-400" />
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed pt-1.5">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
