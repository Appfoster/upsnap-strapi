import { BACKEND_URL } from '../utils/constants';
import service from '../services/service';
import { UpsnapSettings, Uptime } from '../types';
import type { Core } from '@strapi/strapi';
import { buildSuccessResponse } from '../services/mixed-content-healthcheck';
import {
  buildReachabilityErrorResponse,
  buildReachabilitySuccessResponse,
} from '../services/reachability-healthcheck';
import { buildSslErrorResponse, buildSslSuccessResponse } from '../services/ssl-healthcheck';
import {
  buildDomainErrorResponse,
  buildDomainSuccessResponse,
} from '../services/domain-healthcheck';
import {
  buildLighthouseErrorResponse,
  buildLighthouseSuccessResponse,
} from '../services/lighthouse-healthcheck';
import { buildBrokenLinksErrorResponse, buildBrokenLinksSuccessResponse } from '../services/broken-links-healthcheck';

// server/controllers/settings.ts
const monitor = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getById(ctx) {
    const monitorId = ctx.params.id;
    const token = await service({ strapi }).getToken();
    const monitorResponse = await fetch(`${BACKEND_URL}/user/monitors/${monitorId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const monitor = await monitorResponse.json();
    ctx.body = { monitor };
  },

  async getMonitorUptimeStats(ctx) {
    const monitorId = ctx.params.id;
    const uptimeStatsData = await service({ strapi }).makeBackendRequest(
      `/user/monitors/${monitorId}/uptime-stats?uptime_stats_time_frames=day,week,month`,
      {
        method: 'GET',
      }
    );

    ctx.body = { uptimeStatsData };
  },

  async getMonitorHistogram(ctx) {
    const monitorId = ctx.params.id;
    const histogramData = await service({ strapi }).makeBackendRequest(
      `/user/monitors/${monitorId}/histogram`,
      {
        method: 'GET',
      }
    );
    ctx.body = { histogramData };
  },

  async getHealthChecks(ctx) {
    const { monitorUrl } = ctx.request.body;

    const healthCheckData = await service({ strapi }).makeBackendRequest(`/healthcheck`, {
      method: 'POST',
      headers: {
        'X-Requested-From': 'craft',
      },
      body: JSON.stringify({
        url: monitorUrl,
        checks: ['uptime', 'ssl', 'lighthouse', 'domain', 'broken_links', 'mixed_content'],
        strategy: 'desktop',
        force_fetch: false,
      }),
    });
    ctx.body = { healthCheckData };
  },

  async getUptimeHealthCheck(ctx) {
    const { monitorUrl } = ctx.request.body;
    const uptimeHealthCheckData: any = await service({ strapi }).makeBackendRequest(
      `/healthcheck`,
      {
        method: 'POST',
        headers: {
          'X-Requested-From': 'craft',
        },
        body: JSON.stringify({
          url: monitorUrl,
          checks: ['uptime'],
          force_fetch: false,
        }),
      }
    );

    const summaryOk = uptimeHealthCheckData?.result?.summary?.ok;
    const uptimeOk = uptimeHealthCheckData?.result?.details?.uptime?.ok;

    if (summaryOk === false || uptimeOk === false) {
      const errorResponse = buildReachabilityErrorResponse(uptimeHealthCheckData);
      ctx.body = { uptimeHealthCheckData: errorResponse };
      return;
    }

    // Success path: rebuild normalized success response
    ctx.body = { uptimeHealthCheckData: buildReachabilitySuccessResponse(uptimeHealthCheckData) };
  },

  async getSslHealthCheck(ctx) {
    const { monitorUrl } = ctx.request.body;

    const sslHealthCheckData: any = await service({ strapi }).makeBackendRequest(`/healthcheck`, {
      method: 'POST',
      headers: {
        'X-Requested-From': 'craft',
      },
      body: JSON.stringify({
        url: monitorUrl,
        checks: ['ssl'],
        force_fetch: false,
      }),
    });
    const summaryOk = sslHealthCheckData?.result?.summary?.ok;
    const sslOk = sslHealthCheckData?.result?.details?.ssl?.ok;
    const sslError = sslHealthCheckData?.result?.details?.ssl?.error;

    // Microservice returned error even with 200
    if ((summaryOk === false || sslOk === false) && sslError) {
      ctx.body = { sslHealthCheckData: buildSslErrorResponse(sslHealthCheckData) };
      return;
    }
    ctx.body = { sslHealthCheckData: buildSslSuccessResponse(sslHealthCheckData) };
  },

  async getDomainHealthCheck(ctx) {
    const { monitorUrl } = ctx.request.body;

    const domainHealthCheckData: any = await service({ strapi }).makeBackendRequest(
      `/healthcheck`,
      {
        method: 'POST',
        headers: {
          'X-Requested-From': 'craft',
        },
        body: JSON.stringify({
          url: monitorUrl,
          checks: ['domain'],
          force_fetch: false,
        }),
      }
    );
    const summaryOk = domainHealthCheckData?.result?.summary?.ok;
    const domainOk = domainHealthCheckData?.result?.details?.domain?.ok;
    const domainError = domainHealthCheckData?.result?.details?.domain?.error;

    // Microservice returned error even with 200
    if ((summaryOk === false || domainOk === false) && domainError) {
      ctx.body = { domainHealthCheckData: buildDomainErrorResponse(domainHealthCheckData) };
      return;
    }
    ctx.body = { domainHealthCheckData: buildDomainSuccessResponse(domainHealthCheckData) };
  },

  async getLighthouseHealthCheck(ctx) {
    const { monitorUrl, strategy } = ctx.request.body;

    const lighthouseHealthCheckData: any = await service({ strapi }).makeBackendRequest(
      `/healthcheck`,
      {
        method: 'POST',
        headers: {
          'X-Requested-From': 'craft',
        },
        body: JSON.stringify({
          url: monitorUrl,
          checks: ['lighthouse'],
          strategy: strategy || 'desktop',
          force_fetch: false,
        }),
      }
    );
    const summaryOk = lighthouseHealthCheckData?.result?.summary?.ok;
    const lighthouseOk = lighthouseHealthCheckData?.result?.details?.lighthouse?.ok;
    const lighthouseError = lighthouseHealthCheckData?.result?.details?.lighthouse?.error;

    // Error from microservice
    if ((summaryOk === false || lighthouseOk === false) && lighthouseError) {
      ctx.body = {
        lighthouseHealthCheckData: buildLighthouseErrorResponse(lighthouseHealthCheckData),
      };
      return;
    }
    ctx.body = {
      lighthouseHealthCheckData: buildLighthouseSuccessResponse(lighthouseHealthCheckData),
    };
  },

  async getBrokenLinksHealthCheck(ctx) {
    const { monitorUrl } = ctx.request.body;

    const brokenLinksHealthCheckData: any = await service({ strapi }).makeBackendRequest(
      `/healthcheck`,
      {
        method: 'POST',
        headers: {
          'X-Requested-From': 'craft',
        },
        body: JSON.stringify({
          url: monitorUrl,
          checks: ['broken_links'],
          force_fetch: false,
        }),
      }
    );
    
    const summaryOk = brokenLinksHealthCheckData?.result?.summary?.ok;
    const checkOk = brokenLinksHealthCheckData?.result?.details?.broken_links?.ok;
    const isError = brokenLinksHealthCheckData?.result?.details?.broken_links?.error;

    // When microservice itself returns ok: false but with 200
    if ((summaryOk === false || checkOk === false ) && isError) {
      ctx.body = { brokenLinksHealthCheckData: buildBrokenLinksErrorResponse(brokenLinksHealthCheckData)};
      return;
    }

    ctx.body = { brokenLinksHealthCheckData: buildBrokenLinksSuccessResponse(brokenLinksHealthCheckData) };
  },

  async getMixedContentHealthCheck(ctx) {
    const { monitorUrl } = ctx.request.body;

    const mixedContentHealthCheckData = await service({ strapi }).makeBackendRequest(
      `/healthcheck`,
      {
        method: 'POST',
        headers: {
          'X-Requested-From': 'craft',
        },
        body: JSON.stringify({
          url: monitorUrl,
          checks: ['mixed_content'],
          force_fetch: false,
        }),
      }
    );
    ctx.body = { mixedContentHealthCheckData: buildSuccessResponse(mixedContentHealthCheckData) };
  },

  async getMonitorResponseTime(ctx) {
    const monitorId = ctx.params.id;
    const { start, end, region } = ctx.query;
    console.log('start ', start, end);
    const responseTimeData = await service({ strapi }).makeBackendRequest(
      `/user/monitors/${monitorId}/response-time?start=${start}&end=${end}&region=${region || 'default'}`,
      {
        method: 'GET',
      }
    );
    ctx.body = { responseTimeData };
  },

  async getMonitorIncidents(ctx) {
    const monitorId = ctx.params.id;
    const incidentsData = await service({ strapi }).makeBackendRequest(
      `/user/monitors/incidents?monitorId=${monitorId}&page=1&page_size=20&time_range=7D`,
      {
        method: 'GET',
      }
    );
    ctx.body = { incidentsData };
  },
});

export default monitor;
