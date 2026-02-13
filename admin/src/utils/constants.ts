export const PLAN_TYPES = {
  FREE :"free",
  PRO: "pro",
  TRIAL: "trial"
}


export const PLAN_LIMITS = {
  FREE : {
    "max_integrations": 2,
    "max_monitors": 2,
    "max_notifications_per_day": 100,
    "min_monitoring_interval": 5,
    "max_status_pages": 1,
  }
}

export const DASHBOARD_URL = 'https://upsnap-app.appfoster.site'

export const REGIONS = {
  default: {
    name: "Default (Server Region)"
  },
  "us-east-1": {
    name: "US East (Virginia)"
  },
  "eu-west-1": {
    name: "Europe (Ireland)"
  },
  "ap-south-1": {
    name: "Asia Pacific (Mumbai)"
  },
  "ap-southeast-2": {
    name: "Asia Pacific (Sydney)"
  },
  "sa-east-1": {
    name: "South America (São Paulo)"
  },
};

export const DEFAULT_REGION = {
  id: "default",
  name: "Default (Server Region)",
}

export const MONITOR_TYPE = {
  WEBSITE: "website",
  PORT: "port",
  KEYWORD: "keyword",
}

export const MONITOR = {
  MONITOR_STATUSES : {
    UP: "up",
    DOWN: "down",
    PAUSED: "paused",
    RESUMED: "resumed",
  },
  MONITORS_POLLING_INTERVAL : 5 * 60 * 1000, // 5 minutes
  LIGHTHOUSE_MIN_INTERVAL_SECONDS: 86400, // 1 day
  LIGHTHOUSE_DEFAULT_INTERVAL_SECONDS: 7 * 86400, // 7 days
}

export const MONITOR_TYPE_OPTIONS = [
  { value: MONITOR_TYPE.WEBSITE, label: "Website Monitoring" },
  { value: MONITOR_TYPE.PORT, label: "Port Monitoring" },
  { value: MONITOR_TYPE.KEYWORD, label: "Keyword Monitoring" },
];

export const INTEGRATIONS_TYPES = {
  webhook: {
    name: "webhook",
    label: "Webhook",
  },
  google_chat: {
    name: "google_chat",
    label: "Google Chat",
  },
  discord: {
    name: "discord",
    label: "Discord",
  },
  email : {
    name: "email",
    label: "Email",
  },
  slack : {
    name: "slack",
    label: "Slack",
  },
  telegram : {
    name: "telegram",
    label: "Telegram",
  },
};
