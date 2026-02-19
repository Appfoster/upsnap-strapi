import { Flex } from '@strapi/design-system';
import { Region } from '../../utils/types';
import {
  Card,
  CardBody,
  CardHeader,
  CardContent,
  Badge,
  Typography,
  Box,
} from '@strapi/design-system';
interface RegionResponseTimeData {
  chart_data: Array<{ timestamp: number; response_time: number }>;
  avg_response_time: number;
  max_response_time: number;
  min_response_time: number;
}
interface RegionWiseResponseTimeCardsProps {
  regions: Region[];
  regionNames: Record<string, string>;
  regionResponseTimeData: Record<string, RegionResponseTimeData>;
  loadingRegions: Set<string>;
}
export default function RegionWiseCards({
  regions,
  regionNames,
  regionResponseTimeData,
  loadingRegions,
}: RegionWiseResponseTimeCardsProps) {
  const colors = [
    '#4CAF50',
    '#2196F3',
    '#FF9800',
    '#9C27B0',
    '#00BCD4',
    '#F44336',
    '#8BC34A',
    '#FFEB3B',
  ];
  const formatTime = (ms: any) => {
    if (!ms) return 'N/A';
    return ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${ms} ms`;
  };
  const isPrimary = (region: Region) => region.is_primary;
  return (
    <Card>
      <CardHeader>
        <Box padding={2}>
          <Typography variant="delta" fontWeight="bold">
            Response Time by Region
          </Typography>
        </Box>
      </CardHeader>
      <CardBody>
        <CardContent width="100%">
          {regions.map((region: Region, index: number) => {
            const isLoading = loadingRegions.has(region.id);
            const data = regionResponseTimeData[region.id];
            return (
              <Box key={region.id} style={{ marginBottom: 16, borderRadius: 8, padding: 12 }}>
                <Box style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <Box
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: colors[index % colors.length],
                      marginRight: 8,
                    }}
                  />
                  <Typography variant="omega" fontWeight="bold">
                    {regionNames[region.id] || region.id}
                  </Typography>
                  {isPrimary(region) && (
                    <Badge
                      size={'S'}
                      backgroundColor="warning600"
                      textColor="neutral0"
                      style={{ marginLeft: 'auto' }}
                    >
                      primary
                    </Badge>
                  )}
                </Box>
                {isLoading ? (
                  <Typography variant="epsilon" textColor="neutral500">
                    Loading...
                  </Typography>
                ) : data ? (
                  <Flex direction={{ initial: 'row' }} justifyContent={{ initial: 'space-around' }}>
                    <Box display="flex" style={{ flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="pi">Avg</Typography>
                      <Typography variant="epsilon">
                        {formatTime(data.avg_response_time)}
                      </Typography>
                    </Box>
                    <Box display="flex" style={{ flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="pi">Max</Typography>
                      <Typography variant="epsilon">
                        {formatTime(data.max_response_time)}
                      </Typography>
                    </Box>
                    <Box display="flex" style={{ flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="pi">Min</Typography>
                      <Typography variant="epsilon">
                        {formatTime(data.min_response_time)}
                      </Typography>
                    </Box>
                  </Flex>
                ) : (
                  <Typography variant="pi" textColor="neutral500">
                    No data available
                  </Typography>
                )}
              </Box>
            );
          })}
        </CardContent>
      </CardBody>
    </Card>
  );
}
