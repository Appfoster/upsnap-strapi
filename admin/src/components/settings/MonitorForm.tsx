import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  TextInput,
  CardBody,
  SingleSelect,
  SingleSelectOption,
  Typography,
  Flex,
  Box,
  Field,
} from '@strapi/design-system';
import { Monitor, monitorSchema, VALID_HOST_REGEX, Keyword } from '../../utils/types';
import { toast } from 'react-toastify';
import { DEFAULT_REGION, MONITOR, MONITOR_TYPE, MONITOR_TYPE_OPTIONS } from '../../utils/constants';
import AdvancedSettings from './MonitorAdvancedSettings';
import { useParams, useNavigate } from 'react-router-dom';

import { clearAllStoredMonitors } from '../../utils/userStorage';
import NotificationChannelsIntegration from './NotificationChannelsIntegration';
// import { TagMultiSelect } from './TagMultiSelect';
import { RegionsMultiSelect } from './RegionMultiSelect';
import { fetchMonitorSettings, request, settingsToConfig } from '../../utils/helpers';

// import { useMonitorPolling } from '../../hooks/monitor/useMonitorPolling';
// import PortAdvancedSettings from './PortAdvancedSettings';
// import KeywordInput from './KeyWordInput';
// import KeywordAdvancedSettings from './KeywordAdvancedSettings';

interface Props {
  monitor?: Monitor | null;
  mode: 'create' | 'edit';
  handleCancelEdit?: () => void;
}

export default function MonitorForm({ monitor, mode, handleCancelEdit }: Props) {
  // const router = useRouter();
  const [monitorType, setMonitorType] = useState<string>(MONITOR_TYPE.WEBSITE);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    service_type: MONITOR_TYPE.WEBSITE,
    channel_ids: [] as string[],
    config: {
      meta: {
        url: 'https://',
        timeout: 5,
        follow_redirects: true,
      },
      services: {
        ssl: {
          enabled: true,
          monitor_interval: 86400,
          notify_days_before_expiry: 7,
        },
        domain: {
          enabled: true,
          monitor_interval: 86400,
          notify_days_before_expiry: 7,
        },
        uptime: {
          enabled: true,
          monitor_interval: 300,
        },
        lighthouse: {
          enabled: true,
          strategy: 'desktop',
          monitor_interval: MONITOR.LIGHTHOUSE_DEFAULT_INTERVAL_SECONDS,
        },
        broken_links: {
          enabled: true,
          monitor_interval: 86400,
        },
        mixed_content: {
          enabled: true,
          monitor_interval: 86400,
        },
      },
    },
  });

  // Port monitoring form data
  const [portFormData, setPortFormData] = useState({
    name: '',
    host: '',
    port: '',
    timeout: 5,
    monitor_interval: 300,
  });

  // Keyword monitoring form data
  const [keywordFormData, setKeywordFormData] = useState({
    name: '',
    url: 'https://',
    keywords: [] as Keyword[],
    timeout: 10,
    followRedirects: true,
    matchAll: false,
    monitor_interval: 300,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    url?: string;
    primaryRegion?: string;
    host?: string;
    port?: string;
    monitor_interval?: string;
    keywords?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([DEFAULT_REGION.id]);
  const [primaryRegionId, setPrimaryRegionId] = useState<string | null>(DEFAULT_REGION.id);
  const [availableRegions, setAvailableRegions] = useState<any[]>([]);
  //   const { startPolling } = useMonitorPolling();

  // Fetch available regions
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const result = await request('/regions', {
          method: 'GET',
        });
        if (!result) {
          throw new Error('Failed to fetch regions');
        }
        setAvailableRegions(result.regionsData.data || []);
      } catch (error) {
        console.error('Error fetching regions:', error);
      }
    };

    fetchRegions();
  }, []);

  useEffect(() => {
    if (monitor && mode === 'edit') {
      // Fetch monitor settings from the new API endpoint
      const loadMonitorSettings = async () => {
        try {
          const settings = await fetchMonitorSettings(monitor.id as string);
          if (settings) {
            // Set monitor type based on existing monitor
            const serviceType = monitor.service_type || MONITOR_TYPE.WEBSITE;
            setMonitorType(serviceType);

            const config = settingsToConfig(settings.settings);

            if (serviceType === MONITOR_TYPE.PORT) {
              // Seed port monitoring form data
              setPortFormData({
                name: monitor.name || '',
                host: config.meta?.host || '',
                port: String(config.meta?.port || ''),
                timeout: config.meta?.timeout || 5,
                monitor_interval: config.services?.port_check?.monitor_interval || 300,
              });
              setSelectedTagIds(monitor.tag_ids || []);
              if (monitor.channel_ids) {
                setFormData((prev) => ({
                  ...prev,
                  channel_ids: monitor.channel_ids,
                }));
              }
            } else if (serviceType === MONITOR_TYPE.KEYWORD) {
              // Seed keyword monitoring form data
              const keywordService = (config.services?.keyword || {}) as {
                keywords?: Keyword[];
                match_all?: boolean;
                monitor_interval?: number;
              };
              const keywords = keywordService.keywords || [];
              setKeywordFormData({
                name: monitor.name || '',
                url: config.meta?.url || 'https://',
                keywords: keywords,
                timeout: config.meta?.timeout || 10,
                followRedirects: config.meta?.follow_redirects ?? true,
                matchAll: keywordService.match_all ?? false,
                monitor_interval: keywordService.monitor_interval || 300,
              });
              setSelectedTagIds(monitor.tag_ids || []);
              if (monitor.channel_ids) {
                setFormData((prev) => ({
                  ...prev,
                  channel_ids: monitor.channel_ids,
                }));
              }
            } else {
              // ensure https-only checks are disabled if URL is not https
              const url = config.meta?.url || '';
              const isHttps = String(url).startsWith('https://');
              const services = {
                ...config.services,
              };

              if (!isHttps) {
                services.lighthouse = {
                  ...services.lighthouse,
                  enabled: false,
                };
                services.ssl = {
                  ...services.ssl,
                  enabled: false,
                };
                services.mixed_content = {
                  ...services.mixed_content,
                  enabled: false,
                };
              }
              setFormData((prev) => ({
                ...prev,
                name: monitor.name,
                config: {
                  meta: {
                    url: config.meta?.url || 'https://',
                    timeout: config.meta?.timeout ?? 5,
                    follow_redirects: config.meta?.follow_redirects ?? true,
                  },
                  services: services as typeof prev.config.services,
                },
                channel_ids: monitor.channel_ids,
              }));
              setSelectedTagIds(monitor.tag_ids || []);

              // Seed regions data from incoming monitor (new array format)
              if (monitor.regions && Array.isArray(monitor.regions)) {
                const regionIds = monitor.regions.map((r) => r.id);
                const primaryRegion = monitor.regions.find((r) => r.is_primary);
                setSelectedRegionIds(regionIds);
                setPrimaryRegionId(primaryRegion?.id || null);
              }
            }
          } else {
            toast.error('Failed to load monitor settings');
          }
        } catch (error) {
          console.error('Error loading monitor settings:', error);
          toast.error('Failed to load monitor settings');
        }
      };

      loadMonitorSettings();
    } else {
      setFormData((prev) => ({
        ...prev,
        name: '',
        url: 'https://',
        config: {
          meta: {
            url: 'https://',
            timeout: 5,
            follow_redirects: true,
          },
          services: prev.config.services,
        },
        channel_ids: [],
      }));
      setKeywordFormData({
        name: '',
        url: 'https://',
        keywords: [],
        timeout: 10,
        followRedirects: true,
        matchAll: false,
        monitor_interval: 300,
      });
      setPortFormData({
        name: '',
        host: '',
        port: '',
        timeout: 5,
        monitor_interval: 300,
      });
    }

    setErrors({});
  }, [monitor, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Build regions array in new format
  const buildRegionsPayload = () => {
    return selectedRegionIds.map((regionId) => {
      const region = availableRegions.find((r) => r.id === regionId);
      return {
        id: regionId,
        name: region?.name || '',
        ...(primaryRegionId === regionId && { is_primary: true }),
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate primary region (only for website monitoring)
    if (monitorType === MONITOR_TYPE.WEBSITE && !primaryRegionId) {
      setErrors((prev) => ({
        ...prev,
        primaryRegion: 'A primary region must be selected',
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      let result;

      if (monitorType === MONITOR_TYPE.PORT) {
        // Validate port form data
        const portNumber = parseInt(portFormData.port, 10);
        const fieldErrors: any = {};

        if (!portFormData.name.trim()) {
          fieldErrors.name = 'Name is required';
        }

        if (!portFormData.host.trim()) {
          fieldErrors.host = 'Host is required';
        } else if (!VALID_HOST_REGEX.test(portFormData.host.trim())) {
          fieldErrors.host =
            'Please enter a valid domain or IP address (e.g., example.com or 192.168.1.1)';
        }

        if (!portFormData.port) {
          fieldErrors.port = 'Port is required';
        } else if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
          fieldErrors.port = 'Port must be between 1 and 65535';
        }

        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          setIsSubmitting(false);
          return;
        }

        const payload = {
          name: portFormData.name.trim(),
          service_type: MONITOR_TYPE.PORT,
          url: `${portFormData.host.trim()}:${portNumber}`,
          config: {
            meta: {
              host: portFormData.host.trim(),
              port: portNumber,
              timeout: portFormData.timeout,
            },
            services: {
              port_check: {
                enabled: true,
                monitor_interval: portFormData.monitor_interval,
              },
            },
          },
          channel_ids: formData.channel_ids,
          tag_ids: selectedTagIds,
          ...(mode === 'create' ? { is_enabled: true } : { id: monitor?.id }),
        };

        result = await request('/monitors', {
          method: mode === 'create' ? 'POST' : 'PATCH',
          data: payload,
        });
      } else if (monitorType === MONITOR_TYPE.KEYWORD) {
        // Validate keyword form data
        const fieldErrors: any = {};

        if (!keywordFormData.name.trim()) {
          fieldErrors.name = 'Name is required';
        }

        if (!keywordFormData.url.trim()) {
          fieldErrors.url = 'URL is required';
        } else {
          const urlRegex = /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/;
          if (!urlRegex.test(keywordFormData.url.trim())) {
            fieldErrors.url = 'Please enter a valid URL starting with http:// or https://';
          }
        }

        if (keywordFormData.keywords.length === 0) {
          fieldErrors.keywords = 'At least one keyword is required';
        }

        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          setIsSubmitting(false);
          return;
        }

        const payload = {
          name: keywordFormData.name.trim(),
          service_type: MONITOR_TYPE.KEYWORD,
          url: keywordFormData.url.trim(),
          config: {
            meta: {
              url: keywordFormData.url.trim(),
              timeout: keywordFormData.timeout,
              follow_redirects: keywordFormData.followRedirects,
            },
            services: {
              keyword: {
                enabled: true,
                monitor_interval: keywordFormData.monitor_interval,
                keywords: keywordFormData.keywords,
                match_all: keywordFormData.matchAll,
              },
            },
          },
          channel_ids: formData.channel_ids,
          tag_ids: selectedTagIds,
          ...(mode === 'create' ? { is_enabled: true } : { id: monitor?.id }),
        };

        result = await request('/monitors', {
          method: mode === 'create' ? 'POST' : 'PUT',
          data: payload,
        });
      } else {
        // Website monitoring
        const validated = monitorSchema.parse(formData);
        if (mode === 'create') {
          const payload = {
            name: validated.name,
            service_type: MONITOR_TYPE.WEBSITE,
            config: {
              meta: {
                url: formData.config.meta.url,
                timeout: formData.config.meta.timeout,
                follow_redirects: formData.config.meta.follow_redirects,
              },
              services: formData.config.services,
            },
            channel_ids: formData.channel_ids,
            tag_ids: selectedTagIds,
            regions: buildRegionsPayload(),
            is_enabled: true,
          };

          result = await request('/monitors', {
            method: 'POST',
            data: payload,
          });
        } else {
          const payload = {
            name: validated.name,
            service_type: MONITOR_TYPE.WEBSITE,
            config: {
              meta: {
                url: formData.config.meta.url,
                timeout: formData.config.meta.timeout,
                follow_redirects: formData.config.meta.follow_redirects,
              },
              services: formData.config.services,
            },
            channel_ids: formData.channel_ids,
            tag_ids: selectedTagIds,
            regions: buildRegionsPayload(),
          };

          result = await request(`/monitors/${monitor?.id}`, {
            method: 'PUT',
            data: payload,
          });
        }
      }
      if (!result) return;

      if (result.monitorsData.status === 'success') {
        const monitorId = result.monitorsData.data.monitor.id;
        clearAllStoredMonitors();
        //  START POLLING
        // startPolling(monitorId);
        toast.success(
          mode === 'create' ? 'Monitor created successfully' : 'Monitor updated successfully'
        );
        if (handleCancelEdit) handleCancelEdit();
        navigate('/plugins/upsnap/settings');
        // router.push(ROUTES.MONITORS);
      } else {
        toast.error(result.monitorsData.data?.message || 'Something went wrong.');
      }
    } catch (err: any) {
      if (err.errors) {
        const fieldErrors: any = {};

        err.errors.forEach((e: any) => {
          const path = e.path.join('.');

          if (path === 'config.meta.url') {
            fieldErrors.url = e.message;
          }

          if (path === 'name') {
            fieldErrors.name = e.message;
          }
        });

        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateService = (serviceKey: string, updatedServiceData: any) => {
    setFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        services: {
          ...prev.config.services,
          [serviceKey]: updatedServiceData,
        },
      },
    }));
  };

  const updateMeta = (metaKey: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        meta: {
          ...prev.config.meta,
          [metaKey]: value,
        },
      },
    }));
  };

  const updateNotificationChannels = (ids: string[]) => {
    setFormData((prev) => ({
      ...prev,
      channel_ids: ids.map((id) => String(id)), // convert to strings
    }));
  };

  const handlePrimaryRegionChange = (regionId: string | null) => {
    setPrimaryRegionId(regionId);
    if (regionId && errors.primaryRegion) {
      setErrors((prev) => ({ ...prev, primaryRegion: undefined }));
    }
  };

  const handleCancel = () => {
    if (mode === 'edit' && handleCancelEdit) {
      handleCancelEdit();
      return;
    }
    navigate('/plugins/upsnap/settings');
  }
  return (
    <>
      <Typography variant="beta" as="h2" marginBottom={4} marginTop={2}>
        {mode === 'create' ? 'Create Monitor' : 'Edit Monitor'}
      </Typography>
      <Card marginTop={3}>
        <CardBody width="100%">
          <Flex direction="column" gap={6} width="100%">
            {/* Monitor Type Dropdown */}
            {/* <div className="tw-mb-6">
            <SingleSelect
              label="Monitor Type"
              value={monitorType}
              onChange={(val: string) => {
                if (val) {
                  setMonitorType(val);
                  setErrors({});
                }
              }}
              disabled={mode === 'edit'}
              className="tw-w-full"
            >
              {MONITOR_TYPE_OPTIONS.map((option) => (
                <SingleSelectOption key={option.value} value={option.value}>
                  {option.label}
                </SingleSelectOption>
              ))}
            </SingleSelect>
          </div> */}

            {/* Website Monitoring Form */}
            {monitorType === MONITOR_TYPE.WEBSITE && (
              <>
                <Flex direction="column" gap={4} width="100%">
                  {/* Name and URL Row */}
                  <Flex
                    direction={{ initial: 'column', medium: 'row' }}
                    gap={5}
                    marginBottom={3}
                    width="100%"
                  >
                    <Box width="100%">
                      <Field.Root error={errors.name}>
                        <Field.Label>Monitor name</Field.Label>

                        <Field.Input
                          type="text"
                          crossOrigin=""
                          size="L"
                          name="name"
                          placeholder="Monitor name"
                          value={formData.name}
                          onChange={handleChange}
                          error={errors.name}
                        />
                        <Field.Error />
                      </Field.Root>
                      {/* {errors.name && (
                    <p className="tw-text-xs tw-text-red-500 tw-mt-1"></p>
                  )} */}
                    </Box>
                    <Box width="100%">
                      <Field.Root error={errors.url}>
                        <Field.Label>URL to monitor</Field.Label>
                        <Field.Input
                          type="text"
                          crossOrigin=""
                          size="L"
                          name="url"
                          placeholder="URL to monitor"
                          value={formData.config.meta.url}
                          onChange={(e: any) => {
                            const value = e.target.value.trimStart();
                            setFormData((prev) => {
                              const newMeta = {
                                ...prev.config.meta,
                                url: value,
                              };
                              const isHttps = String(value).startsWith('https://');
                              const services = {
                                ...prev.config.services,
                              };

                              if (!isHttps) {
                                services.lighthouse = {
                                  ...services.lighthouse,
                                  enabled: false,
                                };
                                services.ssl = {
                                  ...services.ssl,
                                  enabled: false,
                                };
                                services.mixed_content = {
                                  ...services.mixed_content,
                                  enabled: false,
                                };
                              }

                              return {
                                ...prev,
                                config: {
                                  ...prev.config,
                                  meta: newMeta,
                                  services,
                                },
                              };
                            });

                            if (errors.url) {
                              setErrors((prev) => ({
                                ...prev,
                                url: undefined,
                              }));
                            }
                          }}
                        />
                        <Field.Error />
                      </Field.Root>
                    </Box>
                  </Flex>

                  {/* Tags and Regions Row */}
                  <Flex width="100%">
                    {/* <div className="tw-my-4">
                  <label className="tw-block tw-text-sm tw-font-semibold tw-mb-2 tw-text-gray-700">
                    Add tags
                  </label>
                  <p className="tw-text-xs tw-text-gray-500 tw-mb-2">
                    Tags will enable you to organise your monitors in a better way
                  </p>
                  <TagMultiSelect
                    selectedTagIds={selectedTagIds}
                    onTagsChange={setSelectedTagIds}
                  />
                </div> */}
                    <Box paddingTop={4} width="100%">
                      <Flex direction="column" gap={1} marginBottom={2} alignItems="start">
                        <Typography variant="epsilon">Monitoring regions</Typography>
                        <Typography textColor="neutral600" variant="pi">
                          Choose the regions where this monitor should be active
                        </Typography>
                      </Flex>
                      <RegionsMultiSelect
                        selectedRegionIds={selectedRegionIds}
                        onRegionsChange={setSelectedRegionIds}
                        primaryRegionId={primaryRegionId}
                        onPrimaryRegionChange={handlePrimaryRegionChange}
                      />

                      {errors.primaryRegion && (
                        <Typography textColor="danger600" variant="pi">
                          {errors.primaryRegion}
                        </Typography>
                      )}
                    </Box>
                  </Flex>
                  <Flex width="100%" direction="column" gap={2} alignItems="start">
                    <Typography variant="epsilon">Notifications</Typography>
                    {/* Notifications */}
                    <NotificationChannelsIntegration
                      value={formData.channel_ids}
                      onChange={(ids) => updateNotificationChannels(ids)}
                    />
                  </Flex>
                  <Flex width="100%" direction="column" gap={2} alignItems="start">
                    <Typography variant="epsilon">Advanced settings</Typography>
                    <AdvancedSettings
                      services={formData.config.services}
                      onServiceChange={updateService}
                      meta={formData.config.meta}
                      updateMeta={updateMeta}
                    />
                  </Flex>
                </Flex>

                <div className="tw-mt-6"></div>
              </>
            )}

            {/* Port Monitoring Form */}
            {/* {monitorType === MONITOR_TYPE.PORT && (
            <>
              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
                <div>
                  <Input
                    crossOrigin=""
                    size="lg"
                    name="portName"
                    label="Monitor name"
                    value={portFormData.name}
                    onChange={(e: any) => {
                      setPortFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                      if (errors.name) {
                        setErrors((prev) => ({
                          ...prev,
                          name: undefined,
                        }));
                      }
                    }}
                    error={!!errors.name}
                  />
                  {errors.name && (
                    <p className="tw-text-xs tw-text-red-500 tw-mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <Input
                    crossOrigin=""
                    size="lg"
                    name="host"
                    label="Host / Address"
                    placeholder="example.com or 192.168.1.1"
                    value={portFormData.host}
                    onChange={(e: any) => {
                      setPortFormData((prev) => ({
                        ...prev,
                        host: e.target.value.trim(),
                      }));
                      if (errors.host) {
                        setErrors((prev) => ({
                          ...prev,
                          host: undefined,
                        }));
                      }
                    }}
                    error={!!errors.host}
                  />
                  {errors.host && (
                    <p className="tw-text-xs tw-text-red-500 tw-mt-1">{errors.host}</p>
                  )}
                  <p className="tw-text-xs tw-text-gray-500 tw-mt-1">
                    Enter domain or IP only (no protocol or paths)
                  </p>
                </div>
              </div>

              
              {/* <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6 tw-my-4">
                <div>
                  <label className="tw-block tw-text-sm tw-font-semibold tw-mb-2 tw-text-gray-700">
                    Port
                  </label>
                  <p className="tw-text-xs tw-text-gray-500 tw-mb-2">
                    The network port to monitor (e.g. 80, 443, 3306). Port range: 1-65535
                  </p>
                  <Input
                    crossOrigin=""
                    size="lg"
                    name="port"
                    label="Port"
                    type="number"
                    min={1}
                    max={65535}
                    value={portFormData.port}
                    onChange={(e: any) => {
                      setPortFormData((prev) => ({
                        ...prev,
                        port: e.target.value,
                      }));
                      if (errors.port) {
                        setErrors((prev) => ({
                          ...prev,
                          port: undefined,
                        }));
                      }
                    }}
                    error={!!errors.port}
                  />
                  {errors.port && (
                    <p className="tw-text-xs tw-text-red-500 tw-mt-1">{errors.port}</p>
                  )}
                </div>

               
                <div className="">
                  <label className="tw-block tw-text-sm tw-font-semibold tw-mb-2 tw-text-gray-700">
                    Add tags
                  </label>
                  <p className="tw-text-xs tw-text-gray-500 tw-mb-2">
                    Tags will enable you to organise your monitors in a better way
                  </p>
                  <TagMultiSelect
                    selectedTagIds={selectedTagIds}
                    onTagsChange={setSelectedTagIds}
                  />
                </div> 
              </div> 

              
               <NotificationChannelsIntegration
                value={formData.channel_ids}
                onChange={(ids) => updateNotificationChannels(ids)}
              /> 

              
               <div className="tw-mt-6">
                <PortAdvancedSettings
                  timeout={portFormData.timeout}
                  onTimeoutChange={(value: number) => {
                    setPortFormData((prev) => ({
                      ...prev,
                      timeout: value,
                    }));
                  }}
                  monitorInterval={portFormData.monitor_interval}
                  onMonitorIntervalChange={(value: number) => {
                    setPortFormData((prev) => ({
                      ...prev,
                      monitor_interval: value,
                    }));
                  }}
                />
              </div> 
            </>
          )} */}

            {/* Keyword Monitoring Form */}
            {/* {monitorType === MONITOR_TYPE.KEYWORD && (
            <>
              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
                <div>
                  <Input
                    crossOrigin=""
                    size="lg"
                    name="keywordName"
                    label="Monitor name"
                    value={keywordFormData.name}
                    onChange={(e: any) => {
                      setKeywordFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                      if (errors.name) {
                        setErrors((prev) => ({
                          ...prev,
                          name: undefined,
                        }));
                      }
                    }}
                    error={!!errors.name}
                  />
                  {errors.name && (
                    <p className="tw-text-xs tw-text-red-500 tw-mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <Input
                    crossOrigin=""
                    size="lg"
                    name="keywordUrl"
                    label="URL"
                    placeholder="https://example.com"
                    value={keywordFormData.url}
                    onChange={(e: any) => {
                      setKeywordFormData((prev) => ({
                        ...prev,
                        url: e.target.value,
                      }));
                      if (errors.url) {
                        setErrors((prev) => ({
                          ...prev,
                          url: undefined,
                        }));
                      }
                    }}
                    error={!!errors.url}
                    className="tw-font-mono"
                  />
                  {errors.url && <p className="tw-text-xs tw-text-red-500 tw-mt-1">{errors.url}</p>}
                </div>
              </div>

              
              <div className="tw-my-4">
                <label className="tw-block tw-text-sm tw-font-semibold tw-mb-2 tw-text-gray-700">
                  Add tags
                </label>
                <p className="tw-text-xs tw-text-gray-500 tw-mb-2">
                  Tags will enable you to organise your monitors in a better way
                </p>
                <TagMultiSelect selectedTagIds={selectedTagIds} onTagsChange={setSelectedTagIds} />
              </div>
              
              <div className="tw-my-6">
                <KeywordInput
                  keywords={keywordFormData.keywords}
                  onKeywordsChange={(keywords: Keyword[]) => {
                    setKeywordFormData((prev) => ({
                      ...prev,
                      keywords,
                    }));
                    if (errors.keywords) {
                      setErrors((prev) => ({
                        ...prev,
                        keywords: undefined,
                      }));
                    }
                  }}
                  error={errors.keywords}
                />
              </div>

              
              <NotificationChannelsIntegration
                value={formData.channel_ids}
                onChange={(ids) => updateNotificationChannels(ids)}
              />

              
              <div className="tw-mt-6">
                <KeywordAdvancedSettings
                  timeout={keywordFormData.timeout}
                  onTimeoutChange={(value: number) => {
                    setKeywordFormData((prev) => ({
                      ...prev,
                      timeout: value,
                    }));
                  }}
                  followRedirects={keywordFormData.followRedirects}
                  onFollowRedirectsChange={(value: boolean) => {
                    setKeywordFormData((prev) => ({
                      ...prev,
                      followRedirects: value,
                    }));
                  }}
                  matchAll={keywordFormData.matchAll}
                  onMatchAllChange={(value: boolean) => {
                    setKeywordFormData((prev) => ({
                      ...prev,
                      matchAll: value,
                    }));
                  }}
                  monitorInterval={keywordFormData.monitor_interval}
                  onMonitorIntervalChange={(value: number) => {
                    setKeywordFormData((prev) => ({
                      ...prev,
                      monitor_interval: value,
                    }));
                  }}
                />
              </div>
            </>
          )} */}
            {/* Submit Button */}
            <Flex justifyContent="flex-end" gap={3} marginTop={2} width="100%" marginBottom={4}>
              <Button variant="danger-light" size="M" onClick={() => handleCancel()}>
                Cancel
              </Button>
              <Button disabled={isSubmitting} size="M" onClick={handleSubmit}>
                {isSubmitting
                  ? 'Saving...'
                  : mode === 'create'
                    ? 'Create Monitor'
                    : 'Update Monitor'}
              </Button>
            </Flex>
          </Flex>
        </CardBody>
      </Card>
      {/* Submit Button */}
    </>
  );
}
