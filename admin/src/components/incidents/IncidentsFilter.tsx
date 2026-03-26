import {
  Button,
  Checkbox,
  Typography,
  Accordion,
  Tooltip,
  Flex,
  Box,
  Popover,
} from '@strapi/design-system';
import { Filter, Lock } from '@strapi/icons';
import { Region } from '../../utils/types';
import React from 'react';
import { INCIDENT_CHECK_TYPES, DEFAULT_REGION, PLAN_TYPES } from '../../utils/constants';
import { getUserDetailsCached } from '../../utils/userStorage';

export interface FilterMenuProps {
  incidentTypeFilters: string[];
  regionFilter: string[];
  onIncidentTypeChange: (f: string[]) => void;
  onRegionChange: (f: string[]) => void;
  incidentTypeOptions?: string[];
  regions: Region[];
  hasNoMonitors: boolean;
}
interface IconProps {
  id: number;
  open: number | null;
}

function Icon({ id, open }: IconProps) {
  return (
    <Box
      style={{
        display: 'inline-block',
        transition: 'transform 0.2s',
        transform: id === open ? 'rotate(180deg)' : 'none',
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Box>
  );
}
export default function IncidentsFilter({
  incidentTypeFilters,
  regionFilter,
  onIncidentTypeChange,
  onRegionChange,
  incidentTypeOptions,
  regions,
  hasNoMonitors,
}: FilterMenuProps) {
  const incidentTypeItems = incidentTypeOptions || [];
  const totalFilters = incidentTypeFilters.length + regionFilter.length;
  const [isTrialUser, setIsTrialUser] = React.useState(false);

  // Fetch user subscription type on mount
  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDetails = await getUserDetailsCached();
        const isTrial = userDetails?.user?.subscription_type === PLAN_TYPES.TRIAL;
        setIsTrialUser(isTrial);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };
    fetchUserData();
  }, []);

  const toggleIncidentType = (option: string) => {
    const updated = incidentTypeFilters.includes(option)
      ? incidentTypeFilters.filter((f) => f !== option)
      : [...incidentTypeFilters, option];
    onIncidentTypeChange(updated);
  };

  const toggleRegion = (regionId: string) => {
    // Prevent toggling disabled regions for trial users
    if (isTrialUser && regionId !== DEFAULT_REGION.id) {
      return;
    }

    const updated = regionFilter.includes(regionId)
      ? regionFilter.filter((r) => r !== regionId)
      : [...regionFilter, regionId];
    onRegionChange(updated);
  };

  const [openAccordion, setOpenAccordion] = React.useState<number | null>(0);

  const handleAccordionOpen = (value: number) => {
    setOpenAccordion(openAccordion === value ? null : value);
  };

  return (
    <Popover.Root>
      <Popover.Trigger disabled={hasNoMonitors}>
        <Button variant="tertiary" startIcon={<Filter />}>
        <Flex direction="row" alignItems="center" gap={2}>
        Filter
        {totalFilters > 0 && (
          <Box
            background="primary600"
            color="neutral0"
            paddingTop="2px"
            paddingBottom="2px"
            paddingLeft="7px"
            paddingRight="7px"
            borderRadius="5px"
            marginLeft={2}
            fontSize={1}
            style={{ minWidth: 24, textAlign: 'center' }}
          >
            {totalFilters}
          </Box>
        )}
        </Flex>
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <Box>
        <Accordion.Root>
          <Accordion.Item value="acc-01">
            <Accordion.Header>
              <Accordion.Trigger description="Your personal information">
                <Typography variant="pi" fontWeight="bold">
                  Filter by Incident Type
                </Typography>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>
            <Flex padding={3} direction="column" gap={3} justifyContent="start" alignItems="start">
              {incidentTypeItems.map((item, index) => (
                <Flex
                  key={item}
                  alignItems="center"
                  gap={2}
                  paddingBottom={index !== incidentTypeItems.length - 1 ? 2 : 0}
                >
                  <Checkbox
                    checked={incidentTypeFilters.includes(item)}
                    onCheckedChange={() => toggleIncidentType(item)}
                    aria-label={
                      INCIDENT_CHECK_TYPES[item as keyof typeof INCIDENT_CHECK_TYPES] || item
                    }
                  />
                  <Typography variant="pi">
                    {INCIDENT_CHECK_TYPES[item as keyof typeof INCIDENT_CHECK_TYPES] || item}
                  </Typography>
                </Flex>
              ))}
              </Flex>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
        <Accordion.Root>
          <Accordion.Item value="acc-01">
            <Accordion.Header>
              <Accordion.Trigger description="Your personal information">
                <Typography variant="pi" fontWeight="bold">
                  Filter by Region
                </Typography>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>
                <Flex padding={3} direction="column" gap={3} justifyContent="start" alignItems="start">
              {regions.map((region, index) => {
                const isDisabled = isTrialUser && region.id !== DEFAULT_REGION.id;
                const regionContent = (
                  <Flex
                    key={region.id}
                    alignItems="center"
                    gap={2}
                    style={{ cursor: isDisabled ? 'not-allowed' : undefined }}
                  >
                    <Checkbox
                      checked={regionFilter.includes(region.id)}
                      onCheckedChange={() => toggleRegion(region.id)}
                      disabled={isDisabled}
                      aria-label={region.name}
                    />
                    <Typography variant="pi">{region.name}</Typography>
                  </Flex>
                );
                if (isDisabled) {
                  return (
                    <Tooltip
                      label={
                        <Box>
                          <Typography fontWeight="bold" variant="pi">
                            Unlock Global Monitoring
                          </Typography>
                          <Typography variant="pi">
                            Upgrade to a paid plan to filter incidents from multiple regions
                            worldwide.
                          </Typography>
                        </Box>
                      }
                      side={"left"}
                      key={region.id}
                    >
                      {regionContent}
                    </Tooltip>
                  );
                }
                return regionContent;
              })}
              </Flex>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>

        {(incidentTypeFilters.length > 0 || regionFilter.length > 0) && (
          <Box padding={4} borderColor="neutral200">
            <Button
              variant="tertiary"
              fullWidth
              onClick={() => {
                onIncidentTypeChange([]);
                onRegionChange([]);
              }}
            >
              Clear All Filters
            </Button>
          </Box>
        )}
        </Box>
      </Popover.Content>
    </Popover.Root>
  );
}
