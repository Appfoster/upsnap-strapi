import React from 'react';
import { Box, Typography } from '@strapi/design-system';
import { PLAN_TYPES as PLAN_TYPES_CONSTANT } from '../../utils/constants';
import { PLAN_TYPES } from '../../utils/types';

const PARTITIONS = [
  { label: '1m', seconds: 60 },
  { label: '2m', seconds: 120 },
  { label: '5m', seconds: 300 },
  { label: '30m', seconds: 1800 },
  { label: '1h', seconds: 3600 },
  { label: '12h', seconds: 43200 },
  { label: '24h', seconds: 86400 },
];

const format = (s: number) => {
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  if (s < 86400) return `${Math.round(s / 3600)}h`;
  return `${Math.round(s / 86400)}d`;
};

interface MonitorIntervalSliderProps {
  value: number;
  onChange: (seconds: number) => void;

  minSeconds?: number;
  maxSeconds?: number;
  minMonitoringInterval?: number;
  userPlan?: PLAN_TYPES;
}

export default function MonitorIntervalSlider({
  value,
  onChange,
  minSeconds = 60,
  maxSeconds = 86400,
  minMonitoringInterval = 300,
  userPlan = PLAN_TYPES_CONSTANT.TRIAL,
}: MonitorIntervalSliderProps) {
  // Log-scale helpers
  const logMin = Math.log(minSeconds);
  const logMax = Math.log(maxSeconds);

  const secondsToSlider = (seconds: number) =>
    ((Math.log(seconds) - logMin) / (logMax - logMin)) * 100;

  const sliderToSeconds = (percent: number) =>
    Math.round(Math.exp(logMin + (percent / 100) * (logMax - logMin)));

  // Enforce plan limit
  const effectiveValue =
    userPlan === PLAN_TYPES_CONSTANT.TRIAL && value < minMonitoringInterval
      ? minMonitoringInterval
      : value;

  const sliderPercent = secondsToSlider(effectiveValue);

  return (
    <Box width="100%">
      <Typography variant="pi" fontWeight="bold">
        Monitor interval
      </Typography>

      <Box paddingTop={2} paddingBottom={3}>
        <Typography variant="omega" textColor="neutral600">
          Your monitor will be checked every <strong>{format(effectiveValue)}</strong>.
        </Typography>
      </Box>

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={sliderPercent}
        onChange={(e) => {
          let secs = sliderToSeconds(Number(e.target.value));
          if (secs < minMonitoringInterval) {
            secs = minMonitoringInterval;
          }
          onChange(secs);
        }}
        style={{
          width: '100%',
          height: 6,
          borderRadius: 4,
          appearance: 'none',
          cursor: 'pointer',
          background: `linear-gradient(
            to right,
            #4945FF 0%,
            #4945FF ${sliderPercent}%,
            #EAEAEA ${sliderPercent}%,
            #EAEAEA 100%
          )`,
        }}
      />

      {/* Labels */}
      <Box position="relative" paddingTop={2} height={24}>
        {PARTITIONS.map((p) => {
          const pos = secondsToSlider(p.seconds);
          const disabled = p.seconds < minMonitoringInterval;

          return (
            <Box
              key={p.seconds}
              position="absolute"
              style={{
                left: `${pos}%`,
                transform: 'translateX(-50%)',
                fontSize: 11,
                color: disabled ? '#C0C0CF' : '#666687',
                cursor: disabled ? 'not-allowed' : 'default',
              }}
              width={'5%'}
            >
              {p.label}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
