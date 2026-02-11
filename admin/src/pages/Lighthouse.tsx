import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  CardContent,
  Typography,
  Divider,
  Button,
  SingleSelect,
  SingleSelectOption,
  Grid,
  Main,
  Flex,
} from '@strapi/design-system';
import { useParams } from 'react-router-dom';
import StatusCard from '../components/reachability/StatusCard';
import CircleProgress from '../components/lighthouse/CircleProgress';
import MetricRow from '../components/lighthouse/MetricRow';
import LoadingCard from '../components/reachability/LoadingCard';
import { request } from '../utils/helpers';
import { LighthouseCheckData, MonitorData } from '../utils/types';
import PageHeader from '../components/PageHeader';

export default function Lighthouse() {
  const monitorId = '51c21876-208d-4920-8407-310b25d1f8e6'; // useParams<{ monitorId: string }>();
  const [data, setData] = useState<LighthouseCheckData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState<MonitorData | null>(null);
  const [strategy, setStrategy] = useState<'desktop' | 'mobile'>('desktop');

  // Fetch monitor details
  useEffect(() => {
    setLoading(true);
    request(`/monitor/${monitorId}`, { method: 'GET' }).then((res) => {
      setSelectedMonitor(res.monitor?.data || null);
      setLoading(false);
    });
  }, [monitorId]);

  const monitorUrl = selectedMonitor?.monitor?.config?.meta?.url;

  // Fetch Lighthouse data
  const getLighthouseData = async (
    selectedStrategy: 'desktop' | 'mobile',
    url: string,
    forceFetch: boolean = false
  ) => {
    try {
      setLoading(true);
      const res = await request('/monitor/health-check/lighthouse', {
        method: 'POST',
        data: { monitorUrl: url, strategy: selectedStrategy, force_fetch: forceFetch },
      });
      setData(res?.lighthouseHealthCheckData || null);
    } catch (err) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (monitorUrl) {
      getLighthouseData(strategy, monitorUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitorUrl, strategy]);

  const handleRefresh = async () => {
    if (monitorUrl) {
      setRefreshing(true);
      await getLighthouseData(strategy, monitorUrl, true);
      setRefreshing(false);
    }
  };

  // Show loading while checking for monitor URL
  if (loading) return <LoadingCard />;
  if (!data) return null;
  console.log('light house ', data);
  const meta = data?.data.result?.details?.lighthouse?.meta;
  const performance = meta?.performance;

  return (
    <Main>
      <Box padding={4}>
        <PageHeader
          title="Lighthouse"
          monitorUrl={monitorUrl}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        <StatusCard
          status={data.status}
          message={data.message}
          error={data.error}
          cardData={data.data}
        />

        {meta && (
          <Card style={{ marginTop: 24, marginBottom: 24 }}>
            <CardBody>
              <Flex direction="column" alignItems="flex-start" padding={3} width="100%">
                <Flex
                  justifyContent="space-between"
                  alignItems="flex-start"
                  paddingBottom={3}
                  width="100%"
                >
                  <Typography variant="delta" fontWeight="bold">
                    Scores
                  </Typography>
                  <Box style={{ minWidth: 200 }}>
                    <SingleSelect
                      label="Select Device"
                      value={strategy}
                      onChange={(val: string) => {
                        if (val === 'desktop' || val === 'mobile') setStrategy(val);
                      }}
                    >
                      <SingleSelectOption value="desktop">Desktop</SingleSelectOption>
                      <SingleSelectOption value="mobile">Mobile</SingleSelectOption>
                    </SingleSelect>
                  </Box>
                </Flex>
                <CardContent width="100%">
                  <Flex
                    gap={4}
                    marginTop={4}
                    justifyContent={{ initial: 'center', large: 'space-around' }}
                    flexWrap="wrap"
                    direction={{ initial: 'column', medium: 'row' }}
                    width="100%"
                  >
                    {meta.performance && (
                      <Box>
                        <CircleProgress score={meta.performance.score || 0} label="Performance" />
                      </Box>
                    )}
                    {meta.accessibility && (
                      <Box>
                        <CircleProgress
                          score={meta.accessibility.score || 0}
                          label="Accessibility"
                        />
                      </Box>
                    )}
                    {meta.bestPractices && (
                      <Box>
                        <CircleProgress
                          score={meta.bestPractices.score || 0}
                          label="Best Practices"
                        />
                      </Box>
                    )}
                    {meta.seo && (
                      <Box>
                        <CircleProgress score={meta.seo.score || 0} label="SEO" />
                      </Box>
                    )}
                    {meta.pwa && (
                      <Box>
                        <CircleProgress score={meta.pwa.score || 0} label="PWA" />
                      </Box>
                    )}
                  </Flex>
                </CardContent>
              </Flex>
            </CardBody>
          </Card>
        )}

        {performance && (
          <Card style={{ marginTop: 24 }}>
            <CardBody>
              <Flex direction="column" width="100%" alignItems="flex-start">
                <Typography variant="delta" fontWeight="bold" padding={3}>
                  Performance Metrics
                </Typography>
                <CardContent>
                  <Grid.Root gap={4} style={{ alignItems: 'start' }}>
                    <Grid.Item col={4} xs={12}>
                      <Flex gap={1} alignItems="flex-start" direction="column" marginBottom={4}>
                        {performance.firstContentfulPaint && (
                          <MetricRow
                            label="First contentful paint"
                            displayValue={performance.firstContentfulPaint.displayValue}
                            status={performance.firstContentfulPaint.status}
                          />
                        )}
                        {performance.largestContentfulPaint && (
                          <MetricRow
                            label="Largest contentful paint"
                            displayValue={performance.largestContentfulPaint.displayValue}
                            status={performance.largestContentfulPaint.status}
                          />
                        )}
                      </Flex>
                    </Grid.Item>
                    <Grid.Item col={4} xs={12}>
                      <Flex gap={1} alignItems="flex-start" direction="column" marginBottom={4}>
                        {performance.speedIndex && (
                          <MetricRow
                            label="Speed index"
                            displayValue={performance.speedIndex.displayValue}
                            status={performance.speedIndex.status}
                          />
                        )}
                        {performance.totalBlockingTime && (
                          <MetricRow
                            label="Total blocking time"
                            displayValue={performance.totalBlockingTime.displayValue}
                            status={performance.totalBlockingTime.status}
                          />
                        )}
                      </Flex>
                    </Grid.Item>
                    <Grid.Item col={4} xs={12}>
                      <Flex gap={1} alignItems="flex-start" direction="column" marginBottom={4}>
                        {performance.interactive && (
                          <MetricRow
                            label="Interactive"
                            displayValue={performance.interactive.displayValue}
                            status={performance.interactive.status}
                          />
                        )}
                        {performance.cumulativeLayoutShift && (
                          <MetricRow
                            label="Cumulative layout shift"
                            displayValue={performance.cumulativeLayoutShift.displayValue}
                            status={performance.cumulativeLayoutShift.status}
                          />
                        )}
                      </Flex>
                    </Grid.Item>
                  </Grid.Root>
                </CardContent>
              </Flex>
            </CardBody>
          </Card>
        )}
      </Box>
    </Main>
  );
}
