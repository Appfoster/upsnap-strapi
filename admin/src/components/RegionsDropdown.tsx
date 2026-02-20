import React from 'react';
import { SingleSelect, SingleSelectOption } from '@strapi/design-system';
import { Region } from '../utils/types';

interface RegionsDropdownProps {
  value: string | null;
  onChange: (regionId: string) => void;
  selectedRegions?: Region[];
}

export const RegionsDropdown: React.FC<RegionsDropdownProps> = ({
  value,
  onChange,
  selectedRegions = [],
}) => {
  return (
    selectedRegions.length > 0 && (
      <SingleSelect
        key={selectedRegions.length}
        label="Select region"
        value={value || ''}
        onChange={(val: string) => val && onChange(val)}
      >
        {selectedRegions.map((region) => (
          <SingleSelectOption key={region.id} value={region.id}>
            {region.name || region.id}
          </SingleSelectOption>
        ))}
      </SingleSelect>
    )
  );
};
