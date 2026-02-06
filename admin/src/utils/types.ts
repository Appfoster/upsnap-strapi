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
  regions: Array<{ id: string; is_primary: boolean; name: string }>;
  name: string;
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

export interface ResponseTimeData {
  response_time: ResponseTime;
}

export interface ResponseTime {
  avg_response_time: number | null;
  max_response_time: number | null;
  min_response_time: number | null;
  chart_data: ResponseTimePoint[];
}

export interface ResponseTimePoint {
  timestamp: number;
  response_time: number | null;
}

export interface RegionResponseTimeData {
  chart_data: Array<{ timestamp: number; response_time: number }>;
  avg_response_time: number;
  max_response_time: number;
  min_response_time: number;
}

export interface Region {
    id: string;
    name: string;
    is_primary?: boolean;
}

export interface UptimeHealthCheckData {
  checkedAt: string;
  url: string;
  result: {
    summary: Summary;
    details: {
      uptime: {
        ok: boolean;
        meta: any;
      }
    };
    durationMs: number;
  }
}

export interface SSLCheckData {
  checkedAt: string;
  url: string;
  result: {
    summary: Summary;
    details: {
      ssl: {
        ok: boolean;
        meta: any;
      }
    };
    durationMs: number;
  }
}

export interface BrokenLinksCheckData {
  checkedAt: string;
  url: string;
  result: {
    summary: Summary;
    details: {
      broken_links: {
        ok: boolean;
        meta: any;
      }
    };
    durationMs: number;
  }
}

export interface Summary {
  ok: boolean;
  message: string;
}