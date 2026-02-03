export interface MonitorResponseData {
  data: {
    monitor: Monitor;
  };
  status: string;
}

export interface MonitorData {
  monitor: Monitor;
}

export interface Monitor {
  id: string;
  service_last_checks: {
    default: {
      uptime: {
        last_status: string;
        last_checked_at: string;
      };
    };
  };
  config: {
    meta: {
      url: string;
    }
  }
  is_enabled: boolean;
}

export interface HistogramData {
  histogram: Histogram;
}

export interface Histogram {
  data: HistogramPoint[];
}

export interface HistogramPoint {
  timestamp: number;
  uptime: number | null;
}

export interface UptimeStatsData {
  uptime_stats: UptimeStats;
}

export interface UptimeStats {
  day: UptimeStat;
  week: UptimeStat;
  month: UptimeStat;
}

export interface UptimeStat {
  uptime_percentage: number | null;
  incident_count: number | null;
  total_uptime: number | null;
}
