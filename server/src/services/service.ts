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
    const settings = await this.settingsStore.get() as UpsnapSettings;
    return settings?.token || null;
  },
  async makeBackendRequest(endpoint: string, options: RequestInit) {
    const token = await this.getToken();
    if (!token) {
      throw new Error('No token found in settings');
    }
    
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    return response.json();
  },
});

export default service;
