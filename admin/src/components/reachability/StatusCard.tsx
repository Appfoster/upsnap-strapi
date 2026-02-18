import React from 'react';
import { Card, CardBody, Typography, Flex, Box } from '@strapi/design-system';
import { CheckCircle, CrossCircle, Information } from '@strapi/icons';
import { formatDateTime } from '../../utils/helpers';
import { CardContent } from '@strapi/design-system';

interface StatusCardProps {
  status: 'success' | 'error' | 'warning';
  message?: string;
  error?: string;
  cardData?: any;
}

const StatusCard: React.FC<StatusCardProps> = ({ status, message, error, cardData }) => {
  let icon, title, color;
  if (status === 'success') {
    icon = <CheckCircle color="success600" />;
    title = 'Everything is running smoothly!';
    color = 'success700';
  } else if (status === 'warning') {
    icon = <Information color="warning600" />;
    title = 'There are some issues!';
    color = 'warning100';
  } else {
    icon = <CrossCircle color="danger600" />;
    title = 'Server is experiencing issues!';
    color = 'danger100';
  }

  return (
    <Card style={{ background: `var(--${color})`, marginBottom: 24 }}>
      <CardBody >
        <CardContent width='100%'>
          <Box>
            <Flex justifyContent="space-between" alignItems={{initial: "start", medium: "center"}} direction={{initial: "column", medium: "row"}} gap={2}>
              <Flex direction="column" alignItems="flex-start" gap={1}>
                <Typography variant="delta" fontWeight="bold">
                  <Typography>{icon}</Typography> {title}
                </Typography>
                <Typography variant="pi" textColor="neutral700">
                  {error || message || ''}
                </Typography>
              </Flex>
              <Typography variant="pi" textColor="neutral500">
                Last updated: {formatDateTime(cardData?.checkedAt)}
              </Typography>
            </Flex>
          </Box>
        </CardContent>
      </CardBody>
    </Card>
  );
};

export default StatusCard;
