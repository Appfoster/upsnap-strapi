import service from "../services/service";
import { UpsnapSettings } from "../types";
import type { Core } from '@strapi/strapi';

// server/controllers/settings.ts
const settings = ({ strapi }: { strapi: Core.Strapi }) => ({
   async get(ctx) {
    const settings = (await service( { strapi }).settingsStore.get()) as UpsnapSettings;

    console.log(settings.token);

    ctx.body = { token: settings.token };
  },

  async set(ctx) {
    const { token } = ctx.request.body;

    await service( { strapi }).settingsStore.set({ value: {token} as UpsnapSettings});


    ctx.body = { ok: true };
  },
});

export default settings;
