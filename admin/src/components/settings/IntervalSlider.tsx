import React, { useMemo } from 'react';
import { Box, Typography } from '@strapi/design-system';
import { IntervalPartition, IntervalUnit } from '../../utils/types';

interface IntervalSliderProps {
  value: number; // seconds
  onChange: (seconds: number) => void;

  partitions: IntervalPartition[];
  minAllowedSeconds: number;

  minSeconds?: number;
  maxSeconds?: number;
}

export default function IntervalSlider({
  value,
  onChange,
  partitions,
  minAllowedSeconds,
  minSeconds,
  maxSeconds,
}: IntervalSliderProps) {
  const formatSeconds = (s: number) => {
    if (s < 3600) return `${Math.round(s / 60)}m`;
    if (s < 86400) return `${Math.round(s / 3600)}h`;
    return `${Math.round(s / 86400)}d`;
  };

  const toSeconds = (value: number, unit: IntervalUnit) => {
    switch (unit) {
      case 'minute':
        return value * 60;
      case 'hour':
        return value * 3600;
      case 'day':
        return value * 86400;
    }
  };

  // Normalize partitions once
  const normalizedPartitions = useMemo(
    () =>
      partitions.map((p) => ({
        ...p,
        seconds: toSeconds(p.value, p.unit),
      })),
    [partitions]
  );

  const effectiveMin = minSeconds ?? Math.min(...normalizedPartitions.map((p) => p.seconds));
  const effectiveMax = maxSeconds ?? Math.max(...normalizedPartitions.map((p) => p.seconds));

  // Log scale helpers
  const logMin = Math.log(effectiveMin);
  const logMax = Math.log(effectiveMax);

  const secondsToSlider = (seconds: number) =>
    ((Math.log(seconds) - logMin) / (logMax - logMin)) * 100;

  const sliderToSeconds = (percent: number) =>
    Math.round(Math.exp(logMin + (percent / 100) * (logMax - logMin)));

  const safeValue = Math.max(value, minAllowedSeconds);
  const sliderPercent = secondsToSlider(safeValue);

  return (
    <Box width="100%">
      <Typography variant="pi" fontWeight="bold">
        Monitor interval
      </Typography>

      <Box paddingTop={2} paddingBottom={3}>
        <Typography variant="omega" textColor="neutral600">
          Your monitor will be checked every <strong>{formatSeconds(safeValue)}</strong>.
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
          if (secs < minAllowedSeconds) secs = minAllowedSeconds;
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
        {normalizedPartitions.map((p) => {
          const pos = secondsToSlider(p.seconds);
          const disabled = p.seconds < minAllowedSeconds;

          return (
            <Box
              key={p.label}
              position="absolute"
              style={{
                left: `${pos}%`,
                transform: 'translateX(-50%)',
                fontSize: 11,
                color: disabled ? '#C0C0CF' : '#666687',
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
