import { IntervalPartition } from "./types";

export const PLAN_TYPES = {
  FREE: 'free',
  PRO: 'pro',
  TRIAL: 'trial',
};

export const PLAN_LIMITS = {
  TRIAL: {
    max_integrations: 2,
    max_monitors: 2,
    max_notifications_per_day: 100,
    min_monitoring_interval: 5,
    max_status_pages: 1,
  },
};

export const DASHBOARD_URL = 'https://upsnap.ai';

export const REGIONS = {
  default: {
    name: 'Default (Server Region)',
  },
  'us-east-1': {
    name: 'US East (Virginia)',
  },
  'eu-west-1': {
    name: 'Europe (Ireland)',
  },
  'ap-south-1': {
    name: 'Asia Pacific (Mumbai)',
  },
  'ap-southeast-2': {
    name: 'Asia Pacific (Sydney)',
  },
  'sa-east-1': {
    name: 'South America (São Paulo)',
  },
};

export const DEFAULT_REGION = {
  id: 'default',
  name: 'Default (Server Region)',
};

export const MONITOR_TYPE = {
  WEBSITE: 'website',
  PORT: 'port',
  KEYWORD: 'keyword',
};

export const MONITOR = {
  MONITOR_STATUSES: {
    UP: 'up',
    DOWN: 'down',
    PAUSED: 'paused',
    RESUMED: 'resumed',
  },
  MONITORS_POLLING_INTERVAL: 5 * 60 * 1000, // 5 minutes
  LIGHTHOUSE_MIN_INTERVAL_SECONDS: 86400, // 1 day
  LIGHTHOUSE_DEFAULT_INTERVAL_SECONDS: 7 * 86400, // 7 days
};

export const MONITOR_TYPE_OPTIONS = [
  { value: MONITOR_TYPE.WEBSITE, label: 'Website Monitoring' },
  { value: MONITOR_TYPE.PORT, label: 'Port Monitoring' },
  { value: MONITOR_TYPE.KEYWORD, label: 'Keyword Monitoring' },
];

export const INTEGRATIONS_TYPES = {
  webhook: {
    name: 'webhook',
    label: 'Webhook',
  },
  google_chat: {
    name: 'google_chat',
    label: 'Google Chat',
  },
  discord: {
    name: 'discord',
    label: 'Discord',
  },
  email: {
    name: 'email',
    label: 'Email',
  },
  slack: {
    name: 'slack',
    label: 'Slack',
  },
  telegram: {
    name: 'telegram',
    label: 'Telegram',
  },
};

export const colors = [
  '#4CAF50',
  '#2196F3',
  '#FF9800',
  '#9C27B0',
  '#00BCD4',
  '#F44336',
  '#8BC34A',
  '#FFEB3B',
];


export const timeRanges = [
  { value: 'last_hour', label: 'Last hour' },
  { value: 'last_24_hours', label: 'Last 24 hours' },
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'last_year', label: 'Last year' },
];

export const EXPIRY_OPTIONS = [
  { label: '1 day', value: 1 },
  { label: '7 days', value: 7 },
  { label: '15 days', value: 15 },
  { label: '1 month', value: 30 },
  { label: '3 months', value: 90 },
];

export const INTERVALS: IntervalPartition[] = [
  { label: '1d', value: 1, unit: 'day' },
  { label: '2d', value: 2, unit: 'day' },
  { label: '5d', value: 5, unit: 'day' },
  { label: '7d', value: 7, unit: 'day' },
  { label: '10d', value: 10, unit: 'day' },
];


export const PARTITIONS = [
  { label: '1m', seconds: 60 },
  { label: '2m', seconds: 120 },
  { label: '5m', seconds: 300 },
  { label: '30m', seconds: 1800 },
  { label: '1h', seconds: 3600 },
  { label: '12h', seconds: 43200 },
  { label: '24h', seconds: 86400 },
];
