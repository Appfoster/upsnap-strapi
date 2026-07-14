import crypto from 'crypto';
import type { Core } from '@strapi/strapi';
import { UpsnapSettings } from '../types';
import {
  BACKEND_URL,
  IP_API_BASE_URL,
  TOKEN_STATUS_CACHE_MS,
  BILLING_STATUS_CACHE_MS,
  EXPIRY_SUMMARY_CACHE_MS,
  SSL_EXPIRY_WARNING_DAYS,
  DOMAIN_EXPIRY_WARNING_DAYS,
} from '../utils/constants';
import packageJson from '../../../package.json';

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  getWelcomeMessage() {
    return 'Welcome to Strapi 🚀';
  },
  withoutAccountCaches(current: Partial<UpsnapSettings>): Partial<UpsnapSettings> {
    const { tokenStatus, billingStatus, expirySummary, ...rest } = current;
    return rest;
  },
  settingsStore: strapi.store({
    type: 'plugin',
    name: 'upsnap',
    key: 'settings',
  }),
  async getToken() {
    const settings = (await this.settingsStore.get()) as UpsnapSettings;
    return settings?.token || null;
  },
  async getTokenStatus(forceRefresh: boolean = false) {
    const settings = (await this.settingsStore.get()) as UpsnapSettings | null;
    const token = settings?.token;

    if (!token) {
      return { hasToken: false };
    }

    // Only ever trust a cached result that previously confirmed the token as active.
    // Any non-active (or uncertain) cached value always re-checks live immediately,
    // instead of repeating a possibly-wrong result for the rest of its TTL window.
    const cached = settings?.tokenStatus?.status === 'active' ? settings.tokenStatus : undefined;
    if (!forceRefresh && cached?.checkedAt) {
      const ageMs = Date.now() - Date.parse(cached.checkedAt);
      if (ageMs >= 0 && ageMs < TOKEN_STATUS_CACHE_MS) {
        return { hasToken: true, ...cached };
      }
    }

    // /tokens/validate's real response contract on this backend isn't proven anywhere
    // in the existing codebase (signup/login never call it). /user/details, on the
    // other hand, is already called successfully on every page load — so a successful
    // response from it is the most reliable signal that the token actually works.
    const result: any = await this.makeBackendRequest('/user/details', { method: 'GET' });
    const data = result?.data;
    const knownBadStatuses = ['suspended', 'expired', 'account_expired', 'deleted'];

    let status = 'unknown';
    if (result?.error) {
      // Our own request never went out (e.g. no token) — not a statement about the token.
      status = 'unknown';
    } else if (result?.status === 'success' && data) {
      const userStatus = data?.user?.status;
      status = knownBadStatuses.includes(userStatus) ? userStatus : 'active';
    } else {
      status = 'expired';
    }

    const tokenStatus = {
      status,
      plan: data?.user?.subscription_type ?? null,
      planLimits: data?.plan_limits ?? null,
      monitorsCount: data?.monitors_count ?? null,
      checkedAt: new Date().toISOString(),
    };

    await this.settingsStore.set({
      value: { ...settings, tokenStatus },
    });

    return { hasToken: true, ...tokenStatus };
  },
  async getBillingStatus(forceRefresh: boolean = false) {
    const settings = (await this.settingsStore.get()) as UpsnapSettings | null;
    const token = settings?.token;

    if (!token) {
      return { hasToken: false };
    }

    const cached = settings?.billingStatus;
    if (!forceRefresh && cached?.checkedAt) {
      const ageMs = Date.now() - Date.parse(cached.checkedAt);
      if (ageMs >= 0 && ageMs < BILLING_STATUS_CACHE_MS) {
        return { hasToken: true, ...cached };
      }
    }

    const result: any = await this.makeBackendRequest('/billing/status', { method: 'GET' });
    const data = result?.data;

    const billingStatus = {
      planName: data?.plan_name ?? null,
      subscriptionStatus: data?.subscription_status ?? null,
      currentPeriodEnd: data?.current_period_end ?? null,
      cancelAtPeriodEnd: data?.cancel_at_period_end ?? false,
      checkedAt: new Date().toISOString(),
    };

    await this.settingsStore.set({
      value: { ...settings, billingStatus },
    });

    return { hasToken: true, ...billingStatus };
  },
  async getExpirySummary(forceRefresh: boolean = false) {
    const settings = (await this.settingsStore.get()) as UpsnapSettings | null;
    const token = settings?.token;

    if (!token) {
      return { hasToken: false, alerts: [] };
    }

    const cached = settings?.expirySummary;
    if (!forceRefresh && cached?.checkedAt) {
      const ageMs = Date.now() - Date.parse(cached.checkedAt);
      if (ageMs >= 0 && ageMs < EXPIRY_SUMMARY_CACHE_MS) {
        return { hasToken: true, ...cached };
      }
    }

    const monitorsResult: any = await this.makeBackendRequest('/user/monitors', { method: 'GET' });
    const monitors: any[] = monitorsResult?.data?.monitors ?? [];

    const alerts = (
      await Promise.all(
        monitors.map(async (monitorItem) => {
          const url = monitorItem?.config?.meta?.url;
          if (!url || !monitorItem?.is_enabled) return [];

          const [sslResult, domainResult] = await Promise.all([
            this.makeBackendRequest('/healthcheck', {
              method: 'POST',
              headers: { 'X-Requested-From': 'strapi' },
              body: JSON.stringify({ url, checks: ['ssl'], force_fetch: false }),
            }),
            this.makeBackendRequest('/healthcheck', {
              method: 'POST',
              headers: { 'X-Requested-From': 'strapi' },
              body: JSON.stringify({ url, checks: ['domain'], force_fetch: false }),
            }),
          ]) as [any, any];

          const monitorAlerts: Array<{
            monitorId: string;
            monitorName: string;
            type: 'ssl' | 'domain';
            daysRemaining: number;
          }> = [];

          const leafCert = sslResult?.result?.details?.ssl?.meta?.chain?.find(
            (c: any) => c.depth === 0
          )?.info;
          if (leafCert) {
            const daysUntilExpiry = leafCert.isExpired ? 0 : leafCert.daysUntilExpiry;
            if (typeof daysUntilExpiry === 'number' && daysUntilExpiry <= SSL_EXPIRY_WARNING_DAYS) {
              monitorAlerts.push({
                monitorId: monitorItem.id,
                monitorName: monitorItem.name,
                type: 'ssl',
                daysRemaining: Math.max(0, daysUntilExpiry),
              });
            }
          }

          const domainMeta = domainResult?.result?.details?.domain?.meta;
          if (domainMeta) {
            const domainDays = domainMeta.domainExpired ? 0 : domainMeta.domainDays;
            if (typeof domainDays === 'number' && domainDays <= DOMAIN_EXPIRY_WARNING_DAYS) {
              monitorAlerts.push({
                monitorId: monitorItem.id,
                monitorName: monitorItem.name,
                type: 'domain',
                daysRemaining: Math.max(0, domainDays),
              });
            }
          }

          return monitorAlerts;
        })
      )
    ).flat();

    const expirySummary = {
      alerts,
      checkedAt: new Date().toISOString(),
    };

    await this.settingsStore.set({
      value: { ...settings, expirySummary },
    });

    return { hasToken: true, ...expirySummary };
  },
  async makeBackendRequest(
    endpoint: string,
    options: RequestInit,
    forValidation: boolean = false,
    sessionToken: string = ''
  ) {
    const token = await this.getToken();
    if (!token && !forValidation) {
      return { error: 'No token found in settings' };
    }

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${sessionToken || token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const contentType = response.headers.get('content-type') || '';

    // Handle JSON
    if (contentType.includes('application/json')) {

      return await response.json();
    }

    // Handle CSV
    if (contentType.includes('text/csv')) {
      return {
        type: 'csv',
        data: await response.text(),
        headers: response.headers,
      };
    }

    // Handle binary (Excel, PDF, etc.)
    return {
      type: 'blob',
      data: await response.arrayBuffer(),
      headers: response.headers,
    };
  },
  async trackInstallation(userPayload?: any) {
    try {
      const settings = (await this.settingsStore.get()) as UpsnapSettings | null;

      if (settings?.installationTracked) {
        return;
      }

      const pluginVersion = packageJson.version;
      const strapiVersion = strapi.config.get('info.strapi');
      const siteUrl =
        strapi.config.get('server.url') ||
        `http://${strapi.config.get('server.host') || 'localhost'}:${strapi.config.get('server.port') || 1337}`;
      const users = await strapi.db.query('admin::user').findMany({
        orderBy: { createdAt: 'ASC' },
        limit: 1,
      });
      const firstUser = users?.[0];
      const email = firstUser?.email || '';
      const name = `${firstUser?.firstname || ''} ${firstUser?.lastname || ''}`.trim();
      const phoneNumber = firstUser?.phoneNumber || firstUser?.phone || '';
      const company = firstUser?.company || '';
      const installId = settings?.installId || crypto.randomUUID();

      let finalDetails: any = {
        version: pluginVersion,
        site_url: siteUrl,
        strapi_version: strapiVersion,
        install_id: installId,
        email,
        name,
        phone_number: phoneNumber,
        company,
      };

      if (userPayload) {
        finalDetails = { ...finalDetails, ...userPayload };
      } else {
        let ipAddress = '';
        let country = '';
        let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        let browserOs = `Node.js ${process.version} / ${process.platform}`;

        try {
          const ipRes = await fetch(`${IP_API_BASE_URL}/json/`);
          if (ipRes.ok) {
            const ipData: any = await ipRes.json();
            ipAddress = ipData.ip || '';
            country = ipData.country_name || ipData.country || '';
            if (ipData.timezone) timezone = ipData.timezone;
          }
        } catch (e) {
          // ignore
        }

        finalDetails = {
          ...finalDetails,
          ip_address: ipAddress,
          country,
          browser_os: browserOs,
          timezone,
        };
      }

      const response: any = await this.makeBackendRequest(
        '/installation-data',
        {
          method: 'POST',
          body: JSON.stringify({
            platform: 'strapi',
            details: finalDetails,
          }),
        },
        true
      );

      if (response?.status === 'success' && !settings?.installationTracked) {
        await this.settingsStore.set({
          value: {
            ...(settings || {}),
            installId: installId,
            installationTracked: true,
          },
        });
      }
    } catch (error) {
      console.log('UpSnap: Failed to track installation data ', error);
    }
  },
});

export default service;
