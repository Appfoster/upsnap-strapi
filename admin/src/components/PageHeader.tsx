import { Typography, Button, Box, Flex, Link, SingleSelect, SingleSelectOption } from '@strapi/design-system';
import { ArrowsCounterClockwise, ArrowLeft } from '@strapi/icons';
import { RegionsDropdown } from './RegionsDropdown';
import { Region } from '../utils/types';

interface MonitorOption {
  id: string;
  name: string;
}

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
  showBackButton?: boolean;
  monitors?: MonitorOption[];
  selectedMonitorId?: string | null;
  onMonitorChange?: (monitorId: string) => void;
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
  showBackButton = false,
  monitors = [],
  selectedMonitorId = null,
  onMonitorChange,
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
    <Box>
      {showBackButton && (
        <Box padding={0}>
          <Link href="#" onClick={(e: any) => {
            e.preventDefault();
            window.history.back()
          }} startIcon={<ArrowLeft />}>
            Back
          </Link>
        </Box>
      )}
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
          <Typography variant="beta" marginBottom={4}>
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
            {monitors.length > 0 && onMonitorChange && (
              <Box style={{ minWidth: 220 }}>
                <SingleSelect
                  aria-label="Select Monitor"
                  value={selectedMonitorId || ''}
                  onChange={(val: string | number) => val && onMonitorChange(String(val))}
                >
                  {monitors.map((monitor) => (
                    <SingleSelectOption key={monitor.id} value={monitor.id}>
                      {monitor.name}
                    </SingleSelectOption>
                  ))}
                </SingleSelect>
              </Box>
            )}

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
    </Box>
  );
}
