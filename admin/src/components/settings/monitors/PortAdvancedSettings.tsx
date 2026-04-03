import React, { useEffect, useState } from 'react';
import { Accordion, Box, Typography, Flex } from '@strapi/design-system';
import MonitorIntervalSlider from './MonitorIntervalSlider';
import { getUserDetailsCached } from '../../../utils/userStorage';
import { PLAN_TYPES } from '../../../utils/constants';

interface PortAdvancedSettingsProps {
  timeout: number;
  onTimeoutChange: (value: number) => void;
  monitorInterval: number;
  onMonitorIntervalChange: (value: number) => void;
}

export default function PortAdvancedSettings({
  timeout,
  onTimeoutChange,
  monitorInterval,
  onMonitorIntervalChange,
}: PortAdvancedSettingsProps) {
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
        console.error('Failed to fetch user details in PortAdvancedSettings', error);
      }
    }
    fetchUser();
  }, []);

  const getPercent = (value: number) => ((value - min) / (max - min)) * 100;

  return (
    <Box width="100%">
      <Accordion.Root>
        <Accordion.Item value="port-advanced-settings">
          <Accordion.Header>
            <Accordion.Trigger
              caretPosition="right"
              description="Configure monitor interval and connection timeout"
            >
              Advanced settings
            </Accordion.Trigger>
          </Accordion.Header>

          <Accordion.Content>
            <Flex
              paddingLeft={6}
              paddingTop={4}
              paddingBottom={8}
              direction="column"
              gap={6}
              width="100%"
              alignItems="flex-start"
            >
              {/* Monitor Interval and Connection Timeout */}
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

                {/* Connection timeout */}
                <Box width={{ initial: '100%', medium: '48%' }}>
                  <Typography variant="beta" fontWeight="bold">
                    Connection timeout
                  </Typography>

                  <Box paddingTop={2} paddingBottom={3}>
                    <Typography variant="omega" textColor="neutral600">
                      The connection timeout is <strong>{timeout} seconds</strong>.
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
            </Flex>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </Box>
  );
}
