import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Modal, Button, Typography, Field, Box, Flex } from '@strapi/design-system';
import { Eye, EyeStriked } from '@strapi/icons';
import { z } from 'zod';
import { PLAN_TYPES } from '../../../utils/constants';
import { toast } from 'react-toastify';
import { getUserData, getUserDetailsCached, UserDetails } from '../../../utils/userStorage';
import { request } from '../../../utils/helpers';
import { SupportedChannel, ConfigField } from '../../../hooks/useSupportedIntegrations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  channel: SupportedChannel | null;
  editData?: any | null;
  onSuccess: () => void;
}

// Helper to get nested value from object using dot notation (e.g., "recipients.to")
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Helper to set nested value in object using dot notation
const setNestedValue = (obj: any, path: string, value: any): any => {
  const keys = path.split('.');
  const result = { ...obj };
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    current[key] = current[key] ? { ...current[key] } : {};
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return result;
};

export default function IntegrationFormModal({
  isOpen,
  onClose,
  channel,
  editData,
  onSuccess,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({
    name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [userDataEmail, setUserDataEmail] = useState<string>('');
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const userData = getUserData();
    setUserDataEmail(userData?.user?.email || '');
    (async () => {
      setUserDetails(await getUserDetailsCached());
    })();
  }, []);

  // Build initial form data based on channel config schema
  const buildInitialFormData = useCallback(() => {
    if (!channel) return { name: '' };

    const initialData: Record<string, any> = { name: '' };

    channel.config_schema.fields.forEach((field) => {
      // Handle special case for email field in trial mode
      if (
        field.type === 'email' &&
        channel.type === 'email' &&
        field.name === 'recipients.to' &&
        userDetails?.user?.subscription_type === PLAN_TYPES.TRIAL
      ) {
        setNestedValue(initialData, field.name, userDataEmail);
      } else {
        // Initialize with empty string
        const keys = field.name.split('.');
        let current = initialData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = '';
      }
    });

    return initialData;
  }, [channel, userDetails, userDataEmail]);

  // Reset form when modal opens or channel changes
  useEffect(() => {
    if (!isOpen || !channel) return;

    if (!editData) {
      setFormData(buildInitialFormData());
      setErrors({});
    }
  }, [isOpen, channel, editData]);

  // Populate form with edit data
  useEffect(() => {
    if (!editData || !channel) return;

    const populatedData: Record<string, any> = {
      name: editData.name || '',
    };

    // Populate fields from editData.config
    channel.config_schema.fields.forEach((field) => {
      const value = getNestedValue(editData.config, field.name);
      if (value !== undefined) {
        const keys = field.name.split('.');
        let current = populatedData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
      }
    });

    setFormData(populatedData);
    setErrors({});
  }, [editData, channel]);

  // Build dynamic Zod schema based on channel config
  const dynamicSchema = useMemo(() => {
    if (!channel)
      return {
        schema: z.object({ name: z.string().min(2, 'Name is required') }),
        fieldMap: {} as Record<string, string>,
      };

    let schema: Record<string, z.ZodTypeAny> = {
      name: z.string().min(2, 'Name is required'),
    };

    const fieldMap: Record<string, string> = {}; // schemaKey -> fieldName mapping

    channel.config_schema.fields.forEach((field) => {
      let fieldSchema: z.ZodTypeAny;

      switch (field.type) {
        case 'email':
          fieldSchema = z.string().email('Invalid email address');
          break;
        case 'url':
          fieldSchema = z.string().url('Invalid URL');
          break;
        case 'password':
        case 'text':
          fieldSchema = z.string().min(1, `${field.label} is required`);
          break;
        case 'phone_array':
          fieldSchema = z.string().min(1, `${field.label} is required`);
          break;
        default:
          fieldSchema = z.string();
      }

      if (!field.required) {
        fieldSchema = fieldSchema.optional().or(z.literal(''));
      }

      // Use sanitized field name for schema key (replace dots with underscores)
      const schemaKey = field.name.replace(/\./g, '_');
      schema[schemaKey] = fieldSchema;
      fieldMap[schemaKey] = field.name; // Store the mapping
    });

    return { schema: z.object(schema), fieldMap };
  }, [channel]);

  // Validate a single field
  const validateField = useCallback(
    (fieldName: string, value: string) => {
      const schemaKey = fieldName.replace(/\./g, '_');
      const fieldSchema = (dynamicSchema.schema.shape as Record<string, z.ZodTypeAny>)[schemaKey];

      if (!fieldSchema) return;

      try {
        fieldSchema.parse(value);
        setErrors((prev) => ({ ...prev, [fieldName]: '' }));
      } catch (err: any) {
        const msg = err?.issues?.[0]?.message || 'Invalid value';
        setErrors((prev) => ({ ...prev, [fieldName]: msg }));
      }
    },
    [dynamicSchema]
  );

  // Update form field value
  const updateFieldValue = useCallback(
    (fieldName: string, value: string) => {
      setFormData((prev) => setNestedValue(prev, fieldName, value));
      validateField(fieldName, value);
    },
    [validateField]
  );

  // Get field value from form data
  const getFieldValue = useCallback(
    (fieldName: string): string => {
      return getNestedValue(formData, fieldName) || '';
    },
    [formData]
  );

  // Build config payload from form data
  const buildConfigPayload = useCallback(() => {
    if (!channel) return {};

    const config: Record<string, any> = {};

    channel.config_schema.fields.forEach((field) => {
      const value = getNestedValue(formData, field.name);
      if (value !== undefined && value !== '') {
        // Reconstruct nested structure
        const keys = field.name.split('.');
        let current = config;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
      }
    });

    return config;
  }, [channel, formData]);

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    if (!channel) return false;

    const validationData: Record<string, any> = {
      name: formData.name,
    };

    channel.config_schema.fields.forEach((field) => {
      const schemaKey = field.name.replace(/\./g, '_');
      validationData[schemaKey] = getNestedValue(formData, field.name) || '';
    });

    const result = dynamicSchema.schema.safeParse(validationData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const schemaKey = String(err.path[0]);
        // Use the fieldMap to get the original field name, or use schemaKey for 'name'
        const fieldName =
          schemaKey === 'name' ? 'name' : dynamicSchema.fieldMap[schemaKey] || schemaKey;
        fieldErrors[fieldName] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    return true;
  }, [channel, formData, dynamicSchema]);

  // Submit handler
  const handleSubmit = async () => {
    setErrors({});
    setIsSubmitting(true);

    try {
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      const payload = {
        channel_type: channel!.type,
        name: formData.name,
        config: buildConfigPayload(),
      };

      let url = '/notification-channels';
      let method = 'POST';

      if (editData) {
        url = `/notification-channels/${editData.id}`;
        method = 'PUT';
      }

      const result = await request(url, {
        method,
        data: payload,
      });
      if (!result) return;

      const successMsg = editData
        ? 'Integration updated successfully!'
        : 'Integration created successfully!';
      const failMsg = editData ? 'Failed to update integration.' : 'Failed to create integration.';

      if (result.notificationChannelsData.status === 'success') {
        toast.success(successMsg);
        handleClose();
        onSuccess();
      } else {
        toast.error(result.notificationChannelsData.message || failMsg);
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '' });
    setErrors({});
    onClose();
  };

  // Check if field should be disabled (e.g., email in trial mode)
  const isFieldDisabled = useCallback(
    (field: ConfigField): boolean => {
      if (
        channel?.type === 'email' &&
        field.name === 'recipients.to' &&
        field.type === 'email' &&
        userDetails?.user?.subscription_type === PLAN_TYPES.TRIAL
      ) {
        return true;
      }
      return false;
    },
    [channel, userDetails]
  );

  // Get the value to display (handles trial email case)
  const getDisplayValue = useCallback(
    (field: ConfigField): string => {
      if (
        channel?.type === 'email' &&
        field.name === 'recipients.to' &&
        field.type === 'email' &&
        userDetails?.user?.subscription_type === PLAN_TYPES.TRIAL
      ) {
        return userDataEmail;
      }
      return getFieldValue(field.name);
    },
    [channel, userDetails, userDataEmail, getFieldValue]
  );

  // Get input type based on field type
  const getInputType = (fieldType: string, fieldName: string): string => {
    switch (fieldType) {
      case 'email':
        return 'email';
      case 'url':
        return 'url';
      case 'password':
        return showPassword[fieldName] ? 'text' : 'password';
      case 'phone_array':
        return 'tel';
      default:
        return 'text';
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (fieldName: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  if (!channel) return null;

  return (
    <Modal.Root open={isOpen} onOpenChange={onClose}>
      <Modal.Content>
        {/* Header */}
        <Modal.Header>
          <Flex direction="column" gap={1} alignItems="flex-start">
            <Modal.Title>
              {editData ? 'Edit' : 'Add'} {channel.label} Integration
            </Modal.Title>

            <Typography variant="pi" textColor="neutral600">
              {channel.description}
            </Typography>
          </Flex>
        </Modal.Header>

        {/* Body */}
        <Modal.Body>
          <Flex direction="column" gap={4} width="100%">
            {/* Integration name */}
            <Box width="100%">
            <Field.Root name="name" required error={errors.name}>
              <Field.Label>My {channel.label} Integration</Field.Label>

              <Field.Input
                placeholder={`Enter a name for this ${channel.label} integration`}
                value={formData.name || ''}
                onChange={(e: any) => {
                  const value = e.target.value;
                  setFormData((prev) => ({ ...prev, name: value }));
                  validateField('name', value);
                }}
              />

              {errors.name && <Field.Error>{errors.name}</Field.Error>}
            </Field.Root>
                </Box>
            {/* Dynamic fields */}
            {channel.config_schema.fields.map((field) => {
              const isDisabled = isFieldDisabled(field);
              const isPassword = field.type === 'password';

              return (
                <Box width="100%">
                <Field.Root key={field.name} name={field.name} error={errors[field.name]}>
                  <Field.Label>{field.label}</Field.Label>

                  <Box position="relative">
                    <Field.Input
                      type={getInputType(field.type, field.name)}
                      placeholder={field.placeholder}
                      value={getDisplayValue(field)}
                      disabled={isDisabled}
                      onChange={(e: any) => {
                        if (!isDisabled) {
                          updateFieldValue(field.name, e.target.value);
                        }
                      }}
                    />

                    {isPassword && (
                      <Button
                        variant="ghost"
                        size="S"
                        onClick={() => togglePasswordVisibility(field.name)}
                        style={{
                          position: 'absolute',
                          right: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                        }}
                        aria-label={showPassword[field.name] ? 'Hide password' : 'Show password'}
                      >
                        {showPassword[field.name] ? <EyeStriked /> : <Eye />}
                      </Button>
                    )}
                  </Box>

                  {field.description && !errors[field.name] && (
                    <Field.Hint>{field.description}</Field.Hint>
                  )}

                  {errors[field.name] && <Field.Error>{errors[field.name]}</Field.Error>}
                </Field.Root>
                </Box>
              );
            })}
          </Flex>
        </Modal.Body>

        {/* Footer */}
        <Modal.Footer>
          <Modal.Close>
            <Button variant="tertiary" disabled={isSubmitting}>
              Cancel
            </Button>
          </Modal.Close>

          <Button onClick={handleSubmit} loading={isSubmitting}>
            {editData ? 'Update' : 'Add'}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
