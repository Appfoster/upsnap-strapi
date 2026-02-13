import service from '../services/service';
import type { Core } from '@strapi/strapi';

// server/controllers/settings.ts
const notificationChannels = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getNotificationChannels(ctx) {
    const notificationChannelsData = await service({ strapi }).makeBackendRequest(`/user/integrations`, {
      method: 'GET',
    });

    ctx.body = { notificationChannelsData };
  },

  async createNotificationChannel(ctx) {
    const { ...data } = ctx.request.body;
    const notificationChannelsData = await service({ strapi }).makeBackendRequest(`/user/integrations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    ctx.body = { notificationChannelsData };
  }
});

export default notificationChannels;
