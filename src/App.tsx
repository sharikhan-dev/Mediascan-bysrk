import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { DashboardSidebar, DashboardTab } from './components/DashboardSidebar';
import { OverviewView } from './components/OverviewView';
import { MyReportsView } from './components/MyReportsView';
import { UploadReportView } from './components/UploadReportView';
import { ReportDetailView } from './components/ReportDetailView';
import { HealthTrendsView } from './components/HealthTrendsView';
import { AIAssistantView } from './components/AIAssistantView';
import { SettingsView } from './components/SettingsView';
import { UserProfile, Report } from './types';
import {
  getLocalUser,
  setLocalUser,
  getLocalReports,
  addLocalReport,
  removeLocalReport,
  saveLocalReports,
} from './lib/supabase';
import { DEMO_REPORTS } from './lib/demoData';
import { Menu, ChevronRight } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() => getLocalUser());
  const [reports, setReports] = useState<Report[]>(() => getLocalReports());
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>(() => {
    return getLocalUser() ? 'dashboard' : 'landing';
  });

  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('overview');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    saveLocalReports(reports);
  }, [reports]);

  const handleAuthSuccess = (loggedUser: UserProfile) => {
    setUser(loggedUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setLocalUser(null);
    setUser(null);
    setCurrentView('landing');
    setDashboardTab('overview');
    setSelectedReportId(null);
  };

  const handleSaveReport = (newReport: Report) => {
    const updated = addLocalReport(newReport);
    setReports(updated);
    setSelectedReportId(newReport.id);
  };

  const handleDeleteReport = (reportId: string) => {
    const updated = removeLocalReport(reportId);
    setReports(updated);
    if (selectedReportId === reportId) {
      setSelectedReportId(null);
    }
  };

  const handleClearAllReports = () => {
    setReports([]);
    setSelectedReportId(null);
  };

  const handleLoadDemoData = () => {
    setReports(DEMO_REPORTS);
  };

  const handleNavigateLandingSection = (sectionId: string) => {
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAskAIAboutReport = (report: Report) => {
    setSelectedReportId(null);
    setDashboardTab('assistant');
  };

  const activeReport = selectedReportId
    ? reports.find((r) => r.id === selectedReportId) || null
    : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A0F1D] flex flex-col font-sans">
      {/* LANDING PAGE VIEW */}
      {currentView === 'landing' ? (
        <>
          <Navbar
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
            onGoToDashboard={() => setCurrentView('dashboard')}
            onNavigateLandingSection={handleNavigateLandingSection}
          />
          <LandingPage
            onGetStarted={() => {
              if (user) {
                setCurrentView('dashboard');
              } else {
                setAuthModalOpen(true);
              }
            }}
            onExploreFeatures={() => handleNavigateLandingSection('features')}
          />
        </>
      ) : (
        /* DASHBOARD APPLICATION VIEW */
        <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
          {/* Left Sidebar */}
          <DashboardSidebar
            currentTab={dashboardTab}
            onSelectTab={(tab) => {
              setDashboardTab(tab);
              setSelectedReportId(null);
            }}
            user={user}
            onLogout={handleLogout}
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
            reportCount={reports.length}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 lg:pl-64 overflow-hidden">
            {/* Top Workspace Header */}
            <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-8 flex items-center justify-between shrink-0 no-print">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors"
                  aria-label="Open navigation menu"
                >
                  <Menu className="w-4 h-4" />
                </button>

                {/* Contextual Breadcrumb */}
                <div className="flex items-center gap-2 text-xs font-mono font-medium text-slate-500 uppercase">
                  <button
                    onClick={() => {
                      setCurrentView('landing');
                    }}
                    className="hover:text-[#0A0F1D] transition-colors"
                  >
                    MediScan.ai
                  </button>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <button
                    onClick={() => {
                      setSelectedReportId(null);
                    }}
                    className="hover:text-blue-600 transition-colors text-slate-900 font-bold"
                  >
                    {dashboardTab === 'overview' && '01 · Overview'}
                    {dashboardTab === 'reports' && '02 · Archive'}
                    {dashboardTab === 'upload' && '03 · Ingestion'}
                    {dashboardTab === 'trends' && '04 · Trajectories'}
                    {dashboardTab === 'assistant' && '05 · Assistant'}
                    {dashboardTab === 'settings' && '06 · Configuration'}
                  </button>
                  {activeReport && (
                    <>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                      <span className="text-blue-600 font-bold truncate max-w-[200px]">
                        {activeReport.original_filename.replace('.pdf', '')}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Top Bar Right Actions */}
              <div className="flex items-center gap-3 text-xs font-mono">
                <button
                  onClick={() => setCurrentView('landing')}
                  className="px-3 py-1 font-bold text-slate-600 hover:text-[#0A0F1D] uppercase transition-colors"
                >
                  Return to Home
                </button>
                <div className="w-7 h-7 bg-[#0A0F1D] text-white flex items-center justify-center font-bold text-xs font-mono">
                  {user?.display_name ? user.display_name.charAt(0).toUpperCase() : 'P'}
                </div>
              </div>
            </header>

            {/* Scrollable Viewport */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              {activeReport ? (
                <ReportDetailView
                  report={activeReport}
                  onBack={() => setSelectedReportId(null)}
                  onDeleteReport={handleDeleteReport}
                  onAskAI={handleAskAIAboutReport}
                />
              ) : (
                <>
                  {dashboardTab === 'overview' && (
                    <OverviewView
                      user={user}
                      reports={reports}
                      onUploadClick={() => setDashboardTab('upload')}
                      onViewReport={(id) => setSelectedReportId(id)}
                      onViewTrends={() => setDashboardTab('trends')}
                      onLoadDemoData={handleLoadDemoData}
                    />
                  )}

                  {dashboardTab === 'reports' && (
                    <MyReportsView
                      reports={reports}
                      onViewReport={(id) => setSelectedReportId(id)}
                      onUploadClick={() => setDashboardTab('upload')}
                      onDeleteReport={handleDeleteReport}
                    />
                  )}

                  {dashboardTab === 'upload' && (
                    <UploadReportView
                      onSaveReport={handleSaveReport}
                      onCancel={() => setDashboardTab('overview')}
                    />
                  )}

                  {dashboardTab === 'trends' && (
                    <HealthTrendsView
                      reports={reports}
                      onUploadClick={() => setDashboardTab('upload')}
                    />
                  )}

                  {dashboardTab === 'assistant' && (
                    <AIAssistantView reports={reports} initialSelectedReportId={selectedReportId} />
                  )}

                  {dashboardTab === 'settings' && (
                    <SettingsView
                      user={user}
                      onUpdateUser={(u) => setUser(u)}
                      onLogout={handleLogout}
                      onClearAllReports={handleClearAllReports}
                    />
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
