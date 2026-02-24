import React, { useState, useRef, useEffect } from 'react';
import { getUserDetails, request } from '../../utils/helpers';
import { Region } from '../../utils/types';
import {
  Box,
  Flex,
  Typography,
  TextInput,
  IconButton,
  Badge,
  Tooltip,
  Checkbox,
} from '@strapi/design-system';
import { ChevronDown, Cross, Search } from '@strapi/icons';
import { getUserDetailsCached } from '../../utils/userStorage';
import { DEFAULT_REGION, PLAN_TYPES } from '../../utils/constants';

interface RegionsApiResponse {
  status: string;
  message: string;
  data: Region[];
}

interface RegionsMultiSelectProps {
  selectedRegionIds: string[];
  onRegionsChange: (regionIds: string[]) => void;
  placeholder?: string;
  primaryRegionId?: string | null;
  onPrimaryRegionChange?: (regionId: string | null) => void;
}

export const RegionsMultiSelect: React.FC<RegionsMultiSelectProps> = ({
  selectedRegionIds,
  onRegionsChange,
  placeholder = 'Select regions...',
  primaryRegionId,
  onPrimaryRegionChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [availableRegions, setAvailableRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTrialUser, setIsTrialUser] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch regions on component mount
  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    setIsLoading(true);
    try {
      let userDetails = await getUserDetailsCached();
      if (!userDetails) {
        userDetails = await getUserDetails();
      }
      const isTrial = userDetails?.user?.subscription_type === PLAN_TYPES.TRIAL;
      setIsTrialUser(isTrial);

      const result: any = await request('/regions', {
        method: 'GET',
      });
      if (!result) return;
      if (!result) {
        throw new Error('Failed to fetch regions');
      }
      // Ensure default region is always first
      const regions = result.regionsData.data.slice();
      const defaultIndex = regions.findIndex((r: any) => r.id === DEFAULT_REGION.id);
      if (defaultIndex > 0) {
        const [defaultRegion] = regions.splice(defaultIndex, 1);
        regions.unshift(defaultRegion);
      }
      setAvailableRegions(regions);
    } catch (error) {
      console.error('Error fetching regions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get selected region objects
  const selectedRegions = availableRegions.filter((region) =>
    selectedRegionIds.includes(String(region.id))
  );

  // Filter regions based on search input
  const filteredRegions = availableRegions.filter((region) =>
    region.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleSetPrimary = (regionId: string) => {
    // Prevent setting disabled regions as primary for trial users
    if (isTrialUser && regionId !== DEFAULT_REGION.id) {
      return;
    }

    // auto-select if not already selected
    if (!selectedRegionIds.includes(regionId)) {
      onRegionsChange([...selectedRegionIds, regionId]);
    }
    onPrimaryRegionChange?.(regionId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchInput('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleRegion = (regionId: string) => {
    // Prevent toggling disabled regions for trial users
    if (isTrialUser && regionId !== DEFAULT_REGION.id) {
      return;
    }

    if (selectedRegionIds.includes(regionId)) {
      // Region is being unchecked/removed
      const updated = selectedRegionIds.filter((id) => id !== regionId);
      onRegionsChange(updated);

      // If the removed region was primary, set the next one as primary
      if (primaryRegionId === regionId) {
        onPrimaryRegionChange?.(updated[0] ?? null);
      }
    } else {
      onRegionsChange([...selectedRegionIds, regionId]);
    }
  };

  const handleRemoveRegion = (regionId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();

    const updated = selectedRegionIds.filter((id) => id !== regionId);
    onRegionsChange(updated);

    if (primaryRegionId === regionId) {
      onPrimaryRegionChange?.(updated[0] ?? null);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredRegions.length === 1) {
      handleToggleRegion(filteredRegions[0].id);
      setSearchInput('');
    } else if (e.key === 'Backspace' && !searchInput && selectedRegions.length > 0) {
      handleRemoveRegion(selectedRegions[selectedRegions.length - 1].id);
    }
  };

  return (
    <Box position="relative" ref={dropdownRef} width="100%">
      {/* Main Input Container */}
      <Box
        padding={3}
        borderColor={isOpen ? 'primary200' : 'neutral200'}
        background="neutral0"
        hasRadius
        style={{ cursor: 'text' }}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        width="100%"
      >
        <Flex alignItems="center" gap={2} width="100%">
          {/* LEFT: Selected Regions + Input */}
          <Flex wrap="wrap" gap={2} flex="1" width="100%">
            {selectedRegions.map((region) => {
              const isPrimary = primaryRegionId === region.id;

              return (
                <Flex
                  key={region.id}
                  gap={1}
                  padding={1}
                  background="primary100"
                  borderColor="primary200"
                  hasRadius
                  alignItems="center"
                >
                  <Typography fontWeight="semiBold" textColor="primary700">
                    {region.name || region.id}
                  </Typography>

                  {isPrimary && (
                    <Badge background="warning100" textColor="warning700">
                      Primary
                    </Badge>
                  )}

                  <IconButton
                    label="Remove region"
                    onClick={(e: any) => handleRemoveRegion(region.id, e)}
                    size="S"
                    variant="ghost"
                  >
                    <Cross />
                  </IconButton>
                </Flex>
              );
            })}
            {isOpen && (
              <Box width="70%">
                <TextInput
                  ref={inputRef}
                  value={searchInput}
                  onChange={(e: any) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsOpen(true)}
                  placeholder={selectedRegions.length === 0 ? placeholder : ''}
                  disabled={isLoading}
                  startAction={<Search />}
                  size="L"
                />
              </Box>
            )}
          </Flex>

          {/* RIGHT: Chevron */}
          <IconButton
            label="Toggle dropdown"
            onClick={(e: any) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            variant="ghost"
          >
            <ChevronDown />
          </IconButton>
        </Flex>
      </Box>

      {/* Dropdown Menu */}
      {isOpen && (
        <Box
          position="absolute"
          zIndex={2}
          width="100%"
          marginTop={2}
          background="neutral0"
          borderColor="neutral200"
          hasRadius
          shadow="tableShadow"
          maxHeight="240px"
          overflow="auto"
        >
          {isLoading ? (
            <Box padding={4}>
              <Typography textAlign="center" textColor="neutral500">
                Loading regions…
              </Typography>
            </Box>
          ) : (
            <>
              {filteredRegions.length > 0 ? (
                filteredRegions.map((region) => {
                  const isSelected = selectedRegionIds.includes(String(region.id));
                  const isPrimary = primaryRegionId === region.id;
                  const isDisabled = isTrialUser && region.id !== DEFAULT_REGION.id;

                  return isDisabled ? (
                    <Tooltip
                      key={region.id}
                      description="Upgrade to a paid plan to enable global monitoring."
                    >
                      <Box>
                        <Flex
                          padding={3}
                          gap={3}
                          alignItems="center"
                          background={isSelected ? 'primary100' : 'neutral0'}
                          style={{
                            cursor: 'not-allowed',
                            opacity: 0.5,
                          }}
                        >
                          <Checkbox checked={isSelected} disabled />

                          <Typography flex="1">{region.name || region.id}</Typography>

                          <Checkbox checked={isPrimary} disabled label="Primary">
                            Primary
                          </Checkbox>
                        </Flex>
                      </Box>
                    </Tooltip>
                  ) : (
                    <Flex
                      key={region.id}
                      padding={3}
                      gap={3}
                      alignItems="center"
                      background={isSelected ? 'primary100' : 'neutral0'}
                      style={{ cursor: 'pointer' }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggleRegion(region.id)}
                      />

                      <Typography flex="1">{region.name || region.id}</Typography>

                      <Checkbox
                        checked={isPrimary}
                        onChange={() => handleSetPrimary(region.id)}
                        label="Primary"
                      >
                        Primary
                      </Checkbox>
                    </Flex>
                  );
                })
              ) : searchInput ? (
                <Box padding={4}>
                  <Typography textAlign="center" textColor="neutral500">
                    No regions found
                  </Typography>
                </Box>
              ) : null}
            </>
          )}
        </Box>
      )}
    </Box>
  );
};
