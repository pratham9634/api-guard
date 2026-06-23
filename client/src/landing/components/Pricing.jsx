import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Check, Sparkles, Sliders } from 'lucide-react';
import { Link } from 'react-router-dom';

const SLIDER_CONFIGS = [
  { hits: '10K', price: 0, retention: 7, support: 'Community support', clients: '1 client org', label: 'Hobbyist' },
  { hits: '100K', price: 9, retention: 30, support: 'Standard Email', clients: '3 client orgs', label: 'Developer' },
  { hits: '1M', price: 29, retention: 90, support: 'Priority Email', clients: '5 client orgs', label: 'Startup' },
  { hits: '10M', price: 149, retention: 180, support: 'Slack Channel + Email', clients: '20 client orgs', label: 'Growth' },
  { hits: '50M+', price: 499, retention: 365, support: 'Dedicated 24/7 SLA', clients: 'Unlimited orgs', label: 'Scale' }
];

export default function Pricing() {
  const [sliderVal, setSliderVal] = useState(2); // Default to 1M plan
  const currentConfig = SLIDER_CONFIGS[sliderVal];
  
  const priceDisplayRef = useRef(null);
  const retentionDisplayRef = useRef(null);

  // Update counts with GSAP on value change
  useEffect(() => {
    if (priceDisplayRef.current) {
      gsap.to(priceDisplayRef.current, {
        innerText: currentConfig.price,
        duration: 0.35,
        snap: { innerText: 1 },
        ease: 'power1.out',
        onUpdate: function() {
          // Add dollar sign formatting on update
          if (priceDisplayRef.current) {
            const val = Math.floor(this.targets()[0].innerText);
            priceDisplayRef.current.innerHTML = val === 0 ? 'Free' : `$${val}`;
          }
        }
      });
    }

    if (retentionDisplayRef.current) {
      gsap.to(retentionDisplayRef.current, {
        innerText: currentConfig.retention,
        duration: 0.35,
        snap: { innerText: 1 },
        ease: 'power1.out',
        onUpdate: function() {
          if (retentionDisplayRef.current) {
            const val = Math.floor(this.targets()[0].innerText);
            retentionDisplayRef.current.innerHTML = `${val} days`;
          }
        }
      });
    }
  }, [sliderVal, currentConfig]);

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="landing-container">
        
        {/* Header */}
        <div className="text-center mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                        border border-accent-primary/20 bg-accent-primary/5
                        text-accent-primary text-xs font-semibold mb-6">
            Pricing Calculator
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight mb-5">
            Flexible Scale <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Choose your ingestion volume. Pay only for what your services actually broadcast.
          </p>
        </div>

        {/* Pricing Layout */}
        <div className="grid lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-center relative z-10">
          
          {/* Interactive Calculator Panel (7 Columns) */}
          <div className="lg:col-span-7 p-8 rounded-2xl glass-landing border border-border/30 bg-surface-card/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-accent-primary uppercase tracking-wider mb-8">
                <Sliders size={14} />
                Volume Price Slider
              </div>

              <h3 className="text-xl font-bold text-text-primary mb-2">
                Estimate Monthly Volumes
              </h3>
              <p className="text-xs text-text-secondary mb-8">
                Drag the indicator to calculate prices, user organization caps, and data logs storage windows.
              </p>

              {/* Slider Input */}
              <div className="relative mb-10">
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={sliderVal}
                  onChange={(e) => setSliderVal(parseInt(e.target.value))}
                  className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent-primary"
                />
                
                {/* Steps labels */}
                <div className="flex justify-between mt-4 text-[10px] text-text-tertiary font-mono">
                  {SLIDER_CONFIGS.map((c, i) => (
                    <span 
                      key={c.hits} 
                      onClick={() => setSliderVal(i)}
                      className={`cursor-pointer font-bold ${sliderVal === i ? 'text-accent-primary' : ''}`}
                    >
                      {c.hits}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Config Breakdown indicators */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/10">
              <div>
                <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Scope Tier</span>
                <div className="text-lg font-bold text-text-primary mt-1">{currentConfig.label} Plan</div>
              </div>
              <div>
                <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Organization Tenants</span>
                <div className="text-lg font-bold text-text-primary mt-1">{currentConfig.clients}</div>
              </div>
            </div>
          </div>

          {/* Pricing Highlight Card (5 Columns) */}
          <div className="lg:col-span-5 rounded-2xl p-[1px] pricing-highlight shadow-2xl">
            <div className="rounded-2xl p-8 bg-surface-primary flex flex-col items-stretch text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                            bg-accent-primary/10 text-accent-primary text-[10px] font-bold
                            mb-6 self-start">
                <Sparkles size={11} />
                Calculated Tier
              </div>

              <h3 className="text-lg font-bold text-text-primary mb-1">Tailored Plan</h3>
              <p className="text-xs text-text-secondary mb-6">Perfect scale fit for your API infrastructure</p>

              {/* Price Display (GSAP Animated) */}
              <div className="flex items-baseline gap-1.5 mb-6 pb-6 border-b border-border/10">
                <span 
                  ref={priceDisplayRef} 
                  className="text-4xl sm:text-5xl font-extrabold text-text-primary font-mono tracking-tight"
                >
                  $29
                </span>
                <span className="text-text-secondary text-xs font-semibold">/ month</span>
              </div>

              {/* Features List */}
              <ul className="flex flex-col gap-3.5 mb-8">
                <li className="flex items-center gap-3 text-xs text-text-secondary">
                  <Check size={14} className="text-accent-primary flex-shrink-0" />
                  <span>Interactive Live Ingestion Stream</span>
                </li>
                <li className="flex items-center gap-3 text-xs text-text-secondary">
                  <Check size={14} className="text-accent-primary flex-shrink-0" />
                  <span>Data Retention: <strong ref={retentionDisplayRef} className="text-text-primary">90 days</strong></span>
                </li>
                <li className="flex items-center gap-3 text-xs text-text-secondary">
                  <Check size={14} className="text-accent-primary flex-shrink-0" />
                  <span className="capitalize">{currentConfig.support}</span>
                </li>
                <li className="flex items-center gap-3 text-xs text-text-secondary">
                  <Check size={14} className="text-accent-primary flex-shrink-0" />
                  <span>Unlimited Sandbox/Prod API Keys</span>
                </li>
              </ul>

              {/* CTA */}
              <Link
                to="/onboard"
                className="block w-full text-center py-3.5 px-6 rounded-xl text-sm font-semibold
                         accent-gradient text-white shadow-lg shadow-accent-primary/25 hover:shadow-xl 
                         hover:shadow-accent-primary/30 active:scale-[0.98] transition-all duration-200"
              >
                Start Free Trial
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
