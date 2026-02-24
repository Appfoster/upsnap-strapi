import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  TextInput,
  CardBody,
  MultiSelect,
  MultiSelectOption,
  Typography,
} from '@strapi/design-system';
import { StatusPage, StatusPageFormData, statusPageSchema } from '../../utils/types';
import { Monitor } from '../../utils/types';
import { request } from '../../utils/helpers';
import { Flex } from '@strapi/design-system';
import { Box } from '@strapi/design-system';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface Props {
  statusPage?: StatusPage | null;
  mode: 'create' | 'edit';
}

export default function CreateUpdateForm({ statusPage, mode }: Props) {
  const [formData, setFormData] = useState<StatusPageFormData>({
    name: '',
    monitor_ids: [],
  });
  const [errors, setErrors] = useState<{ name?: string; monitor_ids?: string }>({});
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
    } else {
      setFormData({
        name: '',
        monitor_ids: [],
      });
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validated = statusPageSchema.parse(formData);
      let result;
      if (mode === 'create') {
        const payload = {
          name: validated.name,
          monitor_ids: validated.monitor_ids,
          is_published: true,
        };

        result = await request('/status-pages', {
          method: 'POST',
          data: payload,
        });
      } else {
        const payload = {
          id: statusPage?.id,
          name: validated.name,
          monitor_ids: validated.monitor_ids,
        };

        result = await request('/status-pages', {
          method: 'PUT',
          data: payload,
        });
      }

      if (!result) return;

      if (result?.statusPagesData?.status === 'success') {
        toast.success(`Status page ${mode === 'create' ? 'created' : 'updated'} successfully`);
        navigate('/plugins/upsnap/status-pages');
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
      <Typography variant="beta" as="h2" marginBottom={4} marginTop={2}>
        {mode === 'create' ? 'Add Status Page' : 'Edit Status Page'}
      </Typography>
      <Card marginTop={3} width="100%">
        <CardBody width="100%">
          <Flex direction="column" width="100%">
            <Flex
              justifyContent="space-around"
              width="100%"
              gap={4}
              direction={{ initial: 'column', medium: 'row' }}
            >
              <Box width="100%">
                <TextInput
                  name="name"
                  label="Name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="Enter status page name"
                />
              </Box>
              <Box width="100%">
                <MultiSelect
                  withTags
                  label="Monitors"
                  placeholder="Select monitors..."
                  value={formData.monitor_ids}
                  onChange={(selected: any) =>
                    setFormData((prev) => ({
                      ...prev,
                      monitor_ids: selected,
                    }))
                  }
                  onInputChange={setSearchInput}
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

            <Flex gap={4} justifyContent="flex-end" paddingTop={5} width="100%" marginBottom={2}>
              <Button disabled={isSubmitting} size="M" onClick={handleSubmit}>
                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
              </Button>
              <Button variant="danger-light" onClick={() => handleCancel()} size="M">
                Cancel
              </Button>
            </Flex>
          </Flex>
        </CardBody>
      </Card>
    </>
  );
}
