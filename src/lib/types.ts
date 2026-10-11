export interface Team {
  name: string;
  badge?: string;
}

export interface MatchSource {
  source: string;
  id: string;
}

export interface Match {
  id: string;
  title: string;
  category: string;
  date: number;
  poster?: string;
  popular?: boolean;
  teams?: {
    home?: Team;
    away?: Team;
  };
  sources: MatchSource[];
}

export interface Stream {
  id: string;
  streamNo: number;
  language: string;
  hd: boolean;
  embedUrl: string;
  source: string;
  viewers: number;
}

export interface Sport {
  id: string;
  name: string;
}

export interface SourceInfo {
  source: string;
  label: string;
}
