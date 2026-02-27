import React, { useEffect, useState } from 'react';
import { Accordion, Box, Typography, Switch, Flex } from '@strapi/design-system';

import HealthcheckServiceBlock from './HealthcheckSettingsBlock';
import { getUserDetailsCached } from '../../utils/userStorage';
import { PLAN_TYPES } from '../../utils/constants';

interface AdvancedSettingsProps {
  services: any;
  onServiceChange: (key: string, value: any) => void;
  meta: any;
  updateMeta: (key: string, value: any) => void;
}

export default function AdvancedSettings({
  services,
  onServiceChange,
  meta,
  updateMeta,
}: AdvancedSettingsProps) {
  const isHttps = String(meta?.url || '').startsWith('https://');

  const [minMonitoringInterval, setMinMonitoringInterval] = useState(300);
  const [userPlan, setUserPlan] = useState(PLAN_TYPES.TRIAL);

  useEffect(() => {
    async function fetchUser() {
      try {
        const details = await getUserDetailsCached(true);

        const minIntervalMins = details?.plan_limits?.min_monitoring_interval;

        setMinMonitoringInterval(minIntervalMins ? minIntervalMins * 60 : 300);

        setUserPlan(details?.user?.subscription_type || PLAN_TYPES.TRIAL);
      } catch (error) {
        console.error('Failed to fetch user details', error);
      }
    }

    fetchUser();
  }, []);

  const getPercent = (value: number) => ((value - 6) / 55) * 100;

  return (
    <Box width="100%">
      <Accordion.Root>
        <Accordion.Item value="advanced-settings">
          <Accordion.Header>
            <Accordion.Trigger
              caretPosition="right"
              description="Configure timeouts and health checks"
            >
              Advanced settings
            </Accordion.Trigger>
          </Accordion.Header>

          <Accordion.Content>
            <Flex padding={4} direction="column" gap={6} width="100%" alignItems="flex-start">
              {/* Request timeout */}
              <Box maxWidth="60%">
                <Typography variant="beta" fontWeight="bold">
                  Request timeout
                </Typography>

                <Box paddingTop={2} paddingBottom={3}>
                  <Typography variant="omega" textColor="neutral600">
                    The request timeout is <strong>{meta.timeout} seconds</strong>. The shorter the
                    timeout, the earlier we mark the website as down.
                  </Typography>
                </Box>

                <input
                  type="range"
                  min={5}
                  max={60}
                  step={1}
                  value={meta.timeout}
                  onChange={(e) => updateMeta('timeout', Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: 6,
                    borderRadius: 4,
                    appearance: 'none',
                    cursor: 'pointer',
                    background: `linear-gradient(
                    to right,
                    #4945FF 0%,
                    #4945FF ${getPercent(meta.timeout)}%,
                    #EAEAEA ${getPercent(meta.timeout)}%,
                    #EAEAEA 100%
                  )`,
                  }}
                />

                <Box position="relative" paddingTop={3} height={20}>
                  {[5, 15, 30, 45, 60].map((value) => (
                    <Box
                      key={value}
                      position="absolute"
                      style={{
                        left: `${getPercent(value)}%`,
                        transform: 'translateX(-50%)',
                        fontSize: 10,
                        color: '#666687',
                      }}
                    >
                      {value}s
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Follow redirects */}
              <Box>
                <Flex alignItems="center" gap={3}>
                  <Switch
                    checked={meta.follow_redirects}
                    onCheckedChange={(checked: any) => {
                      updateMeta('follow_redirects', checked);
                    }}
                  />
                  <Typography variant="beta" fontWeight="bold">
                    Follow redirection
                  </Typography>
                </Flex>

                <Box paddingTop={1}>
                  <Typography variant="omega" textColor="neutral600">
                    If disabled, we return redirection HTTP codes (3xx).
                  </Typography>
                </Box>
              </Box>

              {/* Healthcheck settings */}
              <Box width="100%">
                <Typography variant="alpha" fontWeight="bold">
                  Healthcheck settings
                </Typography>

                <Box paddingTop={4}>
                  <Flex gap={6} wrap="wrap" direction={{ initial: 'column', medium: 'row' }}>
                    <Box width={{ initial: '100%', medium: '48%' }}>
                      <HealthcheckServiceBlock
                        label="Reachability (Uptime)"
                        serviceKey="uptime"
                        data={services.uptime}
                        onChange={onServiceChange}
                        isHttps={isHttps}
                        minMonitoringInterval={minMonitoringInterval}
                        userPlan={userPlan}
                      />
                    </Box>

                    <Box width={{ initial: '100%', medium: '48%' }}>
                      <HealthcheckServiceBlock
                        label="Broken links"
                        serviceKey="broken_links"
                        data={services.broken_links}
                        onChange={onServiceChange}
                        isHttps={isHttps}
                        minMonitoringInterval={minMonitoringInterval}
                        userPlan={userPlan}
                      />
                    </Box>

                    <Box width={{ initial: '100%', medium: '48%' }}>
                      <HealthcheckServiceBlock
                        label="Mixed content"
                        serviceKey="mixed_content"
                        data={services.mixed_content}
                        onChange={onServiceChange}
                        isHttps={isHttps}
                        minMonitoringInterval={minMonitoringInterval}
                        userPlan={userPlan}
                      />
                    </Box>

                    <Box width={{ initial: '100%', medium: '48%' }}>
                      <HealthcheckServiceBlock
                        label="SSL"
                        serviceKey="ssl"
                        data={services.ssl}
                        onChange={onServiceChange}
                        showExpiry
                        isHttps={isHttps}
                        minMonitoringInterval={minMonitoringInterval}
                        userPlan={userPlan}
                      />
                    </Box>

                    <Box width={{ initial: '100%', medium: '48%' }}>
                      <HealthcheckServiceBlock
                        label="Domain check"
                        serviceKey="domain"
                        data={services.domain}
                        onChange={onServiceChange}
                        showExpiry
                        isHttps={isHttps}
                        minMonitoringInterval={minMonitoringInterval}
                        userPlan={userPlan}
                      />
                    </Box>

                    <Box width={{ initial: '100%', medium: '48%' }}>
                      <HealthcheckServiceBlock
                        label="Lighthouse"
                        serviceKey="lighthouse"
                        data={services.lighthouse}
                        onChange={onServiceChange}
                        showStrategy
                        isHttps={isHttps}
                        minMonitoringInterval={minMonitoringInterval}
                        userPlan={userPlan}
                      />
                    </Box>
                  </Flex>
                </Box>
              </Box>
            </Flex>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </Box>
  );
}
