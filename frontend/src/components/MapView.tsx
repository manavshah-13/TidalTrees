import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, RefreshCw, Layers } from 'lucide-react';
import type { Report } from '../types';
import { api } from '../api/client';

interface MapViewProps {
  initialReports?: Report[];
  className?: string;
  height?: string;
  interactive?: boolean;
}

// Custom Leaflet marker icons by severity
const createCustomIcon = (severity: string = 'low') => {
  const colorMap: Record<string, string> = {
    critical: '#f43f5e',
    high: '#f59e0b',
    medium: '#06b6d4',
    low: '#10b981',
  };
  const color = colorMap[severity?.toLowerCase()] || '#10b981';

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background: ${color};
        width: 26px;
        height: 26px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.6), 0 0 10px ${color}aa;
        border: 2px solid #ffffff;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: #ffffff;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -26],
  });
};

function ChangeMapView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export const MapView: React.FC<MapViewProps> = ({
  initialReports,
  className = '',
  height = '480px',
}) => {
  const [reports, setReports] = useState<Report[]>(initialReports || []);
  const [center, setCenter] = useState<[number, number]>([19.076, 72.8777]); // Default coastal zone
  const [zoom, setZoom] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNearbyActive, setIsNearbyActive] = useState<boolean>(false);

  // Fetch reports if not provided
  const loadReports = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ reports: Report[]; total: number }>('/api/reports', {
        params: { limit: 100 },
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
    if (!initialReports || initialReports.length === 0) {
      loadReports();
    } else {
      const valid = initialReports.filter((r) => r.latitude !== null && r.longitude !== null);
      setReports(valid);
      if (valid.length > 0 && valid[0].latitude && valid[0].longitude) {
        setCenter([valid[0].latitude, valid[0].longitude]);
      }
    }
  }, [initialReports]);

  // Nearby radius query using PostGIS ST_DWithin
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
        setZoom(12);

        try {
          const res = await api.get<Report[]>('/api/reports/nearby', {
            params: { lat: userLat, lng: userLng, radius_km: 25 },
          });
          setReports(res.data || []);
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

  const getSeverityBadge = (sev: string) => {
    const sevMap: Record<string, string> = {
      critical: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      high: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      medium: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    };
    return sevMap[sev?.toLowerCase()] || sevMap.low;
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-emerald-500/20 bg-[#040d10] shadow-2xl ${className}`}
      style={{ height }}
    >
      {/* Top Map Action Bar */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
        <button
          onClick={locateAndFetchNearby}
          disabled={isLoading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md transition-all cursor-pointer shadow-lg ${
            isNearbyActive
              ? 'bg-teal-500 text-slate-900 border border-teal-300'
              : 'bg-[#081a1d]/90 text-teal-300 border border-teal-500/30 hover:bg-teal-900/60'
          }`}
          title="Query reports within 25km radius via PostGIS"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>{isNearbyActive ? 'Nearby Filter (25km)' : 'Locate Nearby'}</span>
        </button>

        <button
          onClick={loadReports}
          disabled={isLoading}
          className="p-1.5 rounded-lg bg-[#081a1d]/90 text-teal-300 border border-teal-500/30 hover:bg-teal-900/60 backdrop-blur-md cursor-pointer transition-all shadow-lg"
          title="Refresh Reports"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-[#081a1d]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-teal-500/20 shadow-lg pointer-events-none">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-bold text-white tracking-wide">
            Mangrove Spatial Telemetry
          </span>
          <span className="text-[11px] text-teal-400 font-mono bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
            {reports.length} markers
          </span>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={false}
      >
        <ChangeMapView center={center} zoom={zoom} />

        {/* High-contrast CartoDB Dark tile layer for coastal GIS aesthetics */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {reports.map((report) => {
          if (!report.latitude || !report.longitude) return null;
          return (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={createCustomIcon(report.severity)}
            >
              <Popup className="tidal-map-popup">
                <div className="p-2 min-w-[220px] max-w-[280px] text-slate-900 font-sans">
                  {report.image_url && (
                    <img
                      src={report.image_url}
                      alt={report.title}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                  )}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getSeverityBadge(
                        report.severity
                      )}`}
                    >
                      {report.severity}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">{report.status}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                    {report.title}
                  </h4>
                  <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                    {report.description}
                  </p>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 border-t border-slate-200 pt-1.5">
                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">{report.location}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
