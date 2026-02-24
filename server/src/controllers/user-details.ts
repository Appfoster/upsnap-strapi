import service from '../services/service';
import type { Core } from '@strapi/strapi';

// server/controllers/settings.ts
const userDetails = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getUserDetails(ctx) {
    const userDetailsData = await service({ strapi }).makeBackendRequest(`/user/details`, {
      method: 'GET',
    });

    ctx.body = { userDetailsData };
  },
});

export default userDetails;
