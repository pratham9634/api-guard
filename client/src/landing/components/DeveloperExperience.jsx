import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { Terminal, Globe, Code2, FileJson } from 'lucide-react';
import { useState } from 'react';

const TABS = [
  {
    id: 'curl',
    label: 'cURL',
    icon: Terminal,
    code: `curl -X POST https://api-guard.io/api/hit \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ak_prod_x8f2k9m3..." \\
  -d '{
    "endpoint": "/api/users",
    "method": "GET",
    "statusCode": 200,
    "latency": 42,
    "service": "user-service"
  }'`,
  },
  {
    id: 'js',
    label: 'JavaScript',
    icon: Code2,
    code: `// Using fetch
const response = await fetch(
  "https://api-guard.io/api/hit",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.API_GUARD_KEY
    },
    body: JSON.stringify({
      endpoint: "/api/users",
      method: "GET",
      statusCode: 200,
      latency: 42,
      service: "user-service"
    })
  }
);`,
  },
  {
    id: 'python',
    label: 'Python',
    icon: FileJson,
    code: `import requests

response = requests.post(
    "https://api-guard.io/api/hit",
    headers={
        "Content-Type": "application/json",
        "x-api-key": os.environ["API_GUARD_KEY"]
    },
    json={
        "endpoint": "/api/users",
        "method": "GET",
        "statusCode": 200,
        "latency": 42,
        "service": "user-service"
    }
)`,
  },
  {
    id: 'analytics',
    label: 'Analytics API',
    icon: Globe,
    code: `// Fetch dashboard data
GET /api/analytics/dashboard
  ?startTime=1718900000000
  &endTime=1718986400000

// Fetch detailed stats
GET /api/analytics/stats
  ?startTime=1718900000000
  &endTime=1718986400000
  &clientId=optional_client_id

// Response shape:
{
  "success": true,
  "data": {
    "totalHits": 124839,
    "errorHits": 142,
    "errorRate": 0.11,
    "avgLatency": 38.4,
    "uniqueEndpoints": 64,
    "uniqueServices": 12
  }
}`,
  },
];

export default function DeveloperExperience() {
  const [activeTab, setActiveTab] = useState('curl');
  const [ref, isInView] = useInView({ threshold: 0.15 });
  const tab = TABS.find(t => t.id === activeTab);

  return (
    <section ref={ref} className="py-24 relative">
      <div className="landing-container">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left — Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                          border border-accent-primary/30 bg-accent-primary/5
                          text-accent-primary text-sm font-medium mb-6">
              Developer First
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mb-4">
              Built for <span className="gradient-text">Developers</span>
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed mb-8">
              No SDKs to install. No complex configurations. Just a simple REST API call from any
              language, any framework, any platform. Send API hit data and start monitoring in seconds.
            </p>

            <div className="flex flex-col gap-4">
              {[
                { title: 'REST API', desc: 'Standard HTTP POST — works with any language' },
                { title: 'API Key Auth', desc: 'Simple header-based authentication' },
                { title: 'JSON Payload', desc: 'Clean, predictable request/response format' },
                { title: 'Real-time Processing', desc: 'RabbitMQ-powered async event pipeline' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -15 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-accent-primary/10 flex items-center
                              justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-accent-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text-primary">{item.title}</div>
                    <div className="text-sm text-text-secondary">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — Code */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Language Tabs */}
            <div className="flex gap-1 mb-3 p-1 bg-surface-card rounded-xl border border-border">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium
                           rounded-lg transition-all duration-200 cursor-pointer focus:outline-none
                           ${activeTab === t.id
                             ? 'bg-accent-primary text-white shadow-sm'
                             : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'}`}
                >
                  <t.icon size={14} />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Code Block */}
            <div className="code-block relative">
              <div className="absolute left-0 top-0 bottom-0 w-10 bg-white/[0.02]
                          border-r border-white/5" />
              <pre className="pl-12 text-sm leading-relaxed overflow-x-auto">
                {tab.code.split('\n').map((line, li) => (
                  <div key={`${activeTab}-${li}`} className="relative">
                    <span className="absolute -left-8 text-[11px] text-white/20 select-none
                                 w-6 text-right inline-block">
                      {li + 1}
                    </span>
                    <span>
                      {line.startsWith('//')
                        ? <span className="comment">{line}</span>
                        : <span>{line}</span>}
                    </span>
                  </div>
                ))}
              </pre>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
