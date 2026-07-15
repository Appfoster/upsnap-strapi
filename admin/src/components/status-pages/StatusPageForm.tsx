import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  TextInput,
  CardBody,
  MultiSelect,
  MultiSelectOption,
  Typography,
  Tabs,
  Switch,
  Field,
  Textarea,
  Flex,
  Box,
} from '@strapi/design-system';
import {
  StatusPage,
  StatusPageFormData,
  statusPageSchema,
  CustomizationState,
  DEFAULT_CUSTOMIZATION,
} from '../../utils/types';
import { Monitor } from '../../utils/types';
import { request } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomizationTab from './CustomizationTab';
import AnnouncementsTab from './AnnouncementsTab';

interface Props {
  statusPage?: StatusPage | null;
  mode: 'create' | 'edit';
}

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function CreateUpdateForm({ statusPage, mode }: Props) {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<StatusPageFormData>({
    name: '',
    monitor_ids: [],
  });
  const [isProtected, setIsProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [customization, setCustomization] = useState<CustomizationState>(DEFAULT_CUSTOMIZATION);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; monitor_ids?: string; password?: string }>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (statusPage && mode === 'edit') {
      setFormData({
        name: statusPage.name,
        monitor_ids: statusPage.monitor_ids?.map(String) || [],
      });
      setIsProtected(statusPage.is_protected || false);
      setCustomization({ ...DEFAULT_CUSTOMIZATION, ...(statusPage.customization || {}) });
      setLogoUrl(statusPage.customization?.asset_urls?.logo || null);
      setFaviconUrl(statusPage.customization?.asset_urls?.favicon || null);
    } else {
      setFormData({ name: '', monitor_ids: [] });
      setIsProtected(false);
      setCustomization(DEFAULT_CUSTOMIZATION);
      setLogoUrl(null);
      setFaviconUrl(null);
    }
    setPassword('');
    setErrors({});
  }, [statusPage, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  useEffect(() => {
    fetchMonitors();
  }, []);

  const fetchMonitors = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await request('/monitors', {
        method: 'GET',
      });
      if (!data) return;

      if (data.monitorsData?.status === 'success') {
        setMonitors(data.monitorsData?.data.monitors || []);
      }
    } catch (error) {
      console.log('Error fetching monitors:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateLogo = (file: File) => {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Logo must be a JPG or PNG file');
      return false;
    }
    if (file.size > 150 * 1024) {
      toast.error('Logo must be under 150KB');
      return false;
    }
    return true;
  };

  const validateFavicon = (file: File) => {
    if (!['image/png', 'image/gif', 'image/x-icon', 'image/vnd.microsoft.icon'].includes(file.type)) {
      toast.error('Favicon must be a PNG, GIF, or ICO file');
      return false;
    }
    if (file.size > 150 * 1024) {
      toast.error('Favicon must be under 150KB');
      return false;
    }
    return true;
  };

  const uploadAsset = async (pageId: string, file: File, assetType: 'logo' | 'favicon') => {
    const form = new FormData();
    form.append('file', file);
    form.append('asset_type', assetType);
    return request(`/status-pages/${pageId}/upload`, { method: 'POST', data: form });
  };

  const handleLogoSelect = async (file: File) => {
    if (!validateLogo(file)) return;
    if (mode === 'edit' && statusPage?.id) {
      const result = await uploadAsset(statusPage.id, file, 'logo');
      if (result?.uploadData?.status === 'success') {
        setLogoUrl(result.uploadData.data?.asset_urls?.logo || URL.createObjectURL(file));
        toast.success('Logo uploaded');
      } else {
        toast.error('Failed to upload logo');
      }
    } else {
      setLogoFile(file);
      setLogoUrl(URL.createObjectURL(file));
    }
  };

  const handleFaviconSelect = async (file: File) => {
    if (!validateFavicon(file)) return;
    if (mode === 'edit' && statusPage?.id) {
      const result = await uploadAsset(statusPage.id, file, 'favicon');
      if (result?.uploadData?.status === 'success') {
        setFaviconUrl(result.uploadData.data?.asset_urls?.favicon || URL.createObjectURL(file));
        toast.success('Favicon uploaded');
      } else {
        toast.error('Failed to upload favicon');
      }
    } else {
      setFaviconFile(file);
      setFaviconUrl(URL.createObjectURL(file));
    }
  };

  const handleLogoRemove = async () => {
    if (mode === 'edit' && statusPage?.id) {
      await request(`/status-pages/${statusPage.id}/upload?asset_type=logo`, { method: 'DELETE' });
    }
    setLogoFile(null);
    setLogoUrl(null);
  };

  const handleFaviconRemove = async () => {
    if (mode === 'edit' && statusPage?.id) {
      await request(`/status-pages/${statusPage.id}/upload?asset_type=favicon`, { method: 'DELETE' });
    }
    setFaviconFile(null);
    setFaviconUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isProtected && password && !PASSWORD_REGEX.test(password)) {
      setErrors((prev) => ({
        ...prev,
        password:
          'Password must be at least 8 characters and include an uppercase letter, lowercase letter, and a number',
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      const validated = statusPageSchema.parse(formData);

      const payload: any = {
        name: validated.name,
        monitor_ids: validated.monitor_ids,
        is_protected: isProtected,
        customization: {
          header: customization.header,
          footer: customization.footer,
          links: customization.links,
          password_prompt: customization.password_prompt,
          display_config: customization.display_config,
        },
      };
      if (password) {
        payload.password = password;
      }

      let result;
      if (mode === 'create') {
        payload.is_published = true;
        result = await request('/status-pages', { method: 'POST', data: payload });
      } else {
        payload.id = statusPage?.id;
        result = await request('/status-pages', { method: 'PUT', data: payload });
      }

      if (!result) return;

      if (result?.statusPagesData?.status === 'success') {
        toast.success(`Status page ${mode === 'create' ? 'created' : 'updated'} successfully`);

        if (mode === 'create') {
          const newId = result.statusPagesData.data?.status_page?.id;
          if (newId && (logoFile || faviconFile)) {
            if (logoFile) await uploadAsset(newId, logoFile, 'logo');
            if (faviconFile) await uploadAsset(newId, faviconFile, 'favicon');
          }
          navigate(newId ? `/plugins/upsnap/status-pages/${newId}` : '/plugins/upsnap/status-pages');
        }
      } else {
        toast.error(
          result?.statusPagesData?.message ||
            `Failed to ${mode === 'create' ? 'create' : 'update'} status page`
        );
      }
    } catch (err: any) {
      if (err.errors) {
        const fieldErrors: any = {};

        err.errors.forEach((e: any) => {
          const path = e.path.join('.');

          if (path === 'name') {
            fieldErrors.name = e.message;
          }
          if (path === 'monitor_ids') {
            fieldErrors.monitor_ids = e.message;
          }
        });

        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancel = () => {
    navigate('/plugins/upsnap/status-pages');
  };

  const monitorOptions = monitors?.map((m) => ({
    label: m.name || m.config?.meta?.url || 'Unknown',
    value: String(m.id),
  }));

  const filteredOptions = monitorOptions.filter((option) =>
    option.label.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <>
      <Typography variant="beta" marginBottom={4} marginTop={2}>
        {mode === 'create' ? 'Add Status Page' : 'Edit Status Page'}
      </Typography>
      <Card marginTop={3} width="100%">
        <CardBody width="100%" direction="column">
          <Tabs.Root value={activeTab} onValueChange={setActiveTab} variant="simple">
            <Tabs.List aria-label="Status page settings">
              <Tabs.Trigger value="general">General</Tabs.Trigger>
              <Tabs.Trigger value="customization">Customization</Tabs.Trigger>
              {mode === 'edit' && <Tabs.Trigger value="announcements">Announcements</Tabs.Trigger>}
            </Tabs.List>

            <Tabs.Content value="general">
              <Flex direction="column" width="100%" paddingTop={4} gap={5} alignItems="flex-start">
                <Flex
                  justifyContent="space-around"
                  width="100%"
                  gap={4}
                  direction={{ initial: 'column', medium: 'row' }}
                >
                  <Box width="100%">
                    <TextInput
                      name="name"
                      placeholder="Name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </Box>
                  <Box width="100%">
                    <MultiSelect
                      withTags
                      placeholder="Select monitors..."
                      value={formData.monitor_ids}
                      onChange={(selected: any) =>
                        setFormData((prev) => ({
                          ...prev,
                          monitor_ids: selected,
                        }))
                      }
                      disabled={isLoading}
                    >
                      {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                          <MultiSelectOption key={option.value} value={option.value}>
                            {option.label}
                          </MultiSelectOption>
                        ))
                      ) : (
                        <MultiSelectOption value="" disabled>
                          No monitors found
                        </MultiSelectOption>
                      )}
                    </MultiSelect>
                    {errors.monitor_ids && (
                      <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>
                        {errors.monitor_ids}
                      </p>
                    )}
                  </Box>
                </Flex>

                <Box width="100%">
                  <Flex alignItems="center" gap={3}>
                    <Switch checked={isProtected} onCheckedChange={setIsProtected} />
                    <Typography variant="omega" fontWeight="bold">
                      Password Protected
                    </Typography>
                  </Flex>

                  {isProtected && (
                    <Flex direction="column" gap={4} marginTop={4} alignItems="stretch" width="100%">
                      <Field.Root error={errors.password}>
                        <Field.Label>Password</Field.Label>
                        <Field.Input
                          type="password"
                          value={password}
                          placeholder={
                            mode === 'edit' ? 'Leave blank to keep current password' : ''
                          }
                          onChange={(e: any) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                          }}
                        />
                        <Field.Error />
                      </Field.Root>
                      <Field.Root hint={`${customization.password_prompt.length}/100`}>
                        <Field.Label>Password Prompt Message</Field.Label>
                        <Textarea
                          value={customization.password_prompt}
                          maxLength={100}
                          onChange={(e: any) =>
                            setCustomization((prev) => ({ ...prev, password_prompt: e.target.value }))
                          }
                        />
                        <Field.Hint />
                      </Field.Root>
                    </Flex>
                  )}
                </Box>
              </Flex>
            </Tabs.Content>

            <Tabs.Content value="customization">
              <CustomizationTab
                value={customization}
                onChange={setCustomization}
                logoUrl={logoUrl}
                faviconUrl={faviconUrl}
                onLogoSelect={handleLogoSelect}
                onFaviconSelect={handleFaviconSelect}
                onLogoRemove={handleLogoRemove}
                onFaviconRemove={handleFaviconRemove}
              />
            </Tabs.Content>

            {mode === 'edit' && statusPage?.id && (
              <Tabs.Content value="announcements">
                <AnnouncementsTab statusPageId={statusPage.id} />
              </Tabs.Content>
            )}
          </Tabs.Root>

          {activeTab !== 'announcements' && (
            <Flex gap={4} justifyContent="flex-end" paddingTop={5} width="100%" marginBottom={2}>
              <Button disabled={isSubmitting} size="M" onClick={handleSubmit}>
                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
              </Button>
              <Button variant="danger-light" onClick={() => handleCancel()} size="M">
                Cancel
              </Button>
            </Flex>
          )}
        </CardBody>
      </Card>
    </>
  );
}
