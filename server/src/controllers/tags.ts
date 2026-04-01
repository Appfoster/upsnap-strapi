import service from '../services/service';
import type { Core } from '@strapi/strapi';

// server/controllers/settings.ts
const tags = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getTags(ctx) {
    const tagsData = await service({ strapi }).makeBackendRequest(`/user/tags`, {
      method: 'GET',
    });

    ctx.body = { tagsData };
  },

  async getTagsByID(ctx) {
    const id = ctx.params.id;
    const tagsData = await service({ strapi }).makeBackendRequest(
      `/user/tags/${id}`,
      {
        method: 'GET',
      }
    );

    ctx.body = { tagsData };
  },

  async createTag(ctx) {
    const { name, color } = ctx.request.body;
    const tagsData = await service({ strapi }).makeBackendRequest(`/user/tags`, {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    });
    ctx.body = { tagsData };
  },

  async updateTags(ctx) {
    const id = ctx.params.id;
    const { ...data } = ctx.request.body;
    
    if (!id) {
      ctx.status = 400;
      ctx.body = { error: 'Tag ID is required' };
      return;
    }

    const tagsData = await service({ strapi }).makeBackendRequest(
      `/user/tags/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    ctx.body = { tagsData };
  },

  async deleteTags(ctx) {
    const id = ctx.params.id;
    const tagsData = await service({ strapi }).makeBackendRequest(
      `/user/tags/${id}`,
      {
        method: 'DELETE',
      }
    );
    ctx.body = { tagsData };
  },
});

export default tags;
