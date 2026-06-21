import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    description: 'Perfect for side projects and early-stage products.',
    features: [
      '1 client organization',
      '10,000 hits/month',
      '7-day data retention',
      '2 API keys',
      'Dashboard & Analytics',
      'Community support',
    ],
    cta: 'Get Started Free',
    highlighted: false,
    color: '#64748b',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For growing teams that need deeper insights.',
    features: [
      '5 client organizations',
      '1M hits/month',
      '90-day data retention',
      'Unlimited API keys',
      'All analytics features',
      'Role-based access control',
      'Priority email support',
      'Export reports (coming soon)',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
    color: '#4f46e5',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations with advanced compliance needs.',
    features: [
      'Unlimited organizations',
      'Unlimited hits',
      '1-year data retention',
      'Unlimited everything',
      'Custom alert rules',
      'Dedicated support',
      'SLA guarantee',
      'On-premise deployment',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    highlighted: false,
    color: '#8b5cf6',
  },
];

export default function Pricing() {
  const [ref, isInView] = useInView({ threshold: 0.1 });

  return (
    <section id="pricing" ref={ref} className="py-24 relative">
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
            Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mb-4">
            Simple, <span className="gradient-text">Transparent Pricing</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Start free. Upgrade when you need more power. No hidden fees.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 25 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`rounded-2xl p-[1px] ${
                plan.highlighted ? 'pricing-highlight' : ''
              }`}
            >
              <div
                className={`rounded-2xl p-7 h-full flex flex-col ${
                  plan.highlighted
                    ? 'bg-surface-primary border-0'
                    : 'bg-surface-card border border-border'
                }`}
              >
                {/* Badge */}
                {plan.highlighted && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                              bg-accent-primary/10 text-accent-primary text-xs font-semibold
                              mb-4 self-start">
                    <Sparkles size={12} />
                    Most Popular
                  </div>
                )}

                <h3 className="text-xl font-bold text-text-primary mb-1">{plan.name}</h3>
                <p className="text-sm text-text-secondary mb-5">{plan.description}</p>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-text-primary">{plan.price}</span>
                  {plan.period && (
                    <span className="text-text-secondary text-sm">{plan.period}</span>
                  )}
                </div>

                {/* Features */}
                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check
                        size={16}
                        className="flex-shrink-0 mt-0.5"
                        style={{ color: plan.color }}
                      />
                      <span className="text-text-secondary">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  to={plan.name === 'Enterprise' ? '#' : '/onboard'}
                  className={`block w-full text-center py-3 px-6 rounded-xl text-sm font-semibold
                           transition-all duration-200 ${
                    plan.highlighted
                      ? 'accent-gradient text-white shadow-lg shadow-accent-primary/25 hover:shadow-xl hover:shadow-accent-primary/30'
                      : 'bg-surface-secondary border border-border text-text-primary hover:bg-surface-card-hover'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
