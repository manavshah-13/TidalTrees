import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Award,
  Zap,
  RefreshCw,
  Crown,
  Medal,
  FileCheck2,
} from 'lucide-react';
import { api } from '../api/client';
import type { LeaderboardUser, LeaderboardResponse } from '../types';

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isCached, setIsCached] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastFetched, setLastFetched] = useState<string>('');

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

  const topThree = leaderboard.slice(0, 3);

  return (
    <div className="page-root">
      {/* Header & Redis Cache Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
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
            className="btn-secondary flex items-center gap-2 py-2.5 px-4 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Ranks</span>
          </button>
        </div>
      </div>

      {/* Podium for Top 3 */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {topThree.map((user, idx) => {
            const rank = idx + 1;
            const isFirst = rank === 1;
            return (
              <div
                key={user.id}
                className={`podium-card ${
                  isFirst ? 'podium-card-first' : 'podium-card-standard'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="podium-rank-circle">{getRankBadge(rank)}</div>
                  <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>{user.points} pts</span>
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1 truncate">
                  {user.username}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-700/60 pt-3 mt-3">
                  <span className="flex items-center gap-1">
                    <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
                    {user.reports_count} verified reports
                  </span>
                  <span className="text-[11px] text-emerald-400 font-medium">
                    {isFirst ? 'Top Sentinel' : 'Distinguished'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="leaderboard-table-container">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="table-header">
            <tr>
              <th className="py-3 px-4">Rank</th>
              <th className="py-3 px-4">Guardian Username</th>
              <th className="py-3 px-4 text-center">Incidents Reported</th>
              <th className="py-3 px-4 text-right">Conservation Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/80">
            {isLoading && leaderboard.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
                  Loading leaderboard data...
                </td>
              </tr>
            ) : leaderboard.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">
                  No registered guardians yet. Be the first to earn points!
                </td>
              </tr>
            ) : (
              leaderboard.map((user, idx) => (
                <tr key={user.id} className="table-row-hover">
                  <td className="py-3.5 px-4 font-medium flex items-center gap-2">
                    {getRankBadge(idx + 1)}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-950/80 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span>{user.username}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="badge-pill-cyan text-xs">
                      {user.reports_count} reports
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-extrabold text-emerald-400 text-base">
                      {user.points}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">pts</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
