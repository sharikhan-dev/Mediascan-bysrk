import React from 'react';
import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  TrendingUp,
  MessageSquare,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { UserProfile } from '../types';

export type DashboardTab = 'overview' | 'reports' | 'upload' | 'trends' | 'assistant' | 'settings';

interface DashboardSidebarProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  user: UserProfile | null;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  reportCount: number;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onLogout,
  mobileOpen,
  onCloseMobile,
  reportCount,
}) => {
  const navItems = [
    { id: 'overview' as DashboardTab, label: 'Overview', code: '01', icon: LayoutDashboard },
    {
      id: 'reports' as DashboardTab,
      label: 'My Reports',
      code: '02',
      icon: FileText,
      badge: reportCount > 0 ? reportCount : undefined,
    },
    { id: 'upload' as DashboardTab, label: 'Upload Report', code: '03', icon: UploadCloud },
    { id: 'trends' as DashboardTab, label: 'Health Trends', code: '04', icon: TrendingUp },
    { id: 'assistant' as DashboardTab, label: 'AI Assistant', code: '05', icon: MessageSquare },
    { id: 'settings' as DashboardTab, label: 'Settings', code: '06', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#0A0F1D]/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Editorial Studio Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Branding and Navigation */}
        <div className="p-5 space-y-6">
          {/* Logo Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-[#0A0F1D] text-white flex items-center justify-center font-mono text-xs font-bold tracking-tighter">
                M+
              </div>
              <span className="text-sm font-extrabold tracking-tight text-[#0A0F1D] font-editorial">
                MediScan<span className="text-blue-600">.ai</span>
              </span>
            </div>
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-900 rounded"
              aria-label="Close navigation sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 text-xs" aria-label="Workspace navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none text-left transition-colors font-medium ${
                    isActive
                      ? 'bg-[#0A0F1D] text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-[#0A0F1D] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-mono tracking-tighter ${
                        isActive ? 'text-blue-400' : 'text-slate-400'
                      }`}
                    >
                      {item.code}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 font-mono tabular-nums ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Sign out */}
        <div className="p-5 border-t border-slate-200/80 space-y-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
              Operator
            </span>
            <p className="font-semibold text-slate-900 truncate mt-0.5">
              {user?.display_name || 'Patient'}
            </p>
            <p className="text-[11px] text-slate-500 font-mono truncate">{user?.email || 'Authenticated'}</p>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
