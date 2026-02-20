import React, { useMemo, useState, useEffect, useCallback } from 'react';
import Chart from 'react-apexcharts';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  CardContent,
  Typography,
  SingleSelect,
  SingleSelectOption,
  Flex,
} from '@strapi/design-system';
import { MonitorData, ResponseTimeData, RegionResponseTimeData } from '../../utils/types';
import { colors, timeRanges } from '../../utils/constants';

interface ResponseTimeChartProps {
  monitor: MonitorData['monitor'] | undefined;
  regionResponseTimeData: Record<string, RegionResponseTimeData>;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}



const formatTime = (ms: number) => {
  if (!ms) return 'N/A';
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${ms.toFixed(2)} ms`;
};

export const ResponseTimeChart = ({
  monitor,
  regionResponseTimeData,
  timeRange,
  onTimeRangeChange,
}: ResponseTimeChartProps) => {
  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(new Set());

  const regionNames = useMemo(() => {
    const names: Record<string, string> = {};
    if (monitor?.regions && Array.isArray(monitor.regions)) {
      monitor.regions.forEach((region) => {
        names[region.id] = region.name;
      });
    }
    return names;
  }, [monitor?.regions]);

  useEffect(() => {
    setVisibleSeries(new Set(Object.keys(regionResponseTimeData)));
  }, [regionResponseTimeData]);

  function downsample(data: any[], maxPoints = 1000) {
    if (!data || data.length <= maxPoints) return data;
    const step = Math.ceil(data.length / maxPoints);
    return data.filter((_, idx) => idx % step === 0);
  }

  const series = useMemo(
    () =>
      Object.entries(regionResponseTimeData).map(([regionId, data]) => ({
        name: regionNames[regionId] || regionId,
        data:
          downsample(data?.chart_data || []).map((item) => ({
            x: item.timestamp * 1000,
            y: item.response_time,
          })) || [],
      })),
    [regionResponseTimeData, regionNames]
  );

  const stats = useMemo(() => {
    if (visibleSeries.size === 0 || Object.keys(regionResponseTimeData).length === 0) {
      return { avg: 0, max: 0, min: 0 };
    }
    let totalAvg = 0;
    let maxVal = 0;
    let minVal = Infinity;
    let count = 0;
    Object.entries(regionResponseTimeData).forEach(([regionId, data]) => {
      if (visibleSeries.has(regionId) && data) {
        totalAvg += data.avg_response_time || 0;
        maxVal = Math.max(maxVal, data.max_response_time || 0);
        minVal = Math.min(minVal, data.min_response_time || Infinity);
        count++;
      }
    });
    return {
      avg: count > 0 ? totalAvg / count : 0,
      max: maxVal,
      min: minVal === Infinity ? 0 : minVal,
    };
  }, [regionResponseTimeData, visibleSeries]);

  const handleLegendClick = useCallback(
    (seriesName: string, seriesIndex: number) => {
      const regionId = Object.keys(regionResponseTimeData)[seriesIndex];
      setVisibleSeries((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(regionId)) {
          newSet.delete(regionId);
        } else {
          newSet.add(regionId);
        }
        return newSet;
      });
    },
    [regionResponseTimeData]
  );

  const chartOptions = {
    chart: {
      height: 350,
      type: 'area',
      zoom: { enabled: false },
      toolbar: { show: false },
      events: {
        legendClick: function (chartContext: any, seriesIndex: number, config: any) {
          const seriesName = config.config.series[seriesIndex].name;
          handleLegendClick(seriesName, seriesIndex);
        },
      },
    },
    colors: colors.slice(0, series.length),
    dataLabels: { enabled: false },
    legend: {
      show: true,
      onItemClick: { toggleDataSeries: true },
      position: 'top' as const,
    },
    markers: { size: 0, strokeWidth: 0, strokeColors: 'transparent' },
    stroke: { curve: 'smooth' as const, width: 2 },
    grid: { show: false },
    tooltip: {
      theme: 'dark' as const,
      shared: true,
      intersect: false,
      x: {
        formatter: (val: number) => new Date(val).toLocaleString(),
      },
      y: {
        formatter: (value: number) => `${value} ms`,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#9ca2b7',
          fontSize: '13px',
          fontFamily: 'inherit',
          fontWeight: 300,
        },
        formatter: (val: number) => `${val}ms`,
      },
    },
    xaxis: {
      type: 'datetime' as const,
      axisTicks: { show: false },
      axisBorder: { show: false },
      labels: { show: false },
    },
    fill: {
      type: 'gradient' as const,
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
  };

  return (
    <Box width="100%">
      <Card>
        <CardHeader display="flex" style={{ justifyContent: 'space-between' }}>
          <Typography variant="delta" marginLeft={2} padding={3}>
            Response Time
          </Typography>
          <Box padding={3} style={{ minWidth: 200 }}>
            <SingleSelect
              value={timeRange}
              onChange={onTimeRangeChange}
              label="Time Range"
              disabled={monitor?.is_enabled === false}
            >
              {timeRanges.map((tr) => (
                <SingleSelectOption key={tr.value} value={tr.value}>
                  {tr.label}
                </SingleSelectOption>
              ))}
            </SingleSelect>
          </Box>
        </CardHeader>
        <CardBody>
          <CardContent width="100%">
            {monitor?.is_enabled === false ? (
              <Box padding={4} background="neutral100">
                <Typography variant="omega" textColor="neutral600">
                  Monitoring is Paused. Enable monitoring to see response time results.
                </Typography>
              </Box>
            ) : visibleSeries.size === 0 ? (
              <Box padding={4} background="neutral100">
                <Typography variant="omega" textColor="neutral600">
                  No regions selected. Please select at least one region to view response time
                  results.
                </Typography>
              </Box>
            ) : (
              <Chart type="area" height={350} series={series} options={chartOptions as any} />
            )}
            <Flex
              marginTop={6}
              alignItems={{ initial: 'stretch', medium: 'start' }}
              gap={3}
              direction={{ initial: 'column', medium: 'row' }}
              marginBottom={4}
            >
              <Box
                display="flex"
                style={{ flexDirection: 'column', alignItems: 'center' }}
                background="neutral0"
                padding={4}
                borderColor={'alternative200'}
                borderRadius={2}
                hasRadius
              >
                <Typography fontWeight="bold">{formatTime(stats.avg)}</Typography>
                <Typography textColor="neutral600">Avg. response time</Typography>
              </Box>
              <Box
                display="flex"
                style={{ flexDirection: 'column', alignItems: 'center' }}
                background="neutral0"
                padding={4}
                borderColor={'alternative200'}
                borderRadius={2}
                hasRadius
              >
                <Typography fontWeight="bold">{formatTime(stats.max)}</Typography>
                <Typography textColor="neutral600">Max. response time</Typography>
              </Box>
              <Box
                display="flex"
                style={{ flexDirection: 'column', alignItems: 'center' }}
                background="neutral0"
                padding={4}
                borderColor={'alternative200'}
                borderRadius={2}
                hasRadius
              >
                <Typography fontWeight="bold">{formatTime(stats.min)}</Typography>
                <Typography textColor="neutral600">Min. response time</Typography>
              </Box>
            </Flex>
          </CardContent>
        </CardBody>
      </Card>
    </Box>
  );
};
