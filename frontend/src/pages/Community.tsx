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
} from 'lucide-react';
import { api } from '../api/client';
import { useFilterStore } from '../store/useFilterStore';
import type { Report, Guardian } from '../types';

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

  return (
    <div className="page-root">
      {/* Title */}
      <div className="mb-8">
        <div className="badge-pill-emerald flex items-center gap-1 w-fit mb-2">
          <Users className="w-3.5 h-3.5" />
          <span>Coastal Defense Collective</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Community Incident Feed & Ranger Network
        </h1>
        <p className="text-sm text-gray-300 mt-1">
          Explore public reports verified by satellite telemetry and connect with regional mangrove guardian units.
        </p>
      </div>

      {/* Filter Toolbar (powered by useFilterStore) */}
      <div className="filter-toolbar-card mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search reports by title, location, or keyword..."
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

      {/* Incident Feed */}
      <div className="mb-14">
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
          <div className="text-center py-12 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
            Filtering incident ledger...
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
            {reports.map((report) => (
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
            ))}
          </div>
        )}
      </div>

      {/* Community Guardians & Ranger Units */}
      <div>
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
