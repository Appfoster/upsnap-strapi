import React, { useState } from 'react';
import {
  Box,
  Flex,
  Button,
  TextInput,
  Switch,
  SingleSelect,
  SingleSelectOption,
  Typography,
} from '@strapi/design-system';
import { Trash } from '@strapi/icons';
import { Keyword } from '../../../utils/types';

interface KeywordInputProps {
  keywords: Keyword[];
  onKeywordsChange: (keywords: Keyword[]) => void;
  error?: string;
  matchAll: boolean;
  onMatchAllChange: (matchAll: boolean) => void;
}

export default function KeywordInput({
  keywords,
  onKeywordsChange,
  error,
  matchAll,
  onMatchAllChange,
}: KeywordInputProps) {
  const [keywordInput, setKeywordInput] = useState('');

  const handleAddKeyword = () => {
    const trimmedInput = keywordInput.trim();
    if (!trimmedInput) return;

    const newKeyword: Keyword = {
      text: trimmedInput,
      type: 'must_contain',
      case_sensitive: false,
      is_regex: false,
    };

    onKeywordsChange([...keywords, newKeyword]);
    setKeywordInput('');
  };

  const handleRemoveKeyword = (indexToRemove: number) => {
    onKeywordsChange(keywords.filter((_, index) => index !== indexToRemove));
  };

  const handleKeywordChange = (index: number, field: keyof Keyword, value: any) => {
    const updatedKeywords = [...keywords];
    updatedKeywords[index] = {
      ...updatedKeywords[index],
      [field]: value,
    };
    onKeywordsChange(updatedKeywords);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  return (
    <Box width="100%">
      {/* Keyword Input Field */}
      <Box marginBottom={4}>
        <Flex alignItems="center" justifyContent="space-between" marginBottom={2}>
          <Typography variant="beta" fontWeight="bold">
            Keywords / Text
          </Typography>
          <Flex alignItems="center" gap={3}>
            <Switch
              checked={matchAll}
              onCheckedChange={(checked: boolean) => onMatchAllChange(checked)}
            />
            <Typography variant="omega" fontWeight="500">
              Match All Keywords
            </Typography>
          </Flex>
        </Flex>
        <Flex gap={2}>
          <Box flex={1}>
            <TextInput
              type="text"
              placeholder="Enter keyword"
              value={keywordInput}
              onChange={(e: any) => setKeywordInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </Box>
          <Button disabled={!keywordInput.trim()} onClick={handleAddKeyword}>
            Add
          </Button>
        </Flex>
        {error && (
          <Box marginTop={2}>
            <Typography variant="omega" textColor="danger600">
              {error}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Keywords List */}
      {keywords.length > 0 && (
        <Box>
          <Box paddingBottom={3}>
            <Typography variant="beta" fontWeight="bold" marginBottom={3}>
              Added Keywords ({keywords.length})
            </Typography>
          </Box>
          <Flex direction="column" gap={2} width="800px">
            {keywords.map((keyword, index) => (
              <Box
                key={index}
                padding={4}
                borderColor="neutral200"
                hasRadius
                borderRadius={2}
                width="800px"
              >
                {/* Keyword Text and Remove Button */}
                <Flex
                  alignItems="flex-start"
                  justifyContent="space-between"
                  gap={3}
                  marginBottom={4}
                >
                  <Box>
                    <Box paddingBottom={2}>
                      <Typography variant="omega" textColor="neutral600" marginBottom={1}>
                        Keyword
                      </Typography>
                    </Box>

                    <Box
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        backgroundColor: '#F2F4F7',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        color: '#32324D',
                        wordBreak: 'break-all',
                      }}
                    >
                      {keyword.text}
                    </Box>
                  </Box>

                  <Button
                    style={{
                      padding: '0',
                      minWidth: '32px',
                      width: '32px',
                      height: '32px',
                    }}
                    variant="tertiary"
                    onClick={() => handleRemoveKeyword(index)}
                    title="Remove keyword"
                  >
                    <Trash />
                  </Button>
                </Flex>

                {/* Keyword Options */}
                <Flex
                  direction={{ initial: 'column', medium: 'row' }}
                  gap={5}
                  alignItems="flex-end"
                >
                  {/* Match Type - Per Keyword Dropdown */}
                  <Box flex={1}>
                    <SingleSelect
                      value={keyword.type}
                      onChange={(value: any) => {
                        handleKeywordChange(
                          index,
                          'type',
                          value as 'must_contain' | 'must_not_contain'
                        );
                      }}
                    >
                      <SingleSelectOption value="must_contain">
                        Start incident when keyword exists
                      </SingleSelectOption>
                      <SingleSelectOption value="must_not_contain">
                        Start incident when keyword does not exist
                      </SingleSelectOption>
                    </SingleSelect>
                  </Box>

                  {/* Is Regex Switch */}
                  <Box flex={1}>
                    <Flex alignItems="center" gap={3} marginBottom={2}>
                      <Switch
                        checked={keyword.is_regex}
                        onCheckedChange={(checked: boolean) =>
                          handleKeywordChange(index, 'is_regex', checked)
                        }
                      />
                      <Typography variant="omega" fontWeight="500">
                        Regex
                      </Typography>
                    </Flex>
                    <Typography variant="pi" textColor="neutral600">
                      Use regular expression matching
                    </Typography>
                  </Box>

                  {/* Case Sensitive Switch */}
                  <Box flex={1}>
                    <Flex alignItems="center" gap={3} marginBottom={2}>
                      <Switch
                        checked={keyword.case_sensitive}
                        onCheckedChange={(checked: boolean) =>
                          handleKeywordChange(index, 'case_sensitive', checked)
                        }
                      />
                      <Typography variant="omega" fontWeight="500">
                        Case Sensitive
                      </Typography>
                    </Flex>
                    <Typography variant="pi" textColor="neutral600">
                      Match exact letter case
                    </Typography>
                  </Box>
                </Flex>
              </Box>
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  );
}
