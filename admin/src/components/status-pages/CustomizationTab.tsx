import { useRef } from 'react';
import {
  Box,
  Flex,
  Typography,
  Field,
  Textarea,
  Switch,
  SingleSelect,
  SingleSelectOption,
  Button,
} from '@strapi/design-system';
import { Trash, Upload } from '@strapi/icons';
import { CustomizationState } from '../../utils/types';

interface CustomizationTabProps {
  value: CustomizationState;
  onChange: (value: CustomizationState) => void;
  logoUrl: string | null;
  faviconUrl: string | null;
  onLogoSelect: (file: File) => void;
  onFaviconSelect: (file: File) => void;
  onLogoRemove: () => void;
  onFaviconRemove: () => void;
}

const FIELD_LIMITS = {
  title: 50,
  company_name: 25,
  description: 100,
  footer_text: 100,
  contact_email: 255,
  copyright_text: 50,
  url: 1080,
};

export default function CustomizationTab({
  value,
  onChange,
  logoUrl,
  faviconUrl,
  onLogoSelect,
  onFaviconSelect,
  onLogoRemove,
  onFaviconRemove,
}: CustomizationTabProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const updateHeader = (key: keyof CustomizationState['header'], val: string) =>
    onChange({ ...value, header: { ...value.header, [key]: val } });

  const updateFooter = (key: keyof CustomizationState['footer'], val: string | boolean) =>
    onChange({ ...value, footer: { ...value.footer, [key]: val } });

  const updateLinks = (key: keyof CustomizationState['links'], val: string) =>
    onChange({ ...value, links: { ...value.links, [key]: val } });

  const updateDisplay = (key: keyof CustomizationState['display_config'], val: string | number | boolean) =>
    onChange({ ...value, display_config: { ...value.display_config, [key]: val } });

  return (
    <Flex direction="column" gap={6} width="100%" alignItems="stretch" paddingTop={4}>
      <Box>
        <Typography variant="delta" fontWeight="bold">
          Header
        </Typography>
        <Flex direction="column" gap={4} marginTop={3} alignItems="stretch">
          <Field.Root>
            <Field.Label>Page Title</Field.Label>
            <Field.Input
              value={value.header.title}
              maxLength={FIELD_LIMITS.title}
              onChange={(e: any) => updateHeader('title', e.target.value)}
            />
            <Field.Hint>{value.header.title.length}/{FIELD_LIMITS.title}</Field.Hint>
          </Field.Root>
          <Field.Root>
            <Field.Label>Company Name</Field.Label>
            <Field.Input
              value={value.header.company_name}
              maxLength={FIELD_LIMITS.company_name}
              onChange={(e: any) => updateHeader('company_name', e.target.value)}
            />
            <Field.Hint>{value.header.company_name.length}/{FIELD_LIMITS.company_name}</Field.Hint>
          </Field.Root>
          <Field.Root>
            <Field.Label>Header Description</Field.Label>
            <Textarea
              value={value.header.description}
              maxLength={FIELD_LIMITS.description}
              onChange={(e: any) => updateHeader('description', e.target.value)}
            />
            <Field.Hint>{value.header.description.length}/{FIELD_LIMITS.description}</Field.Hint>
          </Field.Root>
        </Flex>
      </Box>

      <Box>
        <Typography variant="delta" fontWeight="bold">
          Assets
        </Typography>
        <Flex gap={4} marginTop={3} direction={{ initial: 'column', medium: 'row' }}>
          <Box
            width="100%"
            padding={4}
            borderColor="neutral200"
            borderStyle="solid"
            borderWidth="1px"
            hasRadius
          >
            <Typography variant="pi" fontWeight="bold">
              Logo (jpg, jpeg, png — max 150KB, 400×200px)
            </Typography>
            <Box marginTop={2} marginBottom={2}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo preview" style={{ maxHeight: 60, maxWidth: '100%' }} />
              ) : (
                <Typography variant="pi" textColor="neutral500">
                  No logo uploaded
                </Typography>
              )}
            </Box>
            <Flex gap={2}>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && onLogoSelect(e.target.files[0])}
              />
              <Button
                size="S"
                variant="secondary"
                startIcon={<Upload />}
                onClick={() => logoInputRef.current?.click()}
              >
                Upload
              </Button>
              {logoUrl && (
                <Button size="S" variant="danger-light" startIcon={<Trash />} onClick={onLogoRemove}>
                  Remove
                </Button>
              )}
            </Flex>
          </Box>

          <Box
            width="100%"
            padding={4}
            borderColor="neutral200"
            borderStyle="solid"
            borderWidth="1px"
            hasRadius
          >
            <Typography variant="pi" fontWeight="bold">
              Favicon (png, gif, ico — max 150KB, 96×96px)
            </Typography>
            <Box marginTop={2} marginBottom={2}>
              {faviconUrl ? (
                <img src={faviconUrl} alt="Favicon preview" style={{ maxHeight: 40, maxWidth: '100%' }} />
              ) : (
                <Typography variant="pi" textColor="neutral500">
                  No favicon uploaded
                </Typography>
              )}
            </Box>
            <Flex gap={2}>
              <input
                ref={faviconInputRef}
                type="file"
                accept="image/png,image/gif,image/x-icon"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && onFaviconSelect(e.target.files[0])}
              />
              <Button
                size="S"
                variant="secondary"
                startIcon={<Upload />}
                onClick={() => faviconInputRef.current?.click()}
              >
                Upload
              </Button>
              {faviconUrl && (
                <Button size="S" variant="danger-light" startIcon={<Trash />} onClick={onFaviconRemove}>
                  Remove
                </Button>
              )}
            </Flex>
          </Box>
        </Flex>
      </Box>

      <Box>
        <Typography variant="delta" fontWeight="bold">
          Footer
        </Typography>
        <Flex gap={4} marginTop={3} direction={{ initial: 'column', medium: 'row' }} alignItems="start">
          <Flex direction="column" gap={4} width="100%" alignItems="stretch">
            <Field.Root>
              <Field.Label>Footer Text</Field.Label>
              <Field.Input
                value={value.footer.footer_text}
                maxLength={FIELD_LIMITS.footer_text}
                onChange={(e: any) => updateFooter('footer_text', e.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Contact Email</Field.Label>
              <Field.Input
                type="email"
                value={value.footer.contact_email}
                maxLength={FIELD_LIMITS.contact_email}
                onChange={(e: any) => updateFooter('contact_email', e.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Copyright Text</Field.Label>
              <Field.Input
                value={value.footer.copyright_text}
                maxLength={FIELD_LIMITS.copyright_text}
                onChange={(e: any) => updateFooter('copyright_text', e.target.value)}
              />
            </Field.Root>
            <Flex alignItems="center" gap={3}>
              <Switch
                checked={value.footer.display_powered_by}
                onCheckedChange={(checked: boolean) => updateFooter('display_powered_by', checked)}
              />
              <Typography variant="omega">Powered by Upsnap</Typography>
            </Flex>
          </Flex>

          <Flex direction="column" gap={4} width="100%" alignItems="stretch">
            <Field.Root>
              <Field.Label>Support URL</Field.Label>
              <Field.Input
                value={value.links.support_url}
                maxLength={FIELD_LIMITS.url}
                onChange={(e: any) => updateLinks('support_url', e.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Privacy Policy URL</Field.Label>
              <Field.Input
                value={value.links.privacy_url}
                maxLength={FIELD_LIMITS.url}
                onChange={(e: any) => updateLinks('privacy_url', e.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Terms of Service URL</Field.Label>
              <Field.Input
                value={value.links.tos_url}
                maxLength={FIELD_LIMITS.url}
                onChange={(e: any) => updateLinks('tos_url', e.target.value)}
              />
            </Field.Root>
          </Flex>
        </Flex>
      </Box>

      <Box>
        <Typography variant="delta" fontWeight="bold">
          Display Settings
        </Typography>
        <Flex gap={4} marginTop={3} alignItems="end" direction={{ initial: 'column', medium: 'row' }}>
          <Field.Root>
            <Field.Label>Accent Color</Field.Label>
            <Flex gap={2} alignItems="center">
              <input
                type="color"
                value={value.display_config.accent_color}
                onChange={(e) => updateDisplay('accent_color', e.target.value)}
                style={{ width: 40, height: 40, border: 'none', padding: 0, background: 'none' }}
              />
              <Field.Input
                value={value.display_config.accent_color}
                onChange={(e: any) => updateDisplay('accent_color', e.target.value)}
                style={{ width: 120 }}
              />
            </Flex>
          </Field.Root>
          <Field.Root>
            <Field.Label>History Range Days</Field.Label>
            <SingleSelect
              value={String(value.display_config.history_range_days)}
              onChange={(v: any) => updateDisplay('history_range_days', Number(v))}
            >
              <SingleSelectOption value="7">7 days</SingleSelectOption>
              <SingleSelectOption value="30">30 days</SingleSelectOption>
              <SingleSelectOption value="90">90 days</SingleSelectOption>
            </SingleSelect>
          </Field.Root>
          <Flex alignItems="center" gap={3} paddingBottom={2}>
            <Switch
              checked={value.display_config.show_uptime_percentage}
              onCheckedChange={(checked: boolean) => updateDisplay('show_uptime_percentage', checked)}
            />
            <Typography variant="omega">Show Uptime Percentage</Typography>
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
}
