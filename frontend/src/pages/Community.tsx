import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  Phone,
  Shield,
  RefreshCw,
  Trees,
  Flame,
} from 'lucide-react';
import { api } from '../api/client';
import { useFilterStore } from '../store/useFilterStore';
import type { Report, Guardian } from '../types';
import { MapView } from '../components/MapView';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { CardSkeleton } from '../components/ui/Skeleton';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const Community: React.FC = () => {
  const {
    severity,
    status,
    searchTerm,
    setSeverity,
    setStatus,
    setSearchTerm,
    resetFilters,
  } = useFilterStore();

  const [reports, setReports] = useState<Report[]>([]);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const containerRef = useScrollReveal<HTMLDivElement>();

  const fetchCommunityData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch reports with filters
      const reportParams: Record<string, any> = {};
      if (severity !== 'all') reportParams.severity = severity;
      if (status !== 'all') reportParams.status = status;
      if (searchTerm.trim()) reportParams.search = searchTerm.trim();

      const [reportsRes, guardiansRes] = await Promise.all([
        api.get<{ reports: Report[]; total: number }>('/api/reports', {
          params: reportParams,
        }),
        api.get<Guardian[]>('/api/guardians'),
      ]);

      setReports(reportsRes.data.reports || []);
      setTotalCount(reportsRes.data.total || 0);
      setGuardians(guardiansRes.data || []);
    } catch (err) {
      console.error('Failed to load community data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, [severity, status, searchTerm]);

  // Spotlight: Pick top 2 high/critical or first 2 available reports
  const spotlightReports = reports
    .filter((r) => r.severity === 'critical' || r.severity === 'high')
    .slice(0, 2);
  const displayedSpotlights = spotlightReports.length > 0 ? spotlightReports : reports.slice(0, 2);

  return (
    <div className="page-root" ref={containerRef}>
      {/* 1. Community Hero Banner */}
      <div className="spotlight-card mb-8 reveal">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="badge-pill-emerald flex items-center gap-1.5 w-fit mb-3">
              <Users className="w-3.5 h-3.5" />
              <span>Coastal Defense Collective</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              Community Incident Feed & Ranger Network
            </h1>
            <p className="text-sm text-gray-300 leading-relaxed">
              Explore public threat reports validated by satellite telemetry and connect directly with regional
              mangrove guardian patrol units protecting vulnerable deltas.
            </p>
          </div>

          {/* Compact Community Metric Counters */}
          <div className="grid grid-cols-3 gap-3 sm:gap-5 w-full lg:w-auto">
            <div className="text-center p-3.5 rounded-xl bg-black/40 border border-emerald-500/20">
              <div className="text-2xl font-extrabold font-mono text-emerald-400">
                <AnimatedCounter end={1420} suffix="+" />
              </div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">Active Stewards</div>
            </div>

            <div className="text-center p-3.5 rounded-xl bg-black/40 border border-emerald-500/20">
              <div className="text-2xl font-extrabold font-mono text-cyan-400">
                <AnimatedCounter end={72400} suffix=" Ha" />
              </div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">Hectares Guarded</div>
            </div>

            <div className="text-center p-3.5 rounded-xl bg-black/40 border border-emerald-500/20">
              <div className="text-2xl font-extrabold font-mono text-amber-400">
                <AnimatedCounter end={318} suffix="+" />
              </div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">Rapid Responses</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. "Featured Reports" Spotlight */}
      {displayedSpotlights.length > 0 && (
        <div className="mb-10 reveal reveal-delay-1">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-4 h-4 text-amber-400" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider text-xs">
              Featured High-Impact Incidents
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {displayedSpotlights.map((spotlight) => (
              <div
                key={`spotlight-${spotlight.id}`}
                className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-[#062024]/90 to-[#021013]/90 shadow-2xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className={`severity-badge severity-${spotlight.severity}`}>
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      <span className="uppercase text-[11px] font-bold">{spotlight.severity} Priority</span>
                    </span>

                    {spotlight.ai_confidence && (
                      <span className="badge-pill-cyan flex items-center gap-1 text-[11px]">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>AI Verified: {Math.round(spotlight.ai_confidence * 100)}%</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-extrabold text-white mb-2 line-clamp-1">
                    {spotlight.title}
                  </h3>
                  <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed mb-4">
                    {spotlight.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1.5 text-emerald-300">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate max-w-[200px]">{spotlight.location}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-500" />
                    {new Date(spotlight.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Toolbar (powered by useFilterStore) */}
      <div className="filter-toolbar-card mb-8 reveal reveal-delay-2">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search reports by title, delta location, keyword..."
              className="styled-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Severity & Status Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 font-medium">Severity:</span>
              <select
                className="styled-select text-xs"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 font-medium">Status:</span>
              <select
                className="styled-select text-xs"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="validated">Validated</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <button
              onClick={resetFilters}
              className="btn-secondary text-xs py-2 px-3"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Geospatial Telemetry Map */}
      <div className="mb-10 reveal reveal-delay-2">
        <MapView initialReports={reports} height="440px" />
      </div>

      {/* 3. Staggered Report Card Grid */}
      <div className="mb-14 reveal reveal-delay-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Verified Incidents</span>
            <span className="badge-pill-cyan text-xs font-semibold">
              {totalCount} found
            </span>
          </h2>
          <button
            onClick={fetchCommunityData}
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <CardSkeleton key={n} />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="empty-state-card text-center py-12">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white">No matching incidents found</h3>
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting your severity, status, or search filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reports.map((report, idx) => {
              const delayClass = `reveal-delay-${(idx % 4) + 1}`;
              return (
                <div key={report.id} className={`report-card card-tilt reveal ${delayClass}`}>
                  {/* Photo Thumbnail with Zoom Effect or Fallback */}
                  {report.image_url ? (
                    <div className="mb-3 rounded-lg overflow-hidden h-36 bg-black/50 border border-emerald-500/20 card-thumbnail-zoom">
                      <img
                        src={report.image_url}
                        alt={report.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mb-3 rounded-lg h-24 bg-gradient-to-r from-emerald-950/40 to-cyan-950/40 border border-emerald-500/10 flex items-center justify-center text-emerald-400/40">
                      <Trees className="w-8 h-8" />
                    </div>
                  )}

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

                  <h3 className="text-base font-bold text-white line-clamp-1 mb-2">
                    {report.title}
                  </h3>
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
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          AI Score: {Math.round(report.ai_confidence * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Community Guardians & Ranger Units */}
      <div className="reveal reveal-delay-3">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span>Regional Guardian Units & Patrols</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Local marine cooperatives and coastal watch associations available for field response
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {guardians.map((g) => (
            <div key={g.id} className="guardian-card">
              <div className="w-10 h-10 rounded-full bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold mb-3">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm mb-1">{g.name}</h3>
              <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{g.location || 'Coastal Zone'}</span>
              </p>
              <div className="pt-2 border-t border-gray-800/80 flex items-center gap-2 text-xs text-emerald-300 font-mono">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{g.contact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
