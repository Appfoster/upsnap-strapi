import styled from 'styled-components';
import {
  Box,
  Tooltip,
} from '@strapi/design-system';
import { useState, useEffect } from 'react';
import { Histogram } from '../utils/types';

interface HistogramChartProps {
    data: Histogram['data'];
    isLoading: boolean;
}
const HistogramContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const HistogramPill = styled.div`
  cursor: pointer;
  height: 24px;
  width: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  background-color: ${(props) => props.color};
  
  &:hover {
    transform: scaleY(1.1);
    filter: brightness(1.2);
  }
`;

const TooltipBox = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const getColorByUptime = (uptime: number | null | undefined) => {
  if (uptime === null || uptime === undefined) return '#D1D5DB'; // grey - no data
  if (uptime === 1) return '#10B981'; // green - fully up
  if (uptime === 0) return '#EF4444'; // red - fully down
  return '#F59E0B'; // orange - partial (0 < uptime < 1)
};

const formatUptimePercentage = (uptime: number | null | undefined) => {
  if (uptime === null || uptime === undefined) return 0;
  return Math.round(uptime * 100);
};


export function HistogramChart({ data, isLoading }: HistogramChartProps) {
  const LOADING_PILLS = 24;
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    if (!data || data.length === 0) {
      setActiveIndex(0);
      intervalId = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % LOADING_PILLS);
      }, 200);
    } else {
      setActiveIndex(-1);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <HistogramContainer>
        {Array.from({ length: LOADING_PILLS }).map((_, i) => (
          <Tooltip
            key={i}
            label="Loading..."
            position="top"
          >
            <HistogramPill
              color={activeIndex === i ? '#10B981' : '#E5E7EB'}
              style={{
                border: activeIndex === i ? 'none' : '1px solid #D1D5DB',
              }}
            />
          </Tooltip>
        ))}
      </HistogramContainer>
    );
  }

  return (
    <HistogramContainer>
      {data.map((bucket, i) => {
        const date = new Date(bucket.timestamp * 1000);
        const formatDateStr = date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });

        let tooltipLabel = '';

        if (bucket.uptime === null || bucket.uptime === undefined) {
          tooltipLabel = `${formatDateStr}\n, No data`;
        } else if (bucket.uptime === 0) {
          tooltipLabel = `${formatDateStr}\n, Down 0%`;
        } else {
          tooltipLabel = `${formatDateStr}\n, Up ${formatUptimePercentage(bucket.uptime)}%`;
        }

        return (
          <Tooltip
            key={i}
            label={tooltipLabel}
            position="top"
          >
            <HistogramPill color={getColorByUptime(bucket.uptime)} />
          </Tooltip>
        );
      })}
    </HistogramContainer>
  );
}