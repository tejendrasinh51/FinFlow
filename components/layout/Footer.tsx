import { TrendingUp, Globe, Link2, ExternalLink, Mail } from 'lucide-react'

const footerLinks = {
  Product: ['Dashboard', 'Reports', 'Exports', 'API', 'Integrations'],
  Company: ['About', 'Case Studies', 'Blog', 'Careers', 'Press'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Security', 'GDPR'],
  Support: ['Documentation', 'Status', 'Contact', 'Community'],
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-surface">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/30 flex items-center justify-center">
                <TrendingUp size={16} className="text-cyan" />
              </div>
              <span className="font-display font-bold">FINFLOW</span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              Unified real-time financial intelligence for enterprise teams.
            </p>
            <div className="flex gap-3">
              {[Globe, Link2, ExternalLink, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-text-tertiary hover:text-cyan hover:border-cyan/40 transition-all"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-text-primary font-medium text-sm mb-4 font-display">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-text-tertiary hover:text-text-secondary text-sm transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-tertiary text-sm font-mono">
            © 2024 FinFlow Analytics. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="live-dot"></span>
            <span className="text-text-tertiary text-sm font-mono">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
