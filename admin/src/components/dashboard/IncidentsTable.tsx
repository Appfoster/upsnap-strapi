import React from 'react';
import {
  Typography,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
  Tooltip,
  Box,
  Badge,
} from '@strapi/design-system';
import { formatCheckType } from '../../utils/helpers';
import { Flex } from '@strapi/design-system';

interface Incident {
  monitor_id: string;
  region: string;
  check_type: string;
  status_code: number;
  error_message: string;
  timestamp: number;
}

interface IncidentsTableProps {
  incidentsData: { incidents: Incident[] };
  monitorName: string;
  isLoading?: boolean;
}

const MAX_MESSAGE_LENGTH = 22;

const getStatusCodeColor = (statusCode: number | string | undefined) => {
  if (!statusCode) return 'secondary';
  const code = typeof statusCode === 'string' ? parseInt(statusCode) : statusCode;
  if (code >= 200 && code < 300) return 'success';
  if (code >= 300 && code < 400) return 'primary';
  if (code >= 400 && code < 500) return 'warning';
  if (code >= 500) return 'danger';
  return 'secondary';
};

const formatMonitorName = (name: string) => {
  return name?.length > MAX_MESSAGE_LENGTH ? name.slice(0, MAX_MESSAGE_LENGTH) + '...' : name;
};
const showMonitorName = (name: string) => {
  return name?.length > MAX_MESSAGE_LENGTH ? name : '';
};

export const IncidentsTable: React.FC<IncidentsTableProps> = ({
  incidentsData,
  monitorName,
  isLoading = false,
}) => {
  return (
    <Box paddingTop={8}>
      <Box marginBottom={4}>
        <Typography variant="beta">
          Recent 20 Incidents
        </Typography>
      </Box>
      {/* <Typography variant="omega" textColor="neutral600" marginBottom={4}>
        Recent 20 incidents. For more, visit the <span style={{ color: '#4945ff', cursor: 'pointer', textDecoration: 'underline' }}>incidents section</span>.
      </Typography> */}
      <Table colCount={6} rowCount={incidentsData?.incidents?.length || 2}>
        <Thead>
          <Tr>
            <Th>
              <Typography variant="sigma">Monitor</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">Region</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">Check Type</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">Status Code</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">Message</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">Occurred At</Typography>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {isLoading ? (
            <Tr>
              <Td colSpan={6}>
                <Typography>Loading...</Typography>
              </Td>
            </Tr>
          ) : incidentsData?.incidents && incidentsData?.incidents?.length === 0 ? (
            <Tr>
              <Td colSpan={6}>
                <Flex
                  width="100%"
                  justifyContent="center"
                  direction="column"
                  gap={1}
                  padding={2}
                  margin={2}
                >
                  <Typography fontWeight="bold">All good 🎉</Typography>
                  <Typography variant="omega" textColor="neutral500">
                    No recent incidents.
                  </Typography>
                </Flex>
              </Td>
            </Tr>
          ) : (
            incidentsData?.incidents?.map((incident, idx) => (
              <Tr key={idx} fontSize={3}>
                <Td>
                  {showMonitorName(monitorName) ? (
                    <Tooltip description={showMonitorName(monitorName)}>
                      <span style={{ cursor: 'pointer' }}>{formatMonitorName(monitorName)}</span>
                    </Tooltip>
                  ) : (
                    <span>{formatMonitorName(monitorName)}</span>
                  )}
                </Td>
                <Td>
                  <span>{formatCheckType(incident.region) || 'N/A'}</span>
                </Td>
                <Td>
                  <span style={{ textTransform: 'capitalize' }}>
                    {formatCheckType ? formatCheckType(incident.check_type) : incident.check_type}
                  </span>
                </Td>
                <Td>
                  <Badge>{incident.status_code || 'N/A'}</Badge>
                </Td>
                <Td>
                  {incident.error_message?.length > MAX_MESSAGE_LENGTH ? (
                    <Tooltip description={incident.error_message}>
                      <span style={{ cursor: 'pointer' }}>
                        {incident.error_message.slice(0, 21) + '...'}
                      </span>
                    </Tooltip>
                  ) : (
                    <span>{incident.error_message}</span>
                  )}
                </Td>
                <Td>
                  <span>
                    {incident.timestamp && new Date(incident.timestamp * 1000).toLocaleString()}
                  </span>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </Box>
  );
};
