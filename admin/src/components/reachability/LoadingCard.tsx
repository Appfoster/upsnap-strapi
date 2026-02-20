import React from 'react';
import { Card, CardBody, Typography, Loader } from '@strapi/design-system';
import { Flex } from '@strapi/design-system';

const LoadingCard = () => (
  <Flex
    direction="column"
    justifyContent="center"
    margin={8}
    height={{ initial: '300px', medium: '400px' }}
  >
    <Loader />
    <Typography variant="pi" textColor="neutral500">
      Loading...
    </Typography>
  </Flex>
);

export default LoadingCard;
