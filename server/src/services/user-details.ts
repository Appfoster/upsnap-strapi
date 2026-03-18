import type { Core } from '@strapi/strapi';
import service from './service';

const userDetailsService = ({ strapi }: { strapi: Core.Strapi }) => ({
  async createUserApiToken(sessionToken: string) {
    const apiTokens: any = await service({ strapi }).makeBackendRequest(
      `/tokens/generate`,
      {
        method: 'POST',
        body: JSON.stringify({
            name: "For Strapi",
            description: "Token for strapi plugin",
            expires: 0
        })
      },
      true,
      sessionToken
    );
 
    if (apiTokens?.data?.tokens) {
      const token = apiTokens?.data?.tokens?.filter(
        (token: any) => token?.token_hash !== null
      )?.token_hash;
      return token;
    }
    return null;
  },
  async getUserApiToken(sessionToken: string) {
    const apiTokens: any = await service({ strapi }).makeBackendRequest(
      `/tokens`,
      {
        method: 'GET',
      },
      true,
      sessionToken
    );

    const tokens = apiTokens?.data?.tokens || [];
    let apiToken = '';
    if (apiTokens?.status === 'success' && tokens.length === 0 ) {
        apiToken = await this.createUserApiToken(sessionToken);
    } else if (tokens.length > 0) {
      apiToken = tokens?.[0]?.token_hash;

      return apiToken;
    }
    return null;
  },
  async createInitialMonitor(site_url: string, apiToken: string) {
    try {

      const payload = {
        name: 'Initial site',
        service_type: 'website',
        is_enabled: true,
        channel_ids: [],
        tag_ids: [],
        regions: [
          {
            id: 'default',
            is_primary: true,
            name: 'Default (Server Region)',
          },
        ],
        config: {
          meta: {
            follow_redirects: true,
            timeout: 5,
            url: site_url,
          },
          services: {
            broken_links: {
              enabled: true,
              monitor_interval: 86400,
            },
            domain: {
              enabled: true,
              monitor_interval: 86400,
              notify_days_before_expiry: 7,
            },
            lighthouse: {
              enabled: true,
              strategy: 'desktop',
              monitor_interval: 604800,
            },
            mixed_content: {
              enabled: true,
              monitor_interval: 86400,
            },
            ssl: {
              enabled: true,
              monitor_interval: 86400,
              notify_days_before_expiry: 7,
            },
            uptime: {
              enabled: true,
              monitor_interval: 300,
            },
          },
        },
      };
      const monitorsData: any = await service({ strapi }).makeBackendRequest(`/user/monitors`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }, true, apiToken);

      if (monitorsData?.status === "success") {
        const monitorId = monitorsData?.data?.monitor?.id;
        return monitorId;
      }
      return null;
    } catch (err) {
      console.log('Error creating initial monitor ', err);
      return null;
    }
  },
});

export default userDetailsService;
