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
      console.log('register data ', registerData)
      // const registerData = {
      //   monitor_id: "ea138e90-cdcb-4d70-b897-ac6c6e18f57c",
      //   api_token: "b59e56c6b981e1b67a5d6da8e367e53ab8fc7e5eee08a2b514608b99e73febf5"
      // }
      if (registerData?.data?.token) {
        const apiToken = await userDetailsService({ strapi }).getUserApiToken(registerData?.data?.token);
        const monitorId = await userDetailsService({ strapi }).createInitialMonitor(site_url, apiToken);
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
      // const registerData = {
      //   monitor_id: "ea138e90-cdcb-4d70-b897-ac6c6e18f57c",
      //   api_token: "b59e56c6b981e1b67a5d6da8e367e53ab8fc7e5eee08a2b514608b99e73febf5"
      // }

      console.log('session token ', loginData?.data?.token)
      if (loginData?.data?.token) {
        const apiToken = await userDetailsService({ strapi }).getUserApiToken(loginData?.data?.token);
        const store = service({ strapi }).settingsStore;
        const current = ((await store.get()) as UpsnapSettings) || {};
        console.log('storing token and returning true ', apiToken)
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
      console.log('Error signing up ', err);
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
      console.log('forgotPasswordData data ', forgotPasswordData)
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
