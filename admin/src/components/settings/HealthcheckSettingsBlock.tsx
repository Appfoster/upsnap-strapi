import React from 'react';
import {
  Accordion,
  Typography,
  Switch,
  SingleSelect,
  SingleSelectOption,
  Box,
  Card,
  CardHeader,
  CardContent,
  CardBody,
  Flex,
} from '@strapi/design-system';

import MonitorIntervalSlider from './MonitorIntervalSlider';
import IntervalSlider from './IntervalSlider';
import { MONITOR, PLAN_TYPES as PLAN_TYPES_CONSTANT } from '../../utils/constants';
import { IntervalPartition, PLAN_TYPES } from '../../utils/types';
import { toast } from 'react-toastify';
import { INTERVALS, EXPIRY_OPTIONS } from '../../utils/constants';


export default function HealthcheckServiceBlock({
  label,
  serviceKey,
  data,
  onChange,
  showExpiry = false,
  showStrategy = false,
  isHttps = true,
  minMonitoringInterval = 300,
  userPlan = PLAN_TYPES_CONSTANT.TRIAL,
}: {
  label: string;
  serviceKey: string;
  data: any;
  onChange: (serviceKey: string, patch: any) => void;
  showExpiry?: boolean;
  showStrategy?: boolean;
  isHttps?: boolean;
  minMonitoringInterval?: number;
  userPlan?: PLAN_TYPES;
}) {
  const update = (patch: any) => {
    onChange(serviceKey, { ...data, ...patch });
  };

  const restrictedWhenNotHttps = ['lighthouse', 'ssl', 'mixed_content'].includes(serviceKey);

  return (
    <Card shadow="tableShadow" padding={0} background="neutral0">
      <CardHeader padding={4}>
        {/* SINGLE CHILD — REQUIRED */}
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Flex alignItems="center" gap={4} justifyContent="space-between" width="100%">
            <Typography fontWeight="bold">{label}</Typography>

            <Switch
              checked={!isHttps && restrictedWhenNotHttps ? false : data.enabled}
              onCheckedChange={(checked: boolean) => {
                if (!isHttps && restrictedWhenNotHttps && checked) {
                  toast.error('This check requires HTTPS. Please use an https:// URL.');
                  return;
                }

                update({ enabled: checked });
              }}
            />
          </Flex>
        </Box>
      </CardHeader>

      <CardBody>
        <CardContent width="100%">
          <Box
            padding={4}
            opacity={data.enabled ? 1 : 0.5}
            pointerEvents={data.enabled ? 'auto' : 'none'}
          >
            <Flex gap={7} direction="column" width="100%" alignItems="stretch">
              {/* Monitoring Interval */}
              {serviceKey === 'lighthouse' ? (
                <IntervalSlider
                  value={data.monitor_interval}
                  onChange={(v) => update({ monitor_interval: v })}
                  partitions={INTERVALS}
                  minAllowedSeconds={MONITOR.LIGHTHOUSE_MIN_INTERVAL_SECONDS}
                />
              ) : (
                <MonitorIntervalSlider
                  value={data.monitor_interval}
                  onChange={(v) => update({ monitor_interval: v })}
                  minMonitoringInterval={minMonitoringInterval}
                  userPlan={userPlan}
                />
              )}

              {/* Expiry */}
              {showExpiry && (
                <SingleSelect
                  value={String(data.notify_days_before_expiry)}
                  onChange={(v: any) =>
                    update({
                      notify_days_before_expiry: Number(v),
                    })
                  }
                >
                  {EXPIRY_OPTIONS.map((o) => (
                    <SingleSelectOption key={o.value} value={String(o.value)}>
                      {o.label}
                    </SingleSelectOption>
                  ))}
                </SingleSelect>
              )}

              {/* Lighthouse Strategy */}
              {showStrategy && (
                <SingleSelect
                  value={data.strategy}
                  onChange={(v: string) => update({ strategy: v })}
                >
                  <SingleSelectOption value="mobile">Mobile</SingleSelectOption>
                  <SingleSelectOption value="desktop">Desktop</SingleSelectOption>
                </SingleSelect>
              )}
            </Flex>
          </Box>
        </CardContent>
      </CardBody>
    </Card>
  );
}
