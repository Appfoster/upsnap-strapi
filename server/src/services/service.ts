import type { Core } from '@strapi/strapi';
import { UpsnapSettings } from '../types';
import { BACKEND_URL } from '../utils/constants';

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  getWelcomeMessage() {
    return 'Welcome to Strapi 🚀';
  },
  settingsStore: strapi.store({
    type: 'plugin',
    name: 'upsnap',
    key: 'settings',
  }),
  async getToken() {
    const settings = (await this.settingsStore.get()) as UpsnapSettings;
    return settings?.token || null;
  },
  async makeBackendRequest(
    endpoint: string,
    options: RequestInit,
    forValidation: boolean = false,
    sessionToken: string = ''
  ) {
    const token = await this.getToken();
    if (!token && !forValidation) {
      return { error: 'No token found in settings' };
    }

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${sessionToken || token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const contentType = response.headers.get('content-type') || '';

    // Handle JSON
    if (contentType.includes('application/json')) {

      return await response.json();
    }

    // Handle CSV
    if (contentType.includes('text/csv')) {
      return {
        type: 'csv',
        data: await response.text(),
        headers: response.headers,
      };
    }

    // Handle binary (Excel, PDF, etc.)
    return {
      type: 'blob',
      data: await response.arrayBuffer(),
      headers: response.headers,
    };
  },
});

export default service;
