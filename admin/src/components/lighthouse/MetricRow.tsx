import React from 'react';
import { Box, Typography, Flex } from '@strapi/design-system';

type StatusType = 'good' | 'warning' | 'bad';

interface MetricRowProps {
  label: string;
  displayValue: string | number;
  status: StatusType;
}

const MetricRow: React.FC<MetricRowProps> = ({ label, displayValue, status }) => {
  const getStatusColor = (status: StatusType) => {
    if (status === 'good') return '#10b981';
    if (status === 'warning') return '#d97706';
    return '#ef4444';
  };

  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      paddingTop={2}
      paddingBottom={2}
      gap={3}
    >
      <Flex alignItems="center">
        <span
          style={{
            color: getStatusColor(status),
            fontSize: 18,
            marginRight: 8,
          }}
        >
          ●
        </span>
        <Typography variant="pi">{label}</Typography>
      </Flex>
      <Box>
        <Typography variant="pi" fontWeight="bold" style={{ color: getStatusColor(status) }}>
          {displayValue}
        </Typography>
      </Box>
    </Flex>
  );
};

export default MetricRow;
