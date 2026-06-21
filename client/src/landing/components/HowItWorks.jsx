import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { UserPlus, Send, LineChart } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Register Your API',
    description: 'Create a client organization and generate an API key in seconds.',
    code: `// Create via Dashboard or API
POST /api/admin/clients/onboard
{
  "name": "Acme Corp",
  "email": "dev@acme.com"
}

// Generate API Key
POST /api/admin/clients/:id/api/keys
{
  "name": "Production Key",
  "environment": "production"
}`,
  },
  {
    number: '02',
    icon: Send,
    title: 'Send API Hit Data',
    description: 'Instrument your API to send hit data with a single POST request.',
    code: `// Send hit data to API Guard
POST /api/hit
Headers: {
  "x-api-key": "your_api_key_here"
}
Body: {
  "endpoint": "/api/users",
  "method": "GET",
  "statusCode": 200,
  "latency": 42,
  "service": "user-service"
}`,
  },
  {
    number: '03',
    icon: LineChart,
    title: 'Analyze Performance',
    description: 'View real-time dashboards with charts, filters, and configurable time ranges.',
    code: `// Query analytics
GET /api/analytics/dashboard
  ?startTime=1718900000000
  &endTime=1718986400000

// Response includes:
// → stats: totalHits, errorRate, avgLatency
// → topEndpoints: [{endpoint, hits, errors}]
// → recentActivity: time-series data`,
  },
];

export default function HowItWorks() {
  const [ref, isInView] = useInView({ threshold: 0.1 });

  return (
    <section id="how-it-works" ref={ref} className="py-24 relative">
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
            Quick Start
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mb-4">
            Up and Running in <span className="gradient-text">3 Simple Steps</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            No complex setup. No heavy SDKs. Just a simple REST API call.
          </p>
        </motion.div>

        <div className="flex flex-col gap-16">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`grid lg:grid-cols-2 gap-10 items-center ${
                i % 2 === 1 ? 'lg:direction-rtl' : ''
              }`}
            >
              {/* Text Side */}
              <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-primary/10
                              flex items-center justify-center">
                    <step.icon size={24} className="text-accent-primary" />
                  </div>
                  <span className="text-5xl font-extrabold text-text-primary/10">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-3">
                  {step.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Code Side */}
              <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                <div className="code-block relative overflow-hidden">
                  {/* Line numbers gutter */}
                  <div className="absolute left-0 top-0 bottom-0 w-10 bg-white/[0.02]
                              border-r border-white/5" />
                  <pre className="pl-12 text-sm leading-relaxed whitespace-pre-wrap">
                    {step.code.split('\n').map((line, li) => (
                      <div key={li} className="relative">
                        <span className="absolute -left-8 text-[11px] text-white/20 select-none
                                     w-6 text-right inline-block">
                          {li + 1}
                        </span>
                        <span>
                          {line.startsWith('//')
                            ? <span className="comment">{line}</span>
                            : highlightLine(line)}
                        </span>
                      </div>
                    ))}
                  </pre>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Simple syntax highlighter */
function highlightLine(line) {
  return line
    .replace(/(POST|GET|PUT|DELETE|Headers|Body)/g, '<kw>$1</kw>')
    .replace(/("(?:[^"\\]|\\.)*")/g, '<str>$1</str>')
    .replace(/(\d+)/g, '<num>$1</num>')
    .split(/(<kw>|<\/kw>|<str>|<\/str>|<num>|<\/num>)/)
    .reduce((acc, part, idx, arr) => {
      if (part === '<kw>') {
        acc.push(<span key={idx} className="keyword">{arr[idx + 1]}</span>);
        arr[idx + 1] = null;
      } else if (part === '<str>') {
        acc.push(<span key={idx} className="string">{arr[idx + 1]}</span>);
        arr[idx + 1] = null;
      } else if (part === '<num>') {
        acc.push(<span key={idx} className="number">{arr[idx + 1]}</span>);
        arr[idx + 1] = null;
      } else if (part && !part.startsWith('</') && !part.startsWith('<')) {
        acc.push(<span key={idx}>{part}</span>);
      }
      return acc;
    }, []);
}
