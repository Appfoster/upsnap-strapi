import service from '../services/service';
import type { Core } from '@strapi/strapi';
import { UpsnapSettings } from '../types';
import userDetailsService from '../services/user-details';

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
      const { email, password, source, site_url, fullName } = ctx.request.body;
      const registerData: any = await service({ strapi }).makeBackendRequest(
        `/user/register`,
        {
          method: 'POST',
          body: JSON.stringify({
            email: email,
            password: password,
            source: source,
            full_name: fullName
          }),
        },
        true
      );

      if (registerData?.data?.token) {
        const apiToken = await userDetailsService({ strapi }).getUserApiToken(registerData?.data?.token);

        const monitorId = await userDetailsService({ strapi }).createInitialMonitor(site_url, apiToken);
        if (!apiToken || !monitorId) {
          ctx.body = { ok: false, message: 'Error creating API token or Monitor' };
          return;
        }

        const store = service({ strapi }).settingsStore;
        const current = ((await store.get()) as UpsnapSettings) || {};

        await store.set({
          value: {
            ...current,
            token: apiToken,
            primaryMonitorId: monitorId,
          },
        });
        return ctx.body = { ok: true, message: registerData?.data?.message };
      }
      ctx.body = { ok: false };
    } catch (err) {
      console.log('Error signing up ', err);
      ctx.body = { ok: false };
    }
  },
  async signIn(ctx) {
    try {
      const { email, password  } = ctx.request.body;
      const loginData: any = await service({ strapi }).makeBackendRequest(
        `/user/login`,
        {
          method: 'POST',
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        },
        true
      );
 
  
      if (loginData?.data?.token) {
        const apiToken = await userDetailsService({ strapi }).getUserApiToken(loginData?.data?.token);
        const store = service({ strapi }).settingsStore;
        const current = ((await store.get()) as UpsnapSettings) || {};

        await store.set({
          value: {
            ...current,
            token: apiToken,
          },
        });
        return ctx.body = { ok: true };
      }
      ctx.body = { ok: false, message: loginData?.message };
    } catch (err) {
      console.log('Error signing in ', err);
      ctx.body = { ok: false };
    }
  },
  async forgotPassword(ctx) {
    try {
      const { email  } = ctx.request.body;
      const forgotPasswordData: any = await service({ strapi }).makeBackendRequest(
        `/user/forgot-password`,
        {
          method: 'POST',
          body: JSON.stringify({
            email: email,
          }),
        },
        true
      );

      if (forgotPasswordData?.status === 'success') {
        return ctx.body = { ok: true, message: forgotPasswordData?.data?.message}
      }
      ctx.body = { ok: false };
    } catch (err) {
      console.log('Error for forgot password ', err);
      ctx.body = { ok: false };
    }
  }
});

export default userDetails;
