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
      path: '/monitor',
      handler: 'monitor.get',
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
      },
    },
    {
      method: 'GET',
      path: '/monitor/:id/histogram',
      handler: 'monitor.getMonitorHistogram',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/monitor/health-check',
      handler: 'monitor.getHealthChecks',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/monitor/health-check/uptime',
      handler: 'monitor.getUptimeHealthCheck',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/monitor/health-check/ssl',
      handler: 'monitor.getSslHealthCheck',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/monitor/health-check/domain',
      handler: 'monitor.getDomainHealthCheck',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/monitor/health-check/lighthouse',
      handler: 'monitor.getLighthouseHealthCheck',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/monitor/health-check/broken-links',
      handler: 'monitor.getBrokenLinksHealthCheck',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/monitor/health-check/mixed-content',
      handler: 'monitor.getMixedContentHealthCheck',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/monitor/:id/response-time',
      handler: 'monitor.getMonitorResponseTime',
      config: {
        policies: [],
        auth: false,
      }
    },
    {
      method: 'GET',
      path: '/monitor/:id/incidents',
      handler: 'monitor.getMonitorIncidents',
      config: {
        policies: [],
        auth: false,
      }
    },
    {
      method: 'GET',
      path: '/status-pages',
      handler: 'statusPage.getStatusPages',
      config: {
        policies: [],
        auth: false,
      }
    },
    {
      method: 'GET',
      path: '/status-pages/:id',
      handler: 'statusPage.getStatusPagesByID',
      config: {
        policies: [],
        auth: false,
      }
    },
    {
      method: 'POST',
      path: '/status-pages',
      handler: 'statusPage.saveStatusPages',
      config: {
        policies: [],
        auth: false,
      }
    },
    {
      method: 'PUT',
      path: '/status-pages',
      handler: 'statusPage.updateStatusPages',
      config: {
        policies: [],
        auth: false,
      }
    },
    {
      method: 'POST',
      path: '/status-pages/reset',
      handler: 'statusPage.resetLink',
      config: {
        policies: [],
        auth: false,
      }
    },
    {
      method: 'DELETE',
      path: '/status-pages/:id',
      handler: 'statusPage.deleteStatusPages',
      config: {
        policies: [],
        auth: false,
      }
    }
  ],
});
