import {
  Grid,
  Card,
  Box,
  CardBody,
  CardContent,
  CardTitle,
  CardSubtitle,
  CardBadge,
  Flex,
} from '@strapi/design-system';
import { formatDate } from '../../utils/helpers';
import { HistogramData, MonitorData, UptimeStatsData } from '../../utils/types';
import { HistogramChart } from './Histogram';

interface Props {
  monitorData: MonitorData | null;
  uptimeStats: UptimeStatsData | null;
  histogramData: HistogramData | null;
  isLoading: boolean;
}

export const StatisticsCards = ({ monitorData, uptimeStats, histogramData, isLoading }: Props) => {
  const getIncidentCount = (time: 'day' | 'month' | 'week') => {
    return uptimeStats?.uptime_stats?.[time]?.incident_count || 0;
  };
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} width="100%">
      <Flex direction="column" gap={3} alignItems="start" width="100%">
        <Flex
          direction={{ initial: 'column', medium: 'row' }}
          gap={3}
          alignItems={{ initial: 'stretch', medium: 'start' }}
          marginTop={2}
          width="100%"
        >
          <Box>
            <Card width={{ initial: '100%', medium: '240px' }}>
              <CardBody>
                <CardContent paddingLeft={1}>
                  <CardTitle fontSize={3}>Current Status</CardTitle>
                  <CardSubtitle marginTop={1} fontSize={3} textColor={'green'}>
                    {monitorData?.monitor?.service_last_checks?.default?.uptime?.last_status ||
                      'N/A'}
                  </CardSubtitle>
                </CardContent>
              </CardBody>
            </Card>
          </Box>

          <Box>
            <Card width={{ initial: '100%', medium: '240px' }}>
              <CardBody>
                <CardContent paddingLeft={1}>
                  <CardTitle fontSize={3}>Last check</CardTitle>
                  <CardSubtitle marginTop={1} fontSize={3} textColor={'green'}>
                    {formatDate(
                      monitorData?.monitor?.service_last_checks?.default?.uptime?.last_checked_at ||
                        'N/A'
                    )}
                  </CardSubtitle>
                </CardContent>
              </CardBody>
            </Card>
          </Box>

          <Box>
            <Card width={{ initial: '100%', medium: '280px' }}>
              <CardBody>
                <CardContent paddingLeft={1}>
                  <CardTitle fontSize={3}>Last 24 hours</CardTitle>
                  <CardSubtitle marginTop={1} fontSize={3} textColor={'green'}>
                    <HistogramChart
                      data={histogramData?.histogram?.data || []}
                      isLoading={isLoading}
                    />
                  </CardSubtitle>
                </CardContent>
              </CardBody>
            </Card>
          </Box>
        </Flex>

        <Flex width="100%" direction={{ initial: 'column', medium: 'row' }} alignItems={{ initial: 'stretch', medium: 'start' }} gap={3}>
          <Box>
            <Card
              width={{ initial: '100%', medium: '240px' }}
            >
              <CardBody>
                <CardContent paddingLeft={1}>
                  <CardTitle fontSize={3}>Last 24h</CardTitle>
                  <CardSubtitle marginTop={1} fontSize={3} textColor={'green'}>
                    {uptimeStats?.uptime_stats?.day?.uptime_percentage
                      ? `${uptimeStats.uptime_stats.day.uptime_percentage}%`
                      : 'N/A'}
                  </CardSubtitle>
                </CardContent>
                <CardBadge>
                  {getIncidentCount('day')} incident{getIncidentCount('day') > 1 ? 's' : ''}
                </CardBadge>
              </CardBody>
            </Card>
          </Box>

          <Box>
            <Card
              width={{ initial: '100%', medium: '240px' }}
            >
              <CardBody>
                <CardContent paddingLeft={1}>
                  <CardTitle fontSize={3}>Last week</CardTitle>
                  <CardSubtitle marginTop={1} fontSize={3} textColor={'green'}>
                    {uptimeStats?.uptime_stats?.week?.uptime_percentage
                      ? `${uptimeStats.uptime_stats.week.uptime_percentage}%`
                      : 'N/A'}
                  </CardSubtitle>
                </CardContent>
                <CardBadge>
                  {getIncidentCount('week')} incident{getIncidentCount('week') > 1 ? 's' : ''}
                </CardBadge>
              </CardBody>
            </Card>
          </Box>

          <Box>
            <Card
              width={{ initial: '100%', medium: '240px' }}
            >
              <CardBody>
                <CardContent paddingLeft={1}>
                  <CardTitle fontSize={3}>Last 30 days</CardTitle>
                  <CardSubtitle marginTop={1} fontSize={3} textColor={'green'}>
                    {uptimeStats?.uptime_stats?.month?.uptime_percentage
                      ? `${uptimeStats.uptime_stats.month.uptime_percentage}%`
                      : 'N/A'}
                  </CardSubtitle>
                </CardContent>
                <CardBadge>
                  {getIncidentCount('month')} incident{getIncidentCount('month') > 1 ? 's' : ''}
                </CardBadge>
              </CardBody>
            </Card>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};
