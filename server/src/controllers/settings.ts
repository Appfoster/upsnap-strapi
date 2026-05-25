import service from '../services/service';
import { UpsnapSettings } from '../types';
import type { Core } from '@strapi/strapi';
import { IP_API_BASE_URL } from '../utils/constants';

// server/controllers/settings.ts
const settings = ({ strapi }: { strapi: Core.Strapi }) => ({
  async get(ctx) {
    const settings = (await service({ strapi }).settingsStore.get()) as UpsnapSettings;
    ctx.body = {
      token: settings?.token ?? null,
      primaryMonitorId: settings?.primaryMonitorId ?? null,
    };
  },

  async set(ctx) {
    const { token, logOut } = ctx.request.body;
    if (!logOut) {
      const isValidData: any = await service({ strapi }).makeBackendRequest('/tokens/validate', {
        method: "POST",
        body: JSON.stringify({ token }),
      }, true);

      if (!isValidData?.data?.valid) {
        ctx.body = { ok: false, error: 'Invalid token' };
        return;
      }
    }
    
    const store = service({ strapi }).settingsStore;
    const current = ((await store.get()) as UpsnapSettings) || {};

    await store.set({
      value: {
        ...current,
        token,
      },
    });

    ctx.body = { ok: true };
  },

  async setPrimaryMonitorId(ctx) {
    const { monitorId } = ctx.request.body;

    const store = service({ strapi }).settingsStore;
    const current = ((await store.get()) as UpsnapSettings) || {};
    await store.set({
      value: {
        ...current,
        primaryMonitorId: monitorId,
      },
    });

    ctx.body = { ok: true };
  },

  async getPrimaryMonitorId(ctx) {
    const settings = (await service({ strapi }).settingsStore.get()) as UpsnapSettings;
    ctx.body = { primaryMonitorId: settings?.primaryMonitorId };
  },

  async trackUserData(ctx) {
    const { browser, os, language, screen, client_timezone } = ctx.request.body || {};
    
    // Get IP
    const ip = ctx.ip;
    
    // Get country from IP
    let country = '';
    let ipAddress = ip;
    try {
      if (ip && ip !== '127.0.0.1' && ip !== '::1') {
        const ipRes = await fetch(`${IP_API_BASE_URL}/${ip}/json/`);
        if (ipRes.ok) {
          const ipData: any = await ipRes.json();
          country = ipData.country_name || ipData.country || '';
        }
      }
    } catch (e) {
      // ignore
    }

    const userPayload = {
      ip_address: ipAddress,
      country,
      browser_os: `${browser || ''} / ${os || ''}`,
      timezone: client_timezone || '',
      language: language || '',
      screen: screen || '',
    };

    await service({ strapi }).trackInstallation(userPayload);

    ctx.body = { ok: true };
  },
});

export default settings;
