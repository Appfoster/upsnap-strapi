import crypto from 'crypto';
import type { Core } from '@strapi/strapi';
import { UpsnapSettings } from '../types';
import { BACKEND_URL, IP_API_BASE_URL } from '../utils/constants';
import packageJson from '../../../package.json';

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
  async trackInstallation(userPayload?: any) {
    try {
      const settings = (await this.settingsStore.get()) as UpsnapSettings | null;

      if (!userPayload && settings?.installationTracked) {
        return;
      }

      const pluginVersion = packageJson.version;
      const strapiVersion = strapi.config.get('info.strapi');
      const siteUrl =
        strapi.config.get('server.url') ||
        `http://${strapi.config.get('server.host') || 'localhost'}:${strapi.config.get('server.port') || 1337}`;
      const users = await strapi.db.query('admin::user').findMany({
        orderBy: { createdAt: 'ASC' },
        limit: 1,
      });
      const firstUser = users?.[0];
      const email = firstUser?.email || '';
      const name = `${firstUser?.firstname || ''} ${firstUser?.lastname || ''}`.trim();
      const phoneNumber = firstUser?.phoneNumber || firstUser?.phone || '';
      const company = firstUser?.company || '';
      const installId = settings?.installId || crypto.randomUUID();

      let finalDetails: any = {
        version: pluginVersion,
        site_url: siteUrl,
        strapi_version: strapiVersion,
        install_id: installId,
        email,
        name,
        phone_number: phoneNumber,
        company,
      };

      if (userPayload) {
        finalDetails = { ...finalDetails, ...userPayload };
      } else {
        let ipAddress = '';
        let country = '';
        let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        let browserOs = `Node.js ${process.version} / ${process.platform}`;

        try {
          const ipRes = await fetch(`${IP_API_BASE_URL}/json/`);
          if (ipRes.ok) {
            const ipData: any = await ipRes.json();
            ipAddress = ipData.ip || '';
            country = ipData.country_name || ipData.country || '';
            if (ipData.timezone) timezone = ipData.timezone;
          }
        } catch (e) {
          // ignore
        }

        finalDetails = {
          ...finalDetails,
          ip_address: ipAddress,
          country,
          browser_os: browserOs,
          timezone,
        };
      }

      const response: any = await this.makeBackendRequest(
        '/installation-data',
        {
          method: 'POST',
          body: JSON.stringify({
            platform: 'strapi',
            details: finalDetails,
          }),
        },
        true
      );

      if (response?.status === 'success' && !settings?.installationTracked) {
        await this.settingsStore.set({
          value: {
            ...(settings || {}),
            installId: installId,
            installationTracked: true,
          },
        });
      }
    } catch (error) {
      console.log('UpSnap: Failed to track installation data ', error);
    }
  },
});

export default service;
