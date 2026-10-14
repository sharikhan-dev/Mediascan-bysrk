import React from 'react';
import { Activity, LayoutDashboard, ArrowUpRight } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
  onGoToDashboard: () => void;
  onNavigateLandingSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onGoToDashboard,
  onNavigateLandingSection,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#F8FAFC]/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark in Sora */}
        <button
          onClick={() => onNavigateLandingSection('hero')}
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
        >
          <div className="w-7 h-7 bg-[#0A0F1D] text-white flex items-center justify-center rounded-sm font-mono text-xs font-bold tracking-tighter">
            M+
          </div>
          <span className="text-base font-extrabold tracking-tight text-[#0A0F1D] font-editorial">
            MediScan<span className="text-blue-600">.ai</span>
          </span>
        </button>

        {/* Zone 2: Editorial Navigation Links with Swiss Precision */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-tight text-slate-600">
          <button
            onClick={() => onNavigateLandingSection('features')}
            className="hover:text-[#0A0F1D] transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <span className="text-[10px] font-mono text-slate-400">01</span>
            <span>Features</span>
          </button>
          <button
            onClick={() => onNavigateLandingSection('how-it-works')}
            className="hover:text-[#0A0F1D] transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <span className="text-[10px] font-mono text-slate-400">02</span>
            <span>Methodology</span>
          </button>
          <button
            onClick={() => onNavigateLandingSection('privacy')}
            className="hover:text-[#0A0F1D] transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <span className="text-[10px] font-mono text-slate-400">03</span>
            <span>Data Protocol</span>
          </button>
          <button
            onClick={() => onNavigateLandingSection('faq')}
            className="hover:text-[#0A0F1D] transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <span className="text-[10px] font-mono text-slate-400">04</span>
            <span>FAQ</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <button
              onClick={onGoToDashboard}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0A0F1D] hover:bg-slate-800 rounded-md transition-all shadow-xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-[#0A0F1D] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0A0F1D] hover:bg-blue-600 rounded-md transition-colors shadow-xs"
              >
                <span>Analyze Report</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
