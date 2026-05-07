import type { Core } from '@strapi/strapi';

import service from './services/service';

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  // bootstrap phase
  await service({ strapi }).trackInstallation();
};

export default bootstrap;
