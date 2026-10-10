export interface User {
  id: number;
  username: string;
  email?: string | null;
  is_active: boolean;
  points: number;
  reports_count: number;
  created_at?: string;
}

export type SeverityType = 'low' | 'medium' | 'high' | 'critical';
export type StatusType = 'pending' | 'validated' | 'rejected';

export interface Report {
  id: number;
  title: string;
  description: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  severity: SeverityType;
  status: StatusType;
  image_url?: string | null;
  ai_confidence?: number | null;
  author_id: number;
  created_at: string;
}

export interface ReportCreatePayload {
  title: string;
  description: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  severity: SeverityType;
}

export interface Guardian {
  id: number;
  name: string;
  contact: string;
  location?: string | null;
}

export interface LeaderboardUser {
  id: number;
  username: string;
  points: number;
  reports_count: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardUser[];
  cached: boolean;
  total: number;
}
