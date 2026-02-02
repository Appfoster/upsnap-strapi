import { BACKEND_URL } from "../utils/constants";
import service from "../services/service";
import { UpsnapSettings } from "../types";
import type { Core } from '@strapi/strapi';

// server/controllers/settings.ts
const monitor = ({ strapi }: { strapi: Core.Strapi }) => ({
   async getById(ctx) {
    const monitorId = ctx.params.id;
    const token = await service( { strapi }).getToken();
    console.log('token ', token);
    console.log('id ', monitorId);
    console.log('backend url ', BACKEND_URL);
    const monitorResponse = await fetch(`${BACKEND_URL}/user/monitors/${monitorId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    const monitor = await monitorResponse.json();
    ctx.body = { monitor };
  },

  async getMonitorUptimeStats(ctx) {
    const monitorId = ctx.params.id;
    const uptimeStatsData = await service( { strapi }).makeBackendRequest(`/user/monitors/${monitorId}/uptime-stats?uptime_stats_time_frames=day,week,month`, {
        method: 'GET',
    });
    
    ctx.body = { uptimeStatsData };
  },

  async getMonitorHistogram(ctx) {
    const monitorId = ctx.params.id;
    const histogramData = await service( { strapi }).makeBackendRequest(`/user/monitors/${monitorId}/histogram`, {
        method: 'GET',
    });
    ctx.body = { histogramData };
  },

  async set(ctx) {
    const { token } = ctx.request.body;

    await service( { strapi }).settingsStore.set({ value: {token} as UpsnapSettings});


    ctx.body = { ok: true };
  },
});

export default monitor;
