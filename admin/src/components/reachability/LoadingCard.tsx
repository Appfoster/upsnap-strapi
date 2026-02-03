import React from "react";
import { Card, CardBody, Typography } from "@strapi/design-system";

const LoadingCard = () => (
  <Card>
    <CardBody>
      <Typography variant="pi" textColor="neutral500">Loading...</Typography>
    </CardBody>
  </Card>
);

export default LoadingCard;