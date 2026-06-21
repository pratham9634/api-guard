import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: 'How does API monitoring work?',
    a: 'API Guard works by receiving hit data from your application via a simple REST API call. Your app sends a POST request to our /api/hit endpoint with details like the endpoint path, HTTP method, status code, and latency. We process this data through a RabbitMQ event pipeline and store it in PostgreSQL (for time-series analytics) and MongoDB (for document storage). You can then view real-time dashboards, charts, and analytics in the web UI.',
  },
  {
    q: 'How often are metrics updated?',
    a: 'Metrics are processed in real-time through our event-driven architecture. As soon as your application sends a hit, it\'s queued in RabbitMQ and processed by our consumer service. Dashboard data refreshes every 30 seconds by default, and you can manually refresh at any time. Analytics are available with configurable time ranges from 1 hour to 30 days.',
  },
  {
    q: 'Can I monitor internal/private APIs?',
    a: 'Yes! API Guard doesn\'t need to access your APIs directly — it works by receiving hit data that your application sends. This means it works with internal, private, or VPN-protected APIs without any firewall changes. You just need your application to make outbound POST requests to the API Guard endpoint.',
  },
  {
    q: 'How do API keys and environments work?',
    a: 'You can create multiple API keys per client organization, each scoped to a specific environment (production, staging, development, or testing). Keys can be rotated for security (old key is replaced with a new one), revoked (disabled but not deleted), or permanently deleted. Each key has a unique Key ID for identification.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes! The Starter plan is completely free and includes 1 client organization, 10,000 hits per month, 7-day data retention, and full access to the dashboard and analytics. It\'s perfect for side projects, personal APIs, or evaluating the platform before upgrading.',
  },
  {
    q: 'How is data stored and processed?',
    a: 'API Guard uses a polyglot persistence architecture. Hit data is queued in RabbitMQ for reliable async processing, then stored in PostgreSQL for time-series analytics (optimized for time-bucketed queries) and MongoDB for document storage (user accounts, client configs, API keys). This architecture ensures zero data loss and efficient querying.',
  },
  {
    q: 'What about multi-tenant support?',
    a: 'API Guard is designed as a multi-tenant platform from the ground up. A Super Admin can create multiple client organizations, each with their own users, API keys, and isolated analytics data. Client Admins manage their own organization, while Client Viewers have read-only access.',
  },
];

export default function FAQ() {
  const [ref, isInView] = useInView({ threshold: 0.1 });
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section id="faq" ref={ref} className="py-24 relative">
      <div className="landing-container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                        border border-accent-primary/30 bg-accent-primary/5
                        text-accent-primary text-sm font-medium mb-6">
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
        </motion.div>

        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-surface-card border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left
                         cursor-pointer focus:outline-none group"
                aria-expanded={openIndex === i}
              >
                <span className="text-sm font-semibold text-text-primary pr-4">
                  {item.q}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-text-tertiary flex-shrink-0 transition-transform duration-300
                           ${openIndex === i ? 'rotate-180' : ''}`}
                />
              </button>
              <div className={`faq-answer ${openIndex === i ? 'open' : ''}`}>
                <div>
                  <div className="px-6 pb-5 text-sm text-text-secondary leading-relaxed">
                    {item.a}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
