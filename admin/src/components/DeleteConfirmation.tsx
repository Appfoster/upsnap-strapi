import React from 'react';
import { Dialog, Button, Typography } from '@strapi/design-system';

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'red' | 'blue' | 'green' | 'amber';
  isLoading?: boolean;
  loadingText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'red',
  isLoading = false,
  loadingText = 'Processing...',
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleCancel}>
      <Dialog.Content>
        {/* Header */}
        <Dialog.Header>{title}</Dialog.Header>

        {/* Body */}
        <Dialog.Body>
          {typeof description === 'string' || typeof description === 'number' || typeof description === 'bigint' ? (
            <Typography variant="omega" textColor="neutral600">
              {String(description)}
            </Typography>
          ) : (
            description as any
          )}
        </Dialog.Body>

        {/* Footer */}
        <Dialog.Footer>
          <Dialog.Cancel>
            <Button fullWidth variant="tertiary" disabled={isLoading}>
              {cancelText}
            </Button>
          </Dialog.Cancel>

          <Dialog.Action>
            <Button
              fullWidth
              variant={confirmColor === 'red' ? 'danger' : 'success-light'}
              onClick={handleConfirm}
              loading={isLoading}
            >
              {isLoading ? loadingText : confirmText}
            </Button>
          </Dialog.Action>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
};
