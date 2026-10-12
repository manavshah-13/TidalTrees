import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  UploadCloud,
  FileImage,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  RefreshCw,
  Info,
  X,
  PlusCircle,
  Eye,
  Activity,
  Layers,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface AnalysisResponse {
  confidence: number;
  tags: string[];
  threat_level: string;
  summary: string;
  recommended_action: string;
  image_url?: string;
}

interface AiValidationProps {
  onOpenReportModal?: () => void;
}

export const AiValidation: React.FC<AiValidationProps> = ({ onOpenReportModal }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisPhase, setAnalysisPhase] = useState<number>(1);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const containerRef = useScrollReveal<HTMLDivElement>();

  // Progress phases timer during analysis
  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      setAnalysisPhase(1);
      interval = setInterval(() => {
        setAnalysisPhase((prev) => (prev < 3 ? prev + 1 : prev));
      }, 900);
    } else {
      setAnalysisPhase(1);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, or WebP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image file must be under 10MB');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const runAnalysis = async () => {
    if (!selectedFile) {
      toast.error('Please select or drop an image first');
      return;
    }

    setIsAnalyzing(true);
    const toastId = toast.loading('Streaming image to Gemini Vision neural network...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await api.post<AnalysisResponse>('/api/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(res.data);
      toast.success('Spectral mangrove validation complete!', { id: toastId });
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to analyze image. Please try again.';
      toast.error(msg, { id: toastId });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getThreatBadge = (level: string = 'low') => {
    switch (level.toLowerCase()) {
      case 'critical':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: AlertTriangle,
          label: 'Critical Anomaly',
        };
      case 'high':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: AlertTriangle,
          label: 'High Threat Level',
        };
      case 'medium':
        return {
          bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          icon: Info,
          label: 'Moderate Stress Level',
        };
      default:
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: CheckCircle2,
          label: 'Low / Healthy Ecosystem',
        };
    }
  };

  return (
    <div className="page-root max-w-6xl mx-auto" ref={containerRef}>
      {/* Header */}
      <div className="mb-10 text-center md:text-left reveal">
        <div className="badge-pill-emerald flex items-center gap-1.5 w-fit mx-auto md:mx-0 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Multimodal Telemetry & Canopy AI</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          AI Vision Threat Validation
        </h1>
        <p className="text-sm md:text-base text-gray-300 mt-2 max-w-2xl">
          Upload aerial drone footage, field photography, or shoreline canopy captures. Gemini Vision
          inspects vegetative stress, sedimentation anomalies, and illegal incursions in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 1. Dynamic Dropzone Column */}
        <div className="lg:col-span-5 flex flex-col gap-5 reveal reveal-delay-1">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
            className={`ai-dropzone p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[340px] ${
              isDragging ? 'active animate-pulse-glow' : ''
            }`}
          >
            {/* Animated Laser Scanline effect when analyzing */}
            {isAnalyzing && <div className="scanline" />}

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />

            {previewUrl ? (
              <div className="relative w-full h-full flex flex-col items-center">
                <div className="relative w-full overflow-hidden rounded-xl border border-teal-500/30 mb-3 shadow-xl">
                  <img
                    src={previewUrl}
                    alt="Upload preview"
                    className="w-full max-h-64 object-cover"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="badge-pill-emerald text-xs animate-pulse">
                        Neural Model Processing...
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between w-full px-1">
                  <span className="text-xs text-gray-300 truncate max-w-[200px]">
                    {selectedFile?.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearSelection();
                    }}
                    className="p-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-inner">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Drag & drop your mangrove image here
                  </p>
                  <p className="text-xs text-gray-400 mt-1">or click to browse local files</p>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-teal-400/80 font-mono">
                  <span>PNG, JPG, WEBP</span>
                  <span>•</span>
                  <span>Max 10MB</span>
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <button
            onClick={runAnalysis}
            disabled={!selectedFile || isAnalyzing}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Running Gemini Neural Telemetry...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Validate with Gemini Vision</span>
              </>
            )}
          </button>
        </div>

        {/* 2. Results & Multi-Phase Analysis Column */}
        <div className="lg:col-span-7 reveal reveal-delay-2">
          {isAnalyzing ? (
            <div className="rounded-2xl border border-teal-500/30 bg-[#081a1d]/85 p-8 flex flex-col items-center justify-center text-center min-h-[420px] shadow-2xl relative overflow-hidden">
              <div className="skeleton-shimmer absolute inset-0 opacity-15 pointer-events-none" />

              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full border-4 border-teal-500/20 border-t-teal-400 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-teal-300 animate-pulse" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                Scanning Canopy & Coastal Reflectance
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mb-6">
                Evaluating chlorophyl degradation patterns, salinity stress markers, and morphological
                anomalies via Gemini multimodal vision models.
              </p>

              {/* Animated Progress Checklist */}
              <div className="w-full max-w-md bg-[#040d10]/90 border border-teal-500/20 rounded-xl p-4 text-left space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-gray-200 font-medium">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${analysisPhase >= 1 ? 'bg-emerald-500 text-black font-bold' : 'bg-gray-800 text-gray-500'}`}>
                      {analysisPhase > 1 ? <Check className="w-3 h-3" /> : '1'}
                    </span>
                    <span>Analyzing NDVI Vegetation Index</span>
                  </span>
                  <span className={`text-[10px] font-mono ${analysisPhase >= 1 ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {analysisPhase > 1 ? 'COMPLETE' : 'SCANNING...'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-gray-200 font-medium">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${analysisPhase >= 2 ? 'bg-emerald-500 text-black font-bold' : 'bg-gray-800 text-gray-500'}`}>
                      {analysisPhase > 2 ? <Check className="w-3 h-3" /> : '2'}
                    </span>
                    <span>Detecting Canopy Loss & Timber Incursions</span>
                  </span>
                  <span className={`text-[10px] font-mono ${analysisPhase >= 2 ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {analysisPhase > 2 ? 'COMPLETE' : analysisPhase === 2 ? 'PARSING...' : 'WAITING'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-gray-200 font-medium">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${analysisPhase >= 3 ? 'bg-emerald-500 text-black font-bold' : 'bg-gray-800 text-gray-500'}`}>
                      3
                    </span>
                    <span>Scoring Threat Probability & Mitigation</span>
                  </span>
                  <span className={`text-[10px] font-mono ${analysisPhase >= 3 ? 'text-cyan-400 animate-pulse' : 'text-gray-500'}`}>
                    {analysisPhase === 3 ? 'COMPUTING...' : 'WAITING'}
                  </span>
                </div>
              </div>
            </div>
          ) : result ? (
            <div className="animate-slide-up rounded-2xl border border-teal-500/30 bg-[#081a1d]/85 backdrop-blur-md p-6 md:p-8 shadow-2xl flex flex-col gap-6">
              {/* Header result row */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-teal-500/20 pb-5">
                <div>
                  <span className="text-xs font-mono text-teal-400 uppercase tracking-wider block mb-1">
                    AI Diagnostic Report
                  </span>
                  <h3 className="text-xl font-bold text-white">Habitat Telemetry Output</h3>
                </div>

                {/* Threat Badge */}
                {(() => {
                  const badge = getThreatBadge(result.threat_level);
                  const Icon = badge.icon;
                  return (
                    <div
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${badge.bg}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{badge.label}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Confidence Score Meter */}
              <div className="bg-[#040d10] p-4 rounded-xl border border-teal-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-teal-400" />
                    <span>Spectral Confidence Score</span>
                  </span>
                  <span className="text-sm font-mono font-bold text-teal-400">
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="meter-track">
                  <div
                    className="meter-fill"
                    style={{ width: `${Math.min(100, result.confidence * 100)}%` }}
                  />
                </div>
              </div>

              {/* Side-by-side Inspection Preview View */}
              {previewUrl && (
                <div className="rounded-xl overflow-hidden border border-teal-500/20 bg-[#040d10]/70 p-3">
                  <div className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider mb-2 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Analyzed Telemetry Image Target</span>
                  </div>
                  <div className="h-32 rounded-lg overflow-hidden border border-teal-500/20 relative">
                    <img
                      src={previewUrl}
                      alt="Analyzed target"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 badge-pill-emerald text-[10px]">
                      Validated Sample
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-2">
                  Summary & Environmental Findings
                </h4>
                <p className="text-sm text-gray-200 leading-relaxed bg-[#040d10]/60 p-4 rounded-xl border border-teal-500/10">
                  {result.summary}
                </p>
              </div>

              {/* Identified Threat Tags */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-2.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Detected Threat Tags</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg text-xs font-mono font-medium bg-teal-500/10 text-teal-300 border border-teal-500/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Action */}
              <div className="rounded-xl bg-gradient-to-r from-teal-950/60 to-emerald-950/60 p-4 border border-teal-500/30">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                      Recommended Conservation Protocol
                    </h5>
                    <p className="text-xs text-gray-200 mt-1 leading-normal">
                      {result.recommended_action}
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Steps Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Upload New Image
                </button>

                {onOpenReportModal && (
                  <button
                    onClick={onOpenReportModal}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-900 transition-all cursor-pointer shadow-md"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>File Incident With These Findings</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-teal-500/20 bg-[#081a1d]/50 p-10 flex flex-col items-center justify-center text-center min-h-[420px] text-gray-400">
              <FileImage className="w-16 h-16 text-teal-500/30 mb-4" />
              <h3 className="text-base font-bold text-white mb-1">Awaiting Coastal Image</h3>
              <p className="text-xs max-w-sm">
                Select an image on the left to launch the automated Gemini threat detection
                pipeline.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiValidation;
