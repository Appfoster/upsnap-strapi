/// <reference path="./images.d.ts" />
import { getTranslation } from './utils/getTranslation';
import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';
import { ChartCircle } from '@strapi/icons';

export default {
  register(app: any) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: PLUGIN_ID.slice(0, 1).toUpperCase() + PLUGIN_ID.slice(1),
      },
      Component: async () => {
        const { App } = await import('./pages/App');

        return App;
      },
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });

    app.widgets.register({
      icon: ChartCircle,
      title: {
        id: getTranslation('widget.monitor-status.title'),
        defaultMessage: 'Monitor status',
      },
      component: async () => {
        const { MonitorStatusWidget } = await import('./components/widgets/MonitorStatusWidget');

        return MonitorStatusWidget;
      },
      pluginId: PLUGIN_ID,
      id: 'monitor-status',
      link: {
        label: {
          id: getTranslation('widget.monitor-status.link'),
          defaultMessage: 'View all monitors',
        },
        href: `/plugins/${PLUGIN_ID}/monitors`,
      },
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
