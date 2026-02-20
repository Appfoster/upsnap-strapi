import service from '../services/service';
import type { Core } from '@strapi/strapi';

// server/controllers/settings.ts
const regions = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getRegions(ctx) {
    const regionsData = await service({ strapi }).makeBackendRequest(`/regions`, {
      method: 'GET',
    });

    ctx.body = { regionsData };
  },
});

export default regions;
