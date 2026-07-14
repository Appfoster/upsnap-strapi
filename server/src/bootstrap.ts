import type { Core } from '@strapi/strapi';

import service from './services/service';

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  // bootstrap phase
  // await service({ strapi }).trackInstallation();

  strapi.cron.add({
    'upsnap-revalidate-token': {
      task: async () => {
        await service({ strapi }).getTokenStatus(true);
      },
      options: {
        rule: '0 * * * *',
      },
    },
  });
};

export default bootstrap;
