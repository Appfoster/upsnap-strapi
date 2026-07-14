import { useEffect, useState } from 'react';
import {
  Modal,
  Button,
  Field,
  Textarea,
  Switch,
  SingleSelect,
  SingleSelectOption,
  Flex,
  Box,
} from '@strapi/design-system';
import { Announcement } from '../../utils/types';

interface AnnouncementModalProps {
  open: boolean;
  announcement: Announcement | null;
  onClose: () => void;
  onSave: (data: Partial<Announcement>) => Promise<void>;
}

const EMPTY_FORM = {
  title: '',
  message: '',
  type: 'info' as Announcement['type'],
  status: 'active' as Announcement['status'],
  is_dismissible: true,
  start_at: '',
  end_at: '',
};

function toDatetimeLocalValue(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const tzOffsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

export default function AnnouncementModal({
  open,
  announcement,
  onClose,
  onSave,
}: AnnouncementModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (announcement) {
      setForm({
        title: announcement.title,
        message: announcement.message,
        type: announcement.type,
        status: announcement.status,
        is_dismissible: announcement.is_dismissible,
        start_at: toDatetimeLocalValue(announcement.start_at),
        end_at: toDatetimeLocalValue(announcement.end_at),
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [announcement, open]);

  const isValid = form.title.trim() && form.message.trim() && form.start_at && form.type;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        ...form,
        start_at: new Date(form.start_at).toISOString(),
        end_at: form.end_at ? new Date(form.end_at).toISOString() : null,
      });
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Modal.Root open={open} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>{announcement ? 'Edit Announcement' : 'Add Announcement'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Flex direction="column" gap={4} width="100%" alignItems="stretch">
            <Field.Root required>
              <Field.Label>Title</Field.Label>
              <Field.Input
                value={form.title}
                maxLength={100}
                onChange={(e: any) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </Field.Root>
            <Flex alignItems="center" gap={3}>
              <Switch
                checked={form.is_dismissible}
                onCheckedChange={(checked: boolean) =>
                  setForm((prev) => ({ ...prev, is_dismissible: checked }))
                }
              />
              <Field.Label>Dismissible</Field.Label>
            </Flex>
            <Field.Root required>
              <Field.Label>Message</Field.Label>
              <Textarea
                value={form.message}
                maxLength={500}
                onChange={(e: any) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              />
            </Field.Root>
            <Flex gap={4} width="100%" direction={{ initial: 'column', medium: 'row' }}>
              <Field.Root required width="100%">
                <Field.Label>Start Date & Time</Field.Label>
                <input
                  type="datetime-local"
                  value={form.start_at}
                  onChange={(e) => setForm((prev) => ({ ...prev, start_at: e.target.value }))}
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #dcdce4' }}
                />
              </Field.Root>
              <Field.Root width="100%">
                <Field.Label>End Date & Time</Field.Label>
                <input
                  type="datetime-local"
                  value={form.end_at}
                  onChange={(e) => setForm((prev) => ({ ...prev, end_at: e.target.value }))}
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #dcdce4' }}
                />
              </Field.Root>
            </Flex>
            <Flex gap={4} width="100%" direction={{ initial: 'column', medium: 'row' }}>
              <Field.Root required width="100%">
                <Field.Label>Type</Field.Label>
                <SingleSelect
                  value={form.type}
                  onChange={(v: any) => setForm((prev) => ({ ...prev, type: v }))}
                >
                  <SingleSelectOption value="info">Info</SingleSelectOption>
                  <SingleSelectOption value="warning">Warning</SingleSelectOption>
                  <SingleSelectOption value="critical">Critical</SingleSelectOption>
                </SingleSelect>
              </Field.Root>
              <Field.Root width="100%">
                <Field.Label>Status</Field.Label>
                <SingleSelect
                  value={form.status}
                  onChange={(v: any) => setForm((prev) => ({ ...prev, status: v }))}
                >
                  <SingleSelectOption value="active">Active</SingleSelectOption>
                  <SingleSelectOption value="inactive">Inactive</SingleSelectOption>
                </SingleSelect>
              </Field.Root>
            </Flex>
          </Flex>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid || saving} loading={saving}>
            Save
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
