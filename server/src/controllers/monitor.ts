import { BACKEND_URL } from '../utils/constants';
import service from '../services/service';
import { UpsnapSettings } from '../types';
import type { Core } from '@strapi/strapi';

// server/controllers/settings.ts
const monitor = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getById(ctx) {
    const monitorId = ctx.params.id;
    const token = await service({ strapi }).getToken();
    console.log('token ', token);
    console.log('id ', monitorId);
    console.log('backend url ', BACKEND_URL);
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
    console.log('Request body:', ctx.request.body); 
    const { monitorUrl } = ctx.request.body;
    const uptimeHealthCheckData = await service({ strapi }).makeBackendRequest(`/healthcheck`, {
      method: 'POST',
      headers: {
        'X-Requested-From': 'craft',
      },
      body: JSON.stringify({
        url: monitorUrl,
        checks: ['uptime'],
        force_fetch: false,
      }),
    });
    console.log('uptime health check data ', uptimeHealthCheckData);
    ctx.body = { uptimeHealthCheckData };
  },
  async getSslHealthCheck(ctx) {
        const { monitorUrl } = ctx.request.body;

    const sslHealthCheckData = await service({ strapi }).makeBackendRequest(`/healthcheck`, {
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
    ctx.body = { sslHealthCheckData };
  },
  async getDomainHealthCheck(ctx) {
        const { monitorUrl } = ctx.request.body;

    const domainHealthCheckData = await service({ strapi }).makeBackendRequest(`/healthcheck`, {
      method: 'POST',
      headers: {
        'X-Requested-From': 'craft',
      },
      body: JSON.stringify({
        url: monitorUrl,
        checks: ['domain'],
        force_fetch: false,
      }),
    });
    ctx.body = { domainHealthCheckData };
  },
  async getLighthouseHealthCheck(ctx) {
        const { monitorUrl } = ctx.request.body;

    const lighthouseHealthCheckData = await service({ strapi }).makeBackendRequest(
      `/healthcheck`,
      {
        method: 'POST',
        headers: {
          'X-Requested-From': 'craft',
        },
        body: JSON.stringify({
          url: monitorUrl,
          checks: ['lighthouse'],
          strategy: 'desktop',
          force_fetch: false,
        }),
      }
    );
    ctx.body = { lighthouseHealthCheckData };
  },
  async getBrokenLinksHealthCheck(ctx) {
        const { monitorUrl } = ctx.request.body;

    const brokenLinksHealthCheckData = await service({ strapi }).makeBackendRequest(
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
    ctx.body = { brokenLinksHealthCheckData };
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
    ctx.body = { mixedContentHealthCheckData };
  },
});

export default monitor;
