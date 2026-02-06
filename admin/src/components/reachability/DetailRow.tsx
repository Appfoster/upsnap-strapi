import React from "react";
import { Badge, Typography, Box, Link } from "@strapi/design-system";

interface DetailRowProps {
  label: string;
  value: any;
  isUrl?: boolean;
  isChip?: boolean;
}

const getStatusColor = (code?: number) => {
  if (!code) return "secondary";
  if (code >= 200 && code < 300) return "success";
  if (code >= 300 && code < 400) return "primary";
  if (code >= 400 && code < 500) return "warning";
  return "danger";
};

const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  isUrl = false,
  isChip = false,
}) => {
  const renderValue = () => {
    if (value === undefined || value === null) return "N/A";
    console.log('vlue ', value, 'type ', typeof value);
    if (Array.isArray(value)) {
      return value.map((item, index) => (
        <Typography key={index} variant="pi" textColor="neutral800" style={{ display: "block" }}>
          {item}
        </Typography>
      ));
    }
    if (isUrl) {
      return (
        <Link isExternal href={value} rel="noopener noreferrer" style={{ color: "#4945ff" }}>
          {value}
        </Link>
      );
    }
    if (isChip) {
      return (
        <Badge >
          {value}
        </Badge>
      );
    }
    return value;
  };

  return (
    <Box paddingBottom={2} display='flex' paddingTop={2}>
      <Typography variant="omega" fontWeight="bold" style={{ width: "40%", display: "inline-block" }}>
        {label}
      </Typography>
      <Typography variant="omega" style={{ width: "70%", display: "inline-block", ...(Array.isArray(value) && { overflow: 'auto', height: '48px'}) }}>{renderValue()}</Typography>
    </Box>
  );
};

export default DetailRow;