import React, { useEffect, useState } from 'react';
import {
  Award,
  FileCheck2,
  AlertTriangle,
  PlusCircle,
  MapPin,
  Calendar,
  Sparkles,
  RefreshCw,
  Trees,
  Clock,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import type { Report } from '../types';
import { MapView } from '../components/MapView';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface DashboardProps {
  onOpenReportModal: () => void;
  onOpenAuthModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenReportModal,
  onOpenAuthModal,
}) => {
  const { isAuthenticated, user, fetchCurrentUser } = useAuthStore();
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const revealContainerRef = useScrollReveal<HTMLDivElement>();

  const fetchReports = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await api.get<Report[]>('/api/reports/me');
      setMyReports(res.data);
    } catch (err) {
      console.error('Failed to load user reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchReports();
  }, [isAuthenticated]);

  const getTier = (points: number = 0) => {
    if (points >= 500) return { title: 'Apex Mangrove Sentinel', color: 'text-emerald-400' };
    if (points >= 200) return { title: 'Veteran Coastal Warden', color: 'text-teal-400' };
    if (points >= 50) return { title: 'Active Estuary Ranger', color: 'text-cyan-400' };
    return { title: 'Apprentice Guardian', color: 'text-emerald-300' };
  };

  const tier = getTier(user?.points);

  const scrollToMetrics = () => {
    document.getElementById('dashboard-metrics')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="dashboard-page">
      {/* Full-Viewport Hero Section */}
      <section className="hero-fullscreen">
        <div className="hero-bg-image" />
        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge-pill-emerald flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Real-Time Coastal Sentinel Network</span>
              </span>
              <span className="text-xs text-emerald-300/80 font-mono hidden sm:inline">
                Satellite Telemetry Active
              </span>
            </div>

            <h1 className="display-hero mb-4">
              Protect. Report. Restore.
            </h1>

            <p className="display-subtitle text-base sm:text-lg mb-8 max-w-2xl text-gray-200">
              Empowering frontline coastal communities and AI satellite telemetry to detect illegal deforestation,
              pollution, and storm damage across vital mangrove ecosystems before irreversible loss occurs.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenReportModal}
                className="btn-primary flex items-center gap-2 py-3 px-6 text-sm font-semibold shadow-xl shadow-emerald-950/60"
              >
                <PlusCircle className="w-5 h-5 text-white" />
                <span>Report Incident</span>
              </button>

              <button
                onClick={scrollToMetrics}
                className="btn-secondary flex items-center gap-2 py-3 px-6 text-sm font-semibold"
              >
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>Explore Live Data</span>
              </button>
            </div>
          </div>

          {/* Four Live Impact Counters */}
          <div className="impact-counter-grid">
            <div className="impact-counter">
              <div className="impact-number">
                <AnimatedCounter end={72400} suffix=" Ha" />
              </div>
              <div className="impact-label">Hectares Monitored</div>
            </div>

            <div className="impact-counter">
              <div className="impact-number">
                <AnimatedCounter end={1420} suffix="+" />
              </div>
              <div className="impact-label">Active Coastal Guardians</div>
            </div>

            <div className="impact-counter">
              <div className="impact-number">
                <AnimatedCounter end={98.4} decimals={1} suffix="%" />
              </div>
              <div className="impact-label">AI Anomaly Accuracy</div>
            </div>

            <div className="impact-counter">
              <div className="impact-number">
                <AnimatedCounter end={340} suffix="+" />
              </div>
              <div className="impact-label">Threat Reports Validated</div>
            </div>
          </div>
        </div>

        {/* Bouncing Scroll Down Indicator */}
        <div
          onClick={scrollToMetrics}
          className="scroll-down-indicator"
          role="button"
          tabIndex={0}
          aria-label="Scroll to dashboard overview"
        >
          <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-300/80 mb-1">
            Scroll Down
          </span>
          <ChevronDown className="w-4 h-4 text-emerald-400" />
        </div>
      </section>

      {/* Downstream Dashboard Content */}
      <div className="page-root" id="dashboard-metrics" ref={revealContainerRef}>
        {/* Hero Welcome & Quick Stats */}
        <div className="dashboard-hero-card reveal">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge-pill-emerald">Live Conservation Node</span>
                <span className="text-xs text-gray-400">Monitoring Sector: Global Coastal Delta</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                {isAuthenticated && user
                  ? `Welcome Back, ${user.username}`
                  : 'Mangrove Protection Command'}
              </h2>
              <p className="text-sm text-gray-300 mt-1 max-w-xl">
                Track environmental incidents, validate satellite alerts, and earn recognition
                for safeguarding critical coastal mangrove ecosystems.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onOpenReportModal}
                className="btn-primary flex items-center gap-2 py-3 px-5 text-sm font-semibold shadow-lg shadow-emerald-950/40"
              >
                <PlusCircle className="w-5 h-5 text-white" />
                <span>Report New Incident</span>
              </button>
              {isAuthenticated && (
                <button
                  onClick={fetchReports}
                  title="Refresh stats"
                  className="btn-secondary p-3"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="stat-label">Conservation Points</span>
                <div className="stat-icon-wrapper text-emerald-400 bg-emerald-950/50">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="stat-value text-emerald-400">{user?.points || 0}</div>
              <div className="stat-subtext">Earn +25 pts per verified report</div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="stat-label">My Submissions</span>
                <div className="stat-icon-wrapper text-cyan-400 bg-cyan-950/50">
                  <FileCheck2 className="w-5 h-5" />
                </div>
              </div>
              <div className="stat-value text-cyan-400">
                {user?.reports_count || myReports.length}
              </div>
              <div className="stat-subtext">Logged to permanent ledger</div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="stat-label">Guardian Rank</span>
                <div className="stat-icon-wrapper text-teal-400 bg-teal-950/50">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div className={`stat-value text-base mt-2 font-bold ${tier.color}`}>
                {tier.title}
              </div>
              <div className="stat-subtext">Level 1 Community Sentinel</div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="stat-label">AI Validation Rate</span>
                <div className="stat-icon-wrapper text-amber-400 bg-amber-950/50">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div className="stat-value text-amber-400">96.4%</div>
              <div className="stat-subtext">Spectral satellite confidence</div>
            </div>
          </div>
        </div>

        {/* Interactive Telemetry Map */}
        <div className="mt-8 reveal reveal-delay-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span>Coastal Telemetry & Spatial Incident Map</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Live spatial coordinates of mangrove threats and field observations
              </p>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-emerald-500/20 shadow-2xl bg-[#031317]">
            <MapView height="380px" />
          </div>
        </div>

        {/* Reports Section */}
        <div className="mt-10 reveal reveal-delay-2" id="incident-reports">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Trees className="w-5 h-5 text-emerald-400" />
                <span>My Incident Reports</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Live updates on status, severity classification, and automated spectral analysis
              </p>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="empty-state-card text-center py-14">
              <div className="w-12 h-12 rounded-full bg-emerald-950/70 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                <Trees className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Sign in to track your submissions</h4>
              <p className="text-sm text-gray-400 max-w-md mx-auto mt-1 mb-6">
                Create an account or login to file incident alerts, climb the community leaderboard, and help coastal patrol units respond fast.
              </p>
              <button onClick={onOpenAuthModal} className="btn-primary">
                Sign In to TidalTrees
              </button>
            </div>
          ) : myReports.length === 0 ? (
            <div className="empty-state-card text-center py-14">
              <div className="w-12 h-12 rounded-full bg-emerald-950/70 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                <PlusCircle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">No incidents reported yet</h4>
              <p className="text-sm text-gray-400 max-w-md mx-auto mt-1 mb-6">
                You haven't logged any mangrove threats. Spot deforestation, trash dumping, or reclamation? Submit an alert now.
              </p>
              <button onClick={onOpenReportModal} className="btn-primary">
                Report First Incident
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myReports.map((report) => (
                <div key={report.id} className="report-card">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className={`severity-badge severity-${report.severity}`}>
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      <span className="uppercase text-[11px] font-bold">{report.severity}</span>
                    </span>
                    <span className={`status-badge status-${report.status}`}>
                      <Clock className="w-3 h-3 inline mr-1" />
                      <span className="capitalize text-[11px] font-medium">{report.status}</span>
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white line-clamp-1 mb-2">
                    {report.title}
                  </h4>
                  <p className="text-xs text-gray-300 line-clamp-3 mb-4 leading-relaxed">
                    {report.description}
                  </p>

                  <div className="pt-3 border-t border-gray-800/80 text-xs text-gray-400 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="truncate">{report.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                      {report.ai_confidence && (
                        <span className="text-emerald-400/90 font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          AI Score: {Math.round(report.ai_confidence * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
