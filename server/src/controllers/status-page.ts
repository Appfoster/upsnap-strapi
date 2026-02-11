import service from '../services/service';
import type { Core } from '@strapi/strapi';

// server/controllers/settings.ts
const statusPage = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getStatusPages(ctx) {
    const statusPagesData = await service({ strapi }).makeBackendRequest(`/user/status-pages`, {
      method: 'GET',
    });

    ctx.body = { statusPagesData };
  },

  async getStatusPagesByID(ctx) {
    const id = ctx.params.id;
    const statusPagesData = await service({ strapi }).makeBackendRequest(`/user/status-pages/${id}`, {
      method: 'GET',
    });

    ctx.body = { statusPagesData };
  },

  async saveStatusPages(ctx) {
    const { name, monitor_ids, is_published } = ctx.request.body;
    const statusPagesData = await service({ strapi }).makeBackendRequest(`/user/status-pages`, {
      method: 'POST',
      body: JSON.stringify({ name, monitor_ids, is_published }),
    });
    ctx.body = { statusPagesData };
  },

  async updateStatusPages(ctx) {
    const { id, ...data } = ctx.request.body;

    const statusPagesData = await service({ strapi }).makeBackendRequest(
      `/user/status-pages/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    ctx.body = { statusPagesData };
  },

  async resetLink(ctx) {
    const { id } = ctx.request.body;
    const statusPagesData = await service({ strapi }).makeBackendRequest(
      `/user/status-pages/${id}/reset`,
      {
        method: 'POST'
      }
    );
    ctx.body = { statusPagesData };
  },

  async deleteStatusPages(ctx) {
    const id = ctx.params.id;
    const statusPagesData = await service({ strapi }).makeBackendRequest(
      `/user/status-pages/${id}`,
      {
        method: 'DELETE'
      }
    );
    ctx.body = { statusPagesData };
  }
});

export default statusPage;
