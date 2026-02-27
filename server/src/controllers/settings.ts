import service from '../services/service';
import { UpsnapSettings } from '../types';
import type { Core } from '@strapi/strapi';

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
    const { token } = ctx.request.body;
    const isValidData: any = await service({ strapi }).makeBackendRequest('/tokens/validate', {
      method: "POST",
      body: JSON.stringify({ token }),
    }, true);

    if (!isValidData?.data?.valid) {
      ctx.body = { ok: false, error: 'Invalid token' };
      return;
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
});

export default settings;
