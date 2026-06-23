import { Shield } from 'lucide-react';

const FOOTER_LINKS = {
  Product: [
    { label: 'Showcase', href: '#features' },
    { label: 'Pricing Calculator', href: '#pricing' },
    { label: 'Interactive Playground', href: '#playground' },
  ],
  Developers: [
    { label: 'Architecture Ingestion', href: '#architecture' },
    { label: 'System Telemetry', href: '#' },
    { label: 'API Sandbox Key', href: '#playground' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Latest Updates', href: '#' },
    { label: 'Support Desk', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Security Portal', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border/10 bg-surface-secondary/80 backdrop-blur-md relative z-10 overflow-hidden">
      {/* Premium ambient light spotlight */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[150px]
                      bg-[radial-gradient(circle,rgba(79,70,229,0.06),transparent_70%)]
                      blur-3xl pointer-events-none z-0" />
      
      <div className="landing-container py-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          
          {/* Brand & Socials Column (2 Grid Cols) */}
          <div className="col-span-2 flex flex-col justify-between pr-4">
            <div>
              <div className="flex items-center gap-2.5 mb-5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary
                              flex items-center justify-center shadow-lg shadow-accent-primary/20
                              group-hover:scale-105 transition-transform duration-300">
                  <Shield size={18} className="text-white" />
                </div>
                <span className="text-lg font-extrabold text-text-primary tracking-tight">API Guard</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed mb-6 max-w-sm">
                High-throughput, event-driven API hit tracking and queue buffer telemetry monitoring console.
              </p>
            </div>
            
            {/* Social Icons */}
            <div className="flex gap-3">
              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-surface-card/65 border border-border/30
                         flex items-center justify-center hover:bg-surface-card-hover hover:border-accent-primary/40
                         transition-all duration-200"
                aria-label="GitHub"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-text-secondary hover:text-text-primary transition-colors">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              {/* Twitter/X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-surface-card/65 border border-border/30
                         flex items-center justify-center hover:bg-surface-card-hover hover:border-accent-primary/40
                         transition-all duration-200"
                aria-label="Twitter"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-text-secondary hover:text-text-primary transition-colors">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links Columns (3 Grid Cols) */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title} className="flex flex-col">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-5">{title}</h4>
              <ul className="flex flex-col gap-3">
                {links.map(link => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar info */}
        <div className="border-t border-border/10 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-tertiary">
          <span>© {new Date().getFullYear()} API Guard. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Built with
            <span className="text-danger animate-pulse">❤️</span>
            for high-performance developers
          </span>
        </div>
      </div>
    </footer>
  );
}
