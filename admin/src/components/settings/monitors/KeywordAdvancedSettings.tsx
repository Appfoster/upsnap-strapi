import React, { useEffect, useState } from 'react';
import { Accordion, Box, Typography, Switch, Flex } from '@strapi/design-system';
import MonitorIntervalSlider from './MonitorIntervalSlider';
import { getUserDetailsCached } from '../../../utils/userStorage';
import { PLAN_TYPES } from '../../../utils/constants';

interface KeywordAdvancedSettingsProps {
  timeout: number;
  onTimeoutChange: (timeout: number) => void;
  followRedirects: boolean;
  onFollowRedirectsChange: (followRedirects: boolean) => void;
  monitorInterval: number;
  onMonitorIntervalChange: (value: number) => void;
}

export default function KeywordAdvancedSettings({
  timeout,
  onTimeoutChange,
  followRedirects,
  onFollowRedirectsChange,
  monitorInterval,
  onMonitorIntervalChange,
}: KeywordAdvancedSettingsProps) {
  const min = 5;
  const max = 60;

  const [minMonitoringInterval, setMinMonitoringInterval] = useState(60);
  const [userPlan, setUserPlan] = useState(PLAN_TYPES.TRIAL);

  useEffect(() => {
    async function fetchUser() {
      try {
        const details = await getUserDetailsCached(true);
        const userMinMonitoringIntervalInMins = details?.plan_limits?.min_monitoring_interval;
        setMinMonitoringInterval(
          userMinMonitoringIntervalInMins ? userMinMonitoringIntervalInMins * 60 : 60
        );
        setUserPlan(details?.user?.subscription_type || PLAN_TYPES.TRIAL);
      } catch (error) {
        console.error('Failed to fetch user details in KeywordAdvancedSettings', error);
      }
    }
    fetchUser();
  }, []);

  const getPercent = (value: number) => ((value - min) / (max - min)) * 100;

  return (
    <Box width="100%">
      <Accordion.Root>
        <Accordion.Item value="keyword-advanced-settings">
          <Accordion.Header>
            <Accordion.Trigger
              caretPosition="right"
              description="Configure monitor interval and request timeout"
            >
              Advanced settings
            </Accordion.Trigger>
          </Accordion.Header>

          <Accordion.Content>
            <Flex
              paddingLeft={6}
              paddingBottom={8}
              paddingTop={4}
              direction="column"
              gap={6}
              width="100%"
              alignItems="flex-start"
            >
              {/* Monitor Interval and Request Timeout */}
              <Flex direction={{ initial: 'column', medium: 'row' }} gap={6} width="100%">
                {/* Monitor Interval */}
                <Box width={{ initial: '100%', medium: '48%' }}>
                  <MonitorIntervalSlider
                    value={monitorInterval}
                    onChange={onMonitorIntervalChange}
                    minSeconds={60}
                    maxSeconds={86400}
                    minMonitoringInterval={minMonitoringInterval}
                    userPlan={userPlan}
                  />
                </Box>

                {/* Request Timeout */}
                <Box width={{ initial: '100%', medium: '48%' }}>
                  <Typography variant="delta" fontWeight="bold">
                    Request timeout
                  </Typography>

                  <Box paddingTop={2} paddingBottom={3}>
                    <Typography variant="omega" textColor="neutral600">
                      The request timeout is <strong>{timeout} seconds</strong>.
                    </Typography>
                  </Box>

                  <input
                    type="range"
                    min={min}
                    max={max}
                    step="1"
                    value={timeout}
                    onChange={(e) => onTimeoutChange(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      height: 6,
                      borderRadius: 4,
                      appearance: 'none',
                      cursor: 'pointer',
                      background: `linear-gradient(
                        to right,
                        #4945FF 0%,
                        #4945FF ${getPercent(timeout)}%,
                        #EAEAEA ${getPercent(timeout)}%,
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
              </Flex>

              {/* Follow Redirects Switch */}
              <Box>
                <Flex alignItems="center" gap={3} marginBottom={2}>
                  <Switch
                    checked={followRedirects}
                    onCheckedChange={(checked: boolean) => onFollowRedirectsChange(checked)}
                  />
                  <Typography variant="delta" fontWeight="bold">
                    Follow redirects
                  </Typography>
                </Flex>
                <Typography variant="omega" textColor="neutral600">
                  Automatically follow HTTP redirects when checking the URL.
                </Typography>
              </Box>
            </Flex>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </Box>
  );
}
