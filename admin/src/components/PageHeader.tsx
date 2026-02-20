import { Typography, Button, Box, Flex, Link } from '@strapi/design-system';
import { ArrowsCounterClockwise } from '@strapi/icons';
import { RegionsDropdown } from './RegionsDropdown';
import { Region } from '../utils/types';

interface PageHeaderProps {
  title: string;
  monitorUrl?: string | null;
  onRefresh?: () => void;
  refreshing?: boolean;
  showRefresh?: boolean;
  regionsDropdown?: boolean;
  regionId?: string | null;
  onRegionChange?: (regionId: string) => void;
  selectedRegions?: Region[];
}

export default function PageHeader({
  title,
  monitorUrl,
  onRefresh,
  refreshing = false,
  showRefresh = true,
  regionsDropdown = false,
  regionId = null,
  onRegionChange,
  selectedRegions = [],
}: PageHeaderProps) {
  // Extract only the hostname (domain) from the URL
  const displayUrl = (() => {
    if (!monitorUrl) return 'No monitored URL set';
    try {
      const url = new URL(monitorUrl);
      return url.hostname;
    } catch (error) {
      // fallback if the value is not a valid URL
      return monitorUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    }
  })();

  return (
    <Flex
      direction={{ initial: 'column', medium: 'row' }}
      justifyContent="space-between"
      alignItems={{ initial: 'flex-start', medium: 'center' }}
      gap={3}
      marginBottom={4}
      marginTop={4}
    >
      {/* Left Side — Page Title & Optional URL */}
      <Flex alignItems="center" gap={2}>
        <Typography variant="beta" as="h2" marginBottom={4}>
          {title}
          {monitorUrl && (
            <>
              <Typography style={{ fontWeight: 500, fontSize: 16 }}> (</Typography>
              <Link
                isExternal
                href={monitorUrl}
                rel="noopener noreferrer"
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  marginLeft: 2,
                  marginRight: 2,
                }}
              >
                {displayUrl}
              </Link>
              <Typography style={{ fontWeight: 500, fontSize: 16 }}>)</Typography>
            </>
          )}
        </Typography>
      </Flex>

      {/* Right Side — Optional Refresh Button */}
      {showRefresh && onRefresh && (
        <Flex
          alignItems={{ initial: 'start', medium: 'center' }}
          direction={{ initial: 'column', medium: 'row' }}
          gap={4}
        >
          {regionsDropdown && onRegionChange && (
            <Box style={{ minWidth: 180 }}>
              <RegionsDropdown
                value={regionId}
                onChange={onRegionChange}
                selectedRegions={selectedRegions}
              />
            </Box>
          )}

          <Button
            size="S"
            variant="secondary"
            startIcon={<ArrowsCounterClockwise />}
            onClick={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Checking...' : 'Check Now'}
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
