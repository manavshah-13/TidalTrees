import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  RefreshCw,
  Sparkles,
  Layers,
  Calendar,
  AlertTriangle,
  ExternalLink,
  Filter,
} from 'lucide-react';
import type { Report } from '../../types';
import { api } from '../../api/client';

export interface MapViewProps {
  reports?: Report[];
  initialReports?: Report[];
  className?: string;
  height?: string;
  fullWidth?: boolean;
  onSelectReport?: (report: Report) => void;
}

// Custom HTML DivIcon Factory with pulsating radar wave
const createPulseIcon = (severity: string = 'low') => {
  const sev = severity?.toLowerCase() || 'low';
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div class="marker-pulse-wrapper marker-severity-${sev}">
        <div class="marker-ping"></div>
        <div class="marker-core"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
};

// Map view repositioner component
function ChangeMapView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export const MapView: React.FC<MapViewProps> = ({
  reports: propReports,
  initialReports,
  className = '',
  height,
  fullWidth = false,
  onSelectReport,
}) => {
  const [reports, setReports] = useState<Report[]>(propReports || initialReports || []);
  // Default to the Sundarbans mangrove biosphere delta
  const [center, setCenter] = useState<[number, number]>([21.8, 88.9]);
  const [zoom, setZoom] = useState<number>(9);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNearbyActive, setIsNearbyActive] = useState<boolean>(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  // Load reports from backend API if not supplied via props
  const loadReports = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ reports: Report[]; total: number }>('/api/reports', {
        params: { limit: 150 },
      });
      const validReports = (res.data.reports || []).filter(
        (r) => r.latitude !== null && r.longitude !== null
      );
      setReports(validReports);
      if (validReports.length > 0 && validReports[0].latitude && validReports[0].longitude) {
        setCenter([validReports[0].latitude, validReports[0].longitude]);
      }
    } catch (err) {
      console.error('Failed to load map reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const incoming = propReports || initialReports;
    if (incoming && incoming.length > 0) {
      const valid = incoming.filter((r) => r.latitude !== null && r.longitude !== null);
      setReports(valid);
      if (valid.length > 0 && valid[0].latitude && valid[0].longitude) {
        setCenter([valid[0].latitude, valid[0].longitude]);
      }
    } else if (!propReports && !initialReports) {
      loadReports();
    }
  }, [propReports, initialReports]);

  // Geolocation postgis nearby radius query
  const locateAndFetchNearby = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setCenter([userLat, userLng]);
        setZoom(11);

        try {
          const res = await api.get<Report[]>('/api/reports/nearby', {
            params: { lat: userLat, lng: userLng, radius_km: 40 },
          });
          const valid = (res.data || []).filter((r) => r.latitude !== null && r.longitude !== null);
          setReports(valid);
          setIsNearbyActive(true);
        } catch (err) {
          console.error('Failed to fetch nearby reports:', err);
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        console.warn('Geolocation failed:', err.message);
        setIsLoading(false);
      }
    );
  };

  // Filter reports by severity
  const filteredReports = useMemo(() => {
    if (selectedSeverity === 'all') return reports;
    return reports.filter((r) => r.severity?.toLowerCase() === selectedSeverity.toLowerCase());
  }, [reports, selectedSeverity]);

  // Severity counts
  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: reports.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    reports.forEach((r) => {
      const sev = r.severity?.toLowerCase() || 'low';
      if (counts[sev] !== undefined) {
        counts[sev]++;
      }
    });
    return counts;
  }, [reports]);

  const containerClasses = fullWidth
    ? `map-section-fullwidth ${className}`
    : `relative rounded-2xl overflow-hidden border border-emerald-500/20 bg-[#040d10] shadow-2xl ${className}`;

  return (
    <div className={containerClasses} style={height ? { height } : undefined}>
      {/* Floating Glassmorphic HUD Overlay Panel */}
      <div className="map-overlay-panel space-y-3">
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-emerald-500/15">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide">Coastal Telemetry HUD</h4>
              <span className="text-[10px] text-emerald-400 font-mono block">
                {filteredReports.length} Active Hotspots
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={locateAndFetchNearby}
              disabled={isLoading}
              title="Query GPS nearby radius"
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isNearbyActive
                  ? 'bg-emerald-500 text-slate-900 border-emerald-300'
                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/20 hover:bg-emerald-900/60'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={loadReports}
              disabled={isLoading}
              title="Refresh Telemetry"
              className="p-1.5 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-900/60 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Severity Filter Pills */}
        <div>
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Filter className="w-3 h-3 text-emerald-400" />
            <span>Severity Filters</span>
          </div>
          <div className="grid grid-cols-5 gap-1 text-[10px] font-mono">
            {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => {
              const isActive = selectedSeverity === sev;
              const count = severityCounts[sev] || 0;
              return (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSelectedSeverity(sev)}
                  className={`py-1 px-1 rounded text-center transition-all cursor-pointer uppercase ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30'
                      : 'bg-emerald-950/40 text-gray-400 hover:text-white border border-emerald-500/10'
                  }`}
                >
                  <div className="truncate">{sev}</div>
                  <div className="text-[9px] opacity-80">{count}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Color Legend */}
        <div className="pt-2 border-t border-emerald-500/10 flex items-center justify-between text-[10px] text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block shadow-sm shadow-red-500" />
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block shadow-sm shadow-orange-500" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block shadow-sm shadow-yellow-400" />
            <span>Med</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-500" />
            <span>Low</span>
          </div>
        </div>
      </div>

      {/* Leaflet Map Container */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={false}
      >
        <ChangeMapView center={center} zoom={zoom} />

        {/* CartoDB Dark Matter tile layer for high-contrast geospatial presentation */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Marker Clustering Group */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={45}
          spiderfyOnMaxZoom
        >
          {filteredReports.map((report) => {
            if (!report.latitude || !report.longitude) return null;
            const sev = report.severity?.toLowerCase() || 'low';
            const aiScore = report.ai_confidence ? Math.round(report.ai_confidence * 100) : null;

            return (
              <Marker
                key={report.id}
                position={[report.latitude, report.longitude]}
                icon={createPulseIcon(report.severity)}
              >
                <Popup className="tidal-map-popup">
                  <div className="p-2 min-w-[240px] max-w-[290px] text-gray-200 font-sans">
                    {/* Optional Thumbnail */}
                    {report.image_url && (
                      <div className="mb-2.5 rounded-lg overflow-hidden h-28 bg-black/60 border border-emerald-500/20 card-thumbnail-zoom">
                        <img
                          src={report.image_url}
                          alt={report.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`severity-badge severity-${sev} !text-[10px] !py-0.5 !px-2`}>
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        <span className="uppercase font-bold">{report.severity}</span>
                      </span>
                      <span className={`status-badge status-${report.status} !text-[10px] !py-0.5 !px-2`}>
                        {report.status}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h4 className="text-sm font-bold text-white mb-1 leading-snug">
                      {report.title}
                    </h4>
                    <p className="text-xs text-gray-400 mb-2.5 line-clamp-2 leading-relaxed">
                      {report.description}
                    </p>

                    {/* AI Confidence Meter */}
                    {aiScore !== null && (
                      <div className="mb-2.5 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/15">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            Spectral Verification
                          </span>
                          <span className="font-mono text-white font-bold">{aiScore}%</span>
                        </div>
                        <div className="meter-track !h-1.5">
                          <div className="meter-fill" style={{ width: `${aiScore}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Location & Date */}
                    <div className="text-[11px] text-gray-400 space-y-1 border-t border-gray-800/80 pt-2 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{report.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>{new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action CTA */}
                    {onSelectReport ? (
                      <button
                        type="button"
                        onClick={() => onSelectReport(report)}
                        className="w-full btn-primary text-xs py-1.5 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>View Incident Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ) : (
                      <div className="text-[10px] text-center text-emerald-400/90 font-mono">
                        Coordinates: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default MapView;
