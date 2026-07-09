import { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Typography,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  EmptyStateLayout,
} from '@strapi/design-system';
import { Plus, Pencil, Trash } from '@strapi/icons';
import { toast } from 'react-toastify';
import { request, formatDateTime } from '../../utils/helpers';
import { Announcement } from '../../utils/types';
import { ConfirmationModal } from '../DeleteConfirmation';
import AnnouncementModal from './AnnouncementModal';
import LoadingCard from '../reachability/LoadingCard';

const TYPE_BADGE: Record<string, { background: string; textColor: string }> = {
  info: { background: 'primary100', textColor: 'primary700' },
  warning: { background: 'warning100', textColor: 'warning700' },
  critical: { background: 'danger100', textColor: 'danger700' },
};

export default function AnnouncementsTab({ statusPageId }: { statusPageId: string }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await request(`/status-pages/${statusPageId}/announcements`, { method: 'GET' });
      if (res?.announcementsData?.status === 'success') {
        setAnnouncements(res.announcementsData.data?.announcements || []);
      }
    } catch (err) {
      console.error('Error loading announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusPageId]);

  const handleAdd = () => {
    setEditingAnnouncement(null);
    setModalOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setModalOpen(true);
  };

  const handleSave = async (data: Partial<Announcement>) => {
    try {
      const result = editingAnnouncement
        ? await request(`/status-pages/${statusPageId}/announcements/${editingAnnouncement.id}`, {
            method: 'PUT',
            data,
          })
        : await request(`/status-pages/${statusPageId}/announcements`, {
            method: 'POST',
            data,
          });

      if (!result) return;
      if (result?.announcementsData?.status === 'success') {
        toast.success(`Announcement ${editingAnnouncement ? 'updated' : 'created'} successfully`);
        setModalOpen(false);
        load();
      } else {
        toast.error(result?.announcementsData?.message || 'Something went wrong.');
      }
    } catch (err) {
      toast.error('Something went wrong while saving the announcement.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const result = await request(
        `/status-pages/${statusPageId}/announcements/${deleteTarget.id}`,
        { method: 'DELETE' }
      );
      if (result?.announcementsData?.status === 'success') {
        toast.success('Announcement deleted successfully');
        load();
      } else {
        toast.error('Failed to delete announcement');
      }
    } catch (err) {
      toast.error('Something went wrong while deleting the announcement.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <Box paddingTop={4}>
      <Flex justifyContent="space-between" alignItems="center" marginBottom={4}>
        <Flex direction="column" alignItems="flex-start" gap={1}>
          <Typography variant="delta" fontWeight="bold">
            Announcements
          </Typography>
          <Typography variant="pi" textColor="neutral600">
            Show banners on your public status page
          </Typography>
        </Flex>
        <Button startIcon={<Plus />} onClick={handleAdd}>
          Add
        </Button>
      </Flex>

      {loading ? (
        <LoadingCard />
      ) : announcements.length === 0 ? (
        <EmptyStateLayout content="No announcements found." />
      ) : (
        <Box overflow="auto">
        <Table colCount={6} rowCount={announcements.length}>
          <Thead>
            <Tr>
              <Th><Typography variant="sigma">Title</Typography></Th>
              <Th><Typography variant="sigma">Type</Typography></Th>
              <Th><Typography variant="sigma">Status</Typography></Th>
              <Th><Typography variant="sigma">Start Date</Typography></Th>
              <Th><Typography variant="sigma">End Date</Typography></Th>
              <Th><Typography variant="sigma">Actions</Typography></Th>
            </Tr>
          </Thead>
          <Tbody>
            {announcements.map((announcement) => (
              <Tr key={announcement.id}>
                <Td><Typography>{announcement.title}</Typography></Td>
                <Td>
                  <Badge {...TYPE_BADGE[announcement.type]}>{announcement.type}</Badge>
                </Td>
                <Td>
                  <Badge
                    background={announcement.status === 'active' ? 'success100' : 'neutral150'}
                    textColor={announcement.status === 'active' ? 'success700' : 'neutral700'}
                  >
                    {announcement.status}
                  </Badge>
                </Td>
                <Td><Typography>{formatDateTime(announcement.start_at)}</Typography></Td>
                <Td><Typography>{announcement.end_at ? formatDateTime(announcement.end_at) : '—'}</Typography></Td>
                <Td>
                  <Flex gap={2}>
                    <IconButton onClick={() => handleEdit(announcement)} label="Edit" borderWidth={0}>
                      <Pencil />
                    </IconButton>
                    <IconButton
                      onClick={() => setDeleteTarget(announcement)}
                      label="Delete"
                      borderWidth={0}
                    >
                      <Trash />
                    </IconButton>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        </Box>
      )}

      <AnnouncementModal
        open={modalOpen}
        announcement={editingAnnouncement}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <ConfirmationModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Announcement"
        description="Are you sure you want to delete this announcement?"
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
        isLoading={deleting}
        loadingText="Deleting..."
      />
    </Box>
  );
}
