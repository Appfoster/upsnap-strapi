// Upsnap API base URL. Resolved at runtime from the host Strapi app's
// environment so builds/publishes never bake in a specific environment.
// Override via the host app's .env, e.g. UPSNAP_API_URL=https://your-upsnap-api.example.com/v1
export const BACKEND_URL = (process.env.UPSNAP_API_URL || 'https://api.upsnap.ai/v1').replace(
  /\/+$/,
  ''
);

export const IP_API_BASE_URL = 'https://ipapi.co';

export const LIGHTHOUSE_CHECKS = ['performance', 'accessibility', 'bestPractices', 'seo', 'pwa'];

export const TOKEN_STATUS_CACHE_MS = 10 * 60 * 1000; // 10 minutes

export const BILLING_STATUS_CACHE_MS = 10 * 60 * 1000; // 10 minutes

export const EXPIRY_SUMMARY_CACHE_MS = 60 * 60 * 1000; // 1 hour

export const SSL_EXPIRY_WARNING_DAYS = 14;

export const DOMAIN_EXPIRY_WARNING_DAYS = 30;
