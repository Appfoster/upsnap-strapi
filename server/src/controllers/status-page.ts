import fs from 'fs';
import service from '../services/service';
import type { Core } from '@strapi/strapi';
import { BACKEND_URL } from '../utils/constants';

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
    const statusPagesData = await service({ strapi }).makeBackendRequest(
      `/user/status-pages/${id}`,
      {
        method: 'GET',
      }
    );

    ctx.body = { statusPagesData };
  },

  async saveStatusPages(ctx) {
    const { ...data } = ctx.request.body;
    const statusPagesData = await service({ strapi }).makeBackendRequest(`/user/status-pages`, {
      method: 'POST',
      body: JSON.stringify(data),
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
        method: 'POST',
      }
    );
    ctx.body = { statusPagesData };
  },

  async deleteStatusPages(ctx) {
    const id = ctx.params.id;
    const statusPagesData = await service({ strapi }).makeBackendRequest(
      `/user/status-pages/${id}`,
      {
        method: 'DELETE',
      }
    );
    ctx.body = { statusPagesData };
  },

  async uploadAsset(ctx) {
    const { id } = ctx.params;
    const file = (ctx.request.files as any)?.file;
    const { asset_type } = ctx.request.body as any;

    if (!file || !asset_type) {
      ctx.status = 400;
      ctx.body = { error: 'file and asset_type are required' };
      return;
    }

    const token = await service({ strapi }).getToken();
    const buffer = fs.readFileSync(file.filepath || file.path);
    const formData = new FormData();
    formData.append(
      'file',
      new Blob([buffer], { type: file.mimetype || file.type }),
      file.originalFilename || file.newFilename || file.name || 'upload'
    );
    formData.append('asset_type', asset_type);

    const response = await fetch(`${BACKEND_URL}/user/status-pages/${id}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const uploadData = await response.json();
    ctx.body = { uploadData };
  },

  async removeAsset(ctx) {
    const { id } = ctx.params;
    const { asset_type } = ctx.query;
    const statusPagesData = await service({ strapi }).makeBackendRequest(
      `/user/status-pages/${id}/upload?asset_type=${asset_type}`,
      { method: 'DELETE' }
    );
    ctx.body = { statusPagesData };
  },

  async getAnnouncements(ctx) {
    const { id } = ctx.params;
    const announcementsData = await service({ strapi }).makeBackendRequest(
      `/user/status-pages/${id}/announcements`,
      { method: 'GET' }
    );
    ctx.body = { announcementsData };
  },

  async createAnnouncement(ctx) {
    const { id } = ctx.params;
    const { ...data } = ctx.request.body;
    const announcementsData = await service({ strapi }).makeBackendRequest(
      `/user/status-pages/${id}/announcements`,
      { method: 'POST', body: JSON.stringify(data) }
    );
    ctx.body = { announcementsData };
  },

  async updateAnnouncement(ctx) {
    const { id, announcementId } = ctx.params;
    const { ...data } = ctx.request.body;
    const announcementsData = await service({ strapi }).makeBackendRequest(
      `/user/status-pages/${id}/announcements/${announcementId}`,
      { method: 'PUT', body: JSON.stringify(data) }
    );
    ctx.body = { announcementsData };
  },

  async deleteAnnouncement(ctx) {
    const { id, announcementId } = ctx.params;
    const announcementsData = await service({ strapi }).makeBackendRequest(
      `/user/status-pages/${id}/announcements/${announcementId}`,
      { method: 'DELETE' }
    );
    ctx.body = { announcementsData };
  },
});

export default statusPage;
