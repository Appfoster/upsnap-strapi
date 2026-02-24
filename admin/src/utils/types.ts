import { z } from 'zod';

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
  service_last_checks: ServiceLastChecks;
  config: {
    meta: {
      url: string;
    };
  };
  is_enabled: boolean;
  regions: Array<{ id: string; is_primary: boolean; name: string }>;
  name: string;
  service_type: string;
  last_check_at: string | null;
  last_status: string | null;
  channel_ids: string[];
  tag_ids: string[];
}

type ServiceLastChecks = Record<
  string, // region
  Record<
    string, // service name
    {
      last_checked_at: string;
      last_status: string;
    }
  >
>;

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
  status: 'success' | 'warning' | 'error';
  message: string;
  error: string;
  data: Uptime;
}

export interface Uptime {
  checkedAt: string;
  url: string;
  result: {
    summary: Summary;
    details: {
      uptime: {
        ok: boolean;
        meta: any;
      };
    };
    durationMs: number;
  };
}

export interface SSLCheckData {
  status: 'success' | 'warning' | 'error';
  message: string;
  error: string;
  data: SSL;
}

export interface SSL {
  checkedAt: string;
  url: string;
  result: {
    summary: Summary;
    details: {
      ssl: {
        ok: boolean;
        meta: any;
      };
    };
    durationMs: number;
  };
}

export interface BrokenLinksCheckData {
  status: 'success' | 'warning' | 'error';
  message: string;
  error: string;
  data: BrokenLinks;
}

export interface BrokenLinks {
  checkedAt: string;
  url: string;
  result: {
    summary: Summary;
    details: {
      broken_links: {
        ok: boolean;
        meta: any;
      };
    };
    durationMs: number;
  };
}

export interface LighthouseCheckData {
  status: 'success' | 'warning' | 'error';
  message: string;
  error: string;
  data: Lighthouse;
}

export interface Lighthouse {
  checkedAt: string;
  url: string;
  result: {
    summary: Summary;
    details: {
      lighthouse: {
        ok: boolean;
        meta: any;
      };
    };
    durationMs: number;
  };
}

export interface DomainCheckData {
  status: 'success' | 'warning' | 'error';
  message: string;
  error: string;
  data: Domain;
}

export interface Domain {
  checkedAt: string;
  url: string;
  result: {
    summary: Summary;
    details: {
      domain: {
        ok: boolean;
        meta: any;
      };
    };
    durationMs: number;
  };
}

export interface MixedContentData {
  status: 'success' | 'warning' | 'error';
  message: string;
  error: string;
  data: MixedContent;
}

export interface MixedContent {
  checkedAt: string;
  url: string;
  result: {
    summary: Summary;
    details: {
      mixed_content: {
        ok: boolean;
        meta: any;
      };
    };
    durationMs: number;
  };
}

export interface Summary {
  ok: boolean;
  message: string;
}

export type PlanLimits = {
  max_integrations: number;
  max_monitors: number;
  max_notifications_per_day: number;
  min_monitoring_interval: number;
  max_status_pages: number;
};

type UserInfo = {
  id: string;
  email: string;
  fullname?: string;
  created_at?: string;
  updated_at?: string;
  notifications_enabled?: boolean;
  organisation_id?: string;
  role?: string;
  status?: string;
  subscription_type?: string;
};

export type UserDetails = {
  plan_limits: PlanLimits;
  user: UserInfo;
  updated_at?: string; // local cache timestamp (ISO string)
};

export interface StatusPage {
  id: string;
  name: string;
  monitor_ids: string[];
  created_at: string;
  updated_at: string;
}

export const statusPageSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  monitor_ids: z.array(z.string()).min(1, 'At least one monitor is required'),
});

export type StatusPageFormData = z.infer<typeof statusPageSchema>;

export interface Tag {
  id: string;
  user_id: number;
  organisation_id: number | null;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export const serviceConfigSchema = z.object({
  enabled: z.boolean(),
  monitor_interval: z.number().optional(),
  notify_days_before_expiry: z.number().optional(),
  retries: z.number().optional(),
  timeout: z.number().optional(),
  follow_redirects: z.boolean().optional(),
  strategy: z.string().optional(),
  max_pages: z.number().optional(),
});

export interface Keyword {
  text: string;
  type: 'must_contain' | 'must_not_contain';
  case_sensitive: boolean;
  is_regex: boolean;
}

export const VALID_URL_REGEX = /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/;

// Regex for domain or IP address validation (no protocol or path)
export const VALID_HOST_REGEX =
  /^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$/;

export const monitorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  service_type: z
    .string()
    .min(1, 'Service type is required')
    .max(100, 'Service type must be less than 100 characters'),
  channel_ids: z.array(z.string()).optional(),
  config: z.object({
    meta: z.object({
      url: z
        .string()
        .trim()
        .regex(VALID_URL_REGEX, 'Please enter a valid URL starting with http:// or https://'),
      timeout: z.number().optional(),
      follow_redirects: z.boolean().optional(),
    }),
    services: z.record(z.string(), serviceConfigSchema),
  }),
});

export interface MonitorSettings {
  monitor_id: string;
  settings: {
    meta: {
      url?: string;
      timeout?: number;
      follow_redirects?: boolean;
      // Port monitoring fields
      host?: string;
      port?: number;
      monitor_interval?: number;
    };
    services: {
      ssl?: {
        enabled: boolean;
        monitor_interval?: number;
        notify_days_before_expiry?: number;
      };
      domain?: {
        enabled: boolean;
        monitor_interval?: number;
        notify_days_before_expiry?: number;
      };
      uptime?: {
        enabled: boolean;
        retries?: number;
        monitor_interval?: number;
      };
      lighthouse?: {
        enabled: boolean;
        timeout?: number;
        strategy?: string;
        monitor_interval?: number;
      };
      broken_links?: {
        enabled: boolean;
        timeout?: number;
        max_pages?: number;
        monitor_interval?: number;
      };
      mixed_content?: {
        enabled: boolean;
        monitor_interval?: number;
      };
      keyword?: {
        enabled: boolean;
        keywords: Array<{ keyword: string; _id?: string }>;
        monitor_interval?: number;
      };
      port_check?: {
        enabled: boolean;
        timeout?: number;
        monitor_interval: number;
      };
    };
  };
}

export type IntervalUnit = 'minute' | 'hour' | 'day';

export interface IntervalPartition {
  label: string;
  value: number;
  unit: IntervalUnit;
}

export type PLAN_TYPES = string;
