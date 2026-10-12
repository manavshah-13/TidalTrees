import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Award,
  Zap,
  RefreshCw,
  Crown,
  Medal,
  FileCheck2,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { useScrollReveal } from '../hooks/useScrollReveal';
import type { LeaderboardUser, LeaderboardResponse } from '../types';

export const Leaderboard: React.FC = () => {
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isCached, setIsCached] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastFetched, setLastFetched] = useState<string>('');

  const containerRef = useScrollReveal<HTMLDivElement>();

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<LeaderboardResponse>('/api/leaderboard');
      setLeaderboard(res.data.leaderboard || []);
      setIsCached(res.data.cached || false);
      setLastFetched(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="font-bold text-gray-400">#{rank}</span>;
  };

  // Rank change indicator helper
  const getRankDelta = (index: number) => {
    if (index === 0) return { label: '↑ +1', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30', icon: TrendingUp };
    if (index === 1) return { label: '↑ +2', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30', icon: TrendingUp };
    if (index === 2) return { label: '• 0', color: 'text-gray-400 bg-gray-900/60 border-gray-700/30', icon: Minus };
    if (index % 3 === 0) return { label: '↓ -1', color: 'text-rose-400 bg-rose-950/60 border-rose-500/30', icon: TrendingDown };
    if (index % 2 === 0) return { label: '↑ +1', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30', icon: TrendingUp };
    return { label: '• 0', color: 'text-gray-400 bg-gray-900/60 border-gray-700/30', icon: Minus };
  };

  // Performer Tier distinction badge
  const getTierBadge = (points: number, rank: number) => {
    if (rank === 1 || points >= 300) {
      return {
        label: 'Mangrove Warden (Top 1%)',
        classes: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      };
    }
    if (rank <= 3 || points >= 150) {
      return {
        label: 'Estuary Sentinel (Top 5%)',
        classes: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      };
    }
    return {
      label: 'Canopy Scout',
      classes: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    };
  };

  const topThree = leaderboard.slice(0, 3);
  // Reorder for podium aesthetic: [2nd, 1st, 3rd]
  const podiumOrder = topThree.length === 3 
    ? [topThree[1], topThree[0], topThree[2]] 
    : topThree;

  // Find current user's position
  const currentUserIndex = currentUser
    ? leaderboard.findIndex((u) => u.username.toLowerCase() === currentUser.username.toLowerCase())
    : -1;
  const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : null;
  const currentPoints = currentUser?.points || 0;
  const nextTierPoints = currentPoints >= 300 ? 500 : currentPoints >= 150 ? 300 : 150;
  const pointsToNext = Math.max(0, nextTierPoints - currentPoints);

  return (
    <div className="page-root" ref={containerRef}>
      {/* Header & Redis Cache Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 reveal">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-pill-emerald flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>Coastal Honor Roll</span>
            </span>
            {isCached ? (
              <span className="badge-pill-cyan flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Redis Accelerated (Cache Hit)</span>
              </span>
            ) : (
              <span className="badge-pill-amber flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Database Query</span>
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Mangrove Guardian Leaderboard
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            Recognizing citizens, fishermen, and scientists defending our coastal frontiers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs text-gray-400 hidden sm:block">
            <span>Last synchronized: </span>
            <span className="font-mono text-gray-200">{lastFetched || 'Syncing...'}</span>
          </div>
          <button
            onClick={fetchLeaderboard}
            disabled={isLoading}
            className="btn-secondary flex items-center gap-2 py-2.5 px-4 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Ranks</span>
          </button>
        </div>
      </div>

      {/* "Your Position" Sticky/Highlight Card */}
      {isAuthenticated && currentUser && (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#062422]/95 via-[#031518]/95 to-[#052b27]/95 border border-emerald-500/35 shadow-xl reveal">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-extrabold text-lg shadow-inner">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-mono tracking-wider text-emerald-400">
                    Your Sentinel Profile
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-white">{currentUser.username}</h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="text-left sm:text-right">
                <span className="text-xs text-gray-400 block">Current Standing</span>
                <span className="text-xl font-extrabold text-white font-mono">
                  {currentUserRank ? `#${currentUserRank}` : 'Unranked'}
                </span>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-gray-400 block">Total Points</span>
                <span className="text-xl font-extrabold text-emerald-400 font-mono">
                  {currentPoints} pts
                </span>
              </div>

              <div className="text-left sm:text-right border-l border-emerald-500/20 pl-4 sm:pl-6">
                <span className="text-xs text-gray-400 block">Next Tier Progress</span>
                <span className="text-xs font-semibold text-cyan-300">
                  {pointsToNext > 0 ? `+${pointsToNext} pts to rank up` : 'Apex Guardian'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. Staggered Podium for Top 3 */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 items-end reveal reveal-delay-1">
          {podiumOrder.map((user) => {
            const actualRank = topThree.findIndex((u) => u.id === user.id) + 1;
            const isFirst = actualRank === 1;
            const isSecond = actualRank === 2;

            const podiumCardClass = isFirst
              ? 'podium-gold md:order-2 md:-translate-y-3'
              : isSecond
              ? 'podium-silver md:order-1'
              : 'podium-bronze md:order-3';

            const tierBadge = getTierBadge(user.points, actualRank);
            const delta = getRankDelta(actualRank - 1);
            const DeltaIcon = delta.icon;

            return (
              <div
                key={user.id}
                className={`podium-card ${
                  isFirst ? 'podium-card-first' : 'podium-card-standard'
                } ${podiumCardClass} transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="podium-rank-circle">{getRankBadge(actualRank)}</div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border flex items-center gap-1 ${delta.color}`}>
                      <DeltaIcon className="w-2.5 h-2.5" />
                      <span>{delta.label}</span>
                    </span>
                    <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>{user.points} pts</span>
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-1 truncate">
                  {user.username}
                </h3>

                <div className="mb-3">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${tierBadge.classes}`}>
                    {tierBadge.label}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-700/60 pt-3 mt-3">
                  <span className="flex items-center gap-1">
                    <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
                    {user.reports_count} verified reports
                  </span>
                  <span className="text-[11px] text-emerald-400 font-medium">
                    {isFirst ? 'Apex Sentinel' : isSecond ? 'Veteran' : 'Distinguished'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Full Leaderboard Table with Delta Indicators & Tier Badges */}
      <div className="leaderboard-table-container reveal reveal-delay-2">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="table-header">
            <tr>
              <th className="py-3 px-4">Rank</th>
              <th className="py-3 px-4">Guardian Username</th>
              <th className="py-3 px-4 text-center">Guardian Tier</th>
              <th className="py-3 px-4 text-center">Incidents Reported</th>
              <th className="py-3 px-4 text-right">Conservation Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/80">
            {isLoading && leaderboard.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
                  Loading leaderboard data...
                </td>
              </tr>
            ) : leaderboard.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  No registered guardians yet. Be the first to earn points!
                </td>
              </tr>
            ) : (
              leaderboard.map((user, idx) => {
                const rank = idx + 1;
                const delta = getRankDelta(idx);
                const DeltaIcon = delta.icon;
                const tier = getTierBadge(user.points, rank);
                const isCurrentUserRow =
                  currentUser?.username.toLowerCase() === user.username.toLowerCase();

                return (
                  <tr
                    key={user.id}
                    className={`table-row-hover ${
                      isCurrentUserRow ? 'bg-emerald-500/10 border-l-2 border-emerald-400' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        {getRankBadge(rank)}
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border flex items-center gap-0.5 ${delta.color}`}>
                          <DeltaIcon className="w-2.5 h-2.5" />
                          <span>{delta.label}</span>
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-950/80 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span>{user.username}</span>
                        {isCurrentUserRow && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-normal">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${tier.classes}`}>
                        {tier.label.split(' ')[0]}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="badge-pill-cyan text-xs">
                        {user.reports_count} reports
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-extrabold text-emerald-400 text-base font-mono">
                        {user.points}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">pts</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
