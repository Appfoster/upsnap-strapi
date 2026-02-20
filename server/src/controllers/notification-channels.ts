import service from '../services/service';
import type { Core } from '@strapi/strapi';

// server/controllers/settings.ts
const notificationChannels = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getNotificationChannels(ctx) {
    const notificationChannelsData = await service({ strapi }).makeBackendRequest(
      `/user/integrations`,
      {
        method: 'GET',
      }
    );

    ctx.body = { notificationChannelsData };
  },

  async createNotificationChannel(ctx) {
    const { ...data } = ctx.request.body;
    const notificationChannelsData = await service({ strapi }).makeBackendRequest(
      `/user/integrations`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    ctx.body = { notificationChannelsData };
  },

  async getSupportedIntegrations(ctx) {
    const supportedIntegrationsData = await service({ strapi }).makeBackendRequest(
      `/integrations/supported`,
      {
        method: 'GET',
      }
    );

    ctx.body = { supportedIntegrationsData };
  },

  async testNotificationChannel(ctx) {
    const { id } = ctx.params;
    const testResult = await service({ strapi }).makeBackendRequest(
      `/user/integrations/${id}/test`,
      {
        method: 'POST',
      }
    );
    ctx.body = { testResult };
  },

  async updateNotificationChannel(ctx) {
    const { id } = ctx.params;
    const { ...data } = ctx.request.body;
    const updatedChannel = await service({ strapi }).makeBackendRequest(
      `/user/integrations/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    ctx.body = { updatedChannel };
  },

  async deleteNotificationChannel(ctx) {
    const { id } = ctx.params;
    const deleteResult = await service({ strapi }).makeBackendRequest(`/user/integrations/${id}`, {
      method: 'DELETE',
    });
    ctx.body = { deleteResult };
  },
});

export default notificationChannels;
