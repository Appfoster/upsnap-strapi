export default () => ({
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/settings',
      handler: 'settings.get',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/settings',
      handler: 'settings.set',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/monitor/:id',
      handler: 'monitor.getById',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/monitor/:id/uptime-stats',
      handler: 'monitor.getMonitorUptimeStats',
      config: {
        policies: [],
        auth: false,
      }
    },
    {
      method: 'GET',
      path: '/monitor/:id/histogram',
      handler: 'monitor.getMonitorHistogram',
      config: {
        policies: [],
        auth: false,
      }
    }
  ],
});
