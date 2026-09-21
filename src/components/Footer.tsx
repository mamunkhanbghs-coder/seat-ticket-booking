import React from 'react';
import { ShieldCheck, Mail, MapPin, Phone, Github, Globe, ExternalLink, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer id="app-footer" className="bg-white text-slate-600 border-t border-slate-200 pt-12 pb-8 mt-16 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg bg-[#3A86FF] flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-blue-500/20">
                TB
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                NexusTicket<span className="text-[#3A86FF]">Engine</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              High-concurrency ticket and seat booking platform built with Django, PostgreSQL row-level locks,
              Redis caching, and Celery background workers.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-800 font-medium bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero Double-Booking Guarantee</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-slate-900 font-bold text-sm uppercase tracking-wider mb-4">Platform Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  id="footer-nav-seats"
                  onClick={() => onNavigate?.('booking')}
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Interactive Seat Map
                </button>
              </li>
              <li>
                <button
                  id="footer-nav-concurrency"
                  onClick={() => onNavigate?.('concurrency')}
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  100-User Concurrency Simulator
                </button>
              </li>
              <li>
                <button
                  id="footer-nav-pricing"
                  onClick={() => onNavigate?.('pricing')}
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Dynamic Pricing Engine
                </button>
              </li>
              <li>
                <button
                  id="footer-nav-admin"
                  onClick={() => onNavigate?.('admin')}
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Admin Occupancy Console
                </button>
              </li>
              <li>
                <button
                  id="footer-nav-docs"
                  onClick={() => onNavigate?.('architecture')}
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Django Architecture Specs
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-slate-900 font-bold text-sm uppercase tracking-wider mb-4">Contact & Support</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-[#3A86FF]" />
                <span>support@nexusticket.internal</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-[#3A86FF]" />
                <span>+880 1700-000000</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 text-[#3A86FF]" />
                <span>Dhaka &amp; International Cloud Regions</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Lock className="w-4 h-4 text-[#00B894]" />
                <span>PCI-DSS Compliant Agnostic Tokenization</span>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h4 className="text-slate-900 font-bold text-sm uppercase tracking-wider mb-4">Policies &amp; Verification</h4>
            <ul className="space-y-2.5 text-sm text-slate-600 mb-4">
              <li>
                <span className="hover:text-slate-900 cursor-pointer transition-colors">Privacy Policy</span>
              </li>
              <li>
                <span className="hover:text-slate-900 cursor-pointer transition-colors">Terms &amp; Conditions</span>
              </li>
              <li>
                <span className="hover:text-slate-900 cursor-pointer transition-colors">5-Minute Hold Policy</span>
              </li>
              <li>
                <span className="hover:text-slate-900 cursor-pointer transition-colors">Refund &amp; Resale Guidelines</span>
              </li>
            </ul>
            <div className="flex space-x-3 pt-2">
              <a
                id="footer-social-portfolio"
                href="https://aamkhan.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:text-white hover:bg-[#3A86FF] transition-all"
                title="Mamun Khan Portfolio"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                id="footer-social-github"
                href="https://github.com/mamunkhanbghs"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:text-white hover:bg-[#3A86FF] transition-all"
                title="GitHub Repository"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 pt-8 mt-4 text-center">
          <p className="text-base text-slate-700 font-semibold tracking-wide">
            All Credits Reserved by{' '}
            <a
              id="footer-author-link"
              href="https://aamkhan.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3A86FF] underline decoration-[#3A86FF]/40 hover:decoration-[#3A86FF] hover:text-blue-700 inline-flex items-center gap-1 font-bold transition-all ml-1"
            >
              Mamun Khan
              <ExternalLink className="w-3.5 h-3.5 inline" />
            </a>
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Production-Grade Distributed Concurrency Engine • PostgreSQL 15 `SELECT FOR UPDATE` • Redis 7 • Celery Beat
          </p>
        </div>
      </div>
    </footer>
  );
};
