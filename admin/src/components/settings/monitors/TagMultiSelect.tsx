import React, { useState, useRef, useEffect } from 'react';
import { Tag } from '../../../utils/types';
import { formatTitleToUppercase, request, fetchTags } from '../../../utils/helpers';
import {
  Box,
  Flex,
  Typography,
  TextInput,
  IconButton,
  Checkbox,
  Button,
} from '@strapi/design-system';
import { ChevronDown, Cross, Search, Plus } from '@strapi/icons';
import { TagsApiResponse } from '../../../utils/types';
import { generateRandomColor } from '../../../utils/constants';
interface TagMultiSelectProps {
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  placeholder?: string;
  apiEndpoint?: string;
}



export const TagMultiSelect: React.FC<TagMultiSelectProps> = ({
  selectedTagIds,
  onTagsChange,
  placeholder = 'Select or create tags...',
  apiEndpoint = '/tags',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch tags on component mount
  useEffect(() => {
    fetchTags(setIsLoading, setAvailableTags);
  }, []);

  const createTag = async (tagName: string): Promise<Tag | null> => {
    setIsCreating(true);
    try {
      const result: TagsApiResponse = await request(apiEndpoint, {
        method: 'POST',
        data: {
          name: tagName,
          color: generateRandomColor(),
        },
      });
      if (!result?.tagsData) return null;

      const newTag = result?.tagsData?.data[0] || result?.tagsData?.data;

      // Add new tag to available tags
      setAvailableTags((prev) => [...prev, newTag]);

      return newTag;
    } catch (error) {
      console.error('Error creating tag:', error);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  // Get selected tags objects
  const selectedTags = availableTags.filter((tag) => selectedTagIds.includes(String(tag.id)));

  // Filter tags based on search input
  const filteredTags = availableTags.filter((tag) =>
    tag.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  // Check if search input matches any existing tag
  const exactMatch = availableTags.find(
    (tag) => tag.name.toLowerCase() === searchInput.toLowerCase()
  );

  // Check if we should show "Create new tag" option
  const showCreateOption = searchInput.trim() && !exactMatch;

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

  const handleToggleTag = (tagId: string | number) => {
    const idStr = String(tagId);
    if (selectedTagIds.includes(idStr)) {
      onTagsChange(selectedTagIds.filter((id) => id !== idStr));
    } else {
      onTagsChange([...selectedTagIds, idStr]);
    }
  };

  const handleRemoveTag = (tagId: string | number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const idStr = String(tagId);
    onTagsChange(selectedTagIds.filter((id) => id !== idStr));
  };

  const handleCreateTag = async () => {
    if (!searchInput.trim() || isCreating) return;

    const newTag = await createTag(searchInput.trim());
    if (newTag) {
      onTagsChange([...selectedTagIds, String(newTag.id)]);
      setSearchInput('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showCreateOption) {
        handleCreateTag();
      } else if (filteredTags.length === 1) {
        handleToggleTag(filteredTags[0].id);
        setSearchInput('');
      }
    } else if (e.key === 'Backspace' && !searchInput && selectedTags.length > 0) {
      // Remove last tag on backspace when input is empty
      handleRemoveTag(selectedTags[selectedTags.length - 1].id);
    }
  };

  return (
    <Box position="relative" ref={dropdownRef as any} width="100%">
      {/* Main Input Container */}
      <Box
        padding={2}
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
          {/* LEFT: Selected Tags + Input */}
          <Flex wrap="wrap" gap={2} flex="1" width="100%">
            {selectedTags.map((tag) => (
              <Flex
                key={tag.id}
                gap={1}
                padding={1}
                hasRadius
                alignItems="center"
                style={{
                  backgroundColor: `${tag.color}20`,
                  border: `1px solid ${tag.color}40`,
                }}
              >
                <Typography fontWeight="semiBold" style={{ color: tag.color }}>
                  {formatTitleToUppercase(tag.name)}
                </Typography>

                <IconButton
                  label="Remove tag"
                  onClick={(e: any) => handleRemoveTag(tag.id, e)}
                  size="S"
                  variant="ghost"
                >
                  <Cross />
                </IconButton>
              </Flex>
            ))}
            {isOpen && (
              <Box width="70%">
                <TextInput
                  ref={inputRef as any}
                  value={searchInput}
                  onChange={(e: any) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsOpen(true)}
                  placeholder={selectedTags.length === 0 ? placeholder : ''}
                  disabled={isLoading}
                  startAction={<Search />}
                  size="M"
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
                Loading tags…
              </Typography>
            </Box>
          ) : (
            <>
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(String(tag.id));

                  return (
                    <Flex
                      key={tag.id}
                      padding={3}
                      gap={3}
                      alignItems="center"
                      background={isSelected ? 'primary100' : 'neutral0'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleToggleTag(tag.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleTag(tag.id)}
                      />

                      {/* Tag Color Indicator */}
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: tag.color,
                        }}
                      />

                      <Typography flex="1">{formatTitleToUppercase(tag.name)}</Typography>
                    </Flex>
                  );
                })
              ) : searchInput ? (
                <Box padding={4}>
                  <Typography textAlign="center" textColor="neutral500">
                    No tags found
                  </Typography>
                </Box>
              ) : null}

              {/* Create New Tag Option */}
              {showCreateOption && (
                <Box
                  style={{
                    borderTop: '1px solid #D0D3E0',
                  }}
                >
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={handleCreateTag}
                    disabled={isCreating}
                    startIcon={<Plus />}
                    style={{
                      justifyContent: 'flex-start',
                      padding: '12px 16px',
                    }}
                  >
                    {isCreating ? 'Creating...' : `Create "${searchInput}"`}
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      )}
    </Box>
  );
};
