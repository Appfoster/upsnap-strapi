import service from '../services/service';
import type { Core } from '@strapi/strapi';
import { UpsnapSettings } from '../types';

// server/controllers/settings.ts
const userDetails = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getUserDetails(ctx) {
    const userDetailsData = await service({ strapi }).makeBackendRequest(`/user/details`, {
      method: 'GET',
    });

    ctx.body = { userDetailsData };
  },

  async signUp(ctx) {
    try {
      const { ...data } = ctx.request.body;
      const registerData: any = await service({ strapi }).makeBackendRequest(
        `/plugin/signup`,
        {
          method: 'POST',
          body: data,
        }
      );
      if (registerData?.api_token && registerData?.monitor_id) {
        const store = service({ strapi }).settingsStore;
        const current = ((await store.get()) as UpsnapSettings) || {};

        await store.set({
          value: {
            ...current,
            token: registerData?.api_token,
            primaryMonitorId: registerData?.monitor_id,
          },
        });
        ctx.body = { ok: true };
      }
      ctx.body = { ok: false };
    } catch (err) {
      console.log('Error signing up ', err);
      ctx.body = { ok: false };
    }
  },
});

export default userDetails;
