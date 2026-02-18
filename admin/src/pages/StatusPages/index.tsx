import {
  Card,
  Typography,
  Button,
  Tooltip,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Flex,
  Box,
  IconButton,
  SimpleMenu,
  MenuItem,
} from '@strapi/design-system';
import {
  ArrowsCounterClockwise,
  ChevronDown,
  Eye,
  Pencil,
  Plus,
  Rocket,
  MinusCircle,
  Trash,
} from '@strapi/icons';
import React, { useEffect, useState } from 'react';
import { DASHBOARD_URL, PLAN_LIMITS } from '../../utils/constants';
import SkeletonRow from '../../components/TableSkeletonRow';
import { useNavigate, useParams } from 'react-router-dom';
// import { ConfirmationModal } from "../ConfirmationModal";
import { getUserDetailsCached } from '../../utils/userStorage';
import { request } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { ConfirmationModal } from '../../components/DeleteConfirmation';

export default function ListStatusPages() {
  const [statusPages, setStatusPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  // delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  useEffect(() => {
    fetchStatusPages();
  }, []);
  const fetchStatusPages = async () => {
    try {
      setIsLoading(true);
      const response = await request('/status-pages');

      if (!response) return;
      //   const result = await response.json();
      setStatusPages(response?.statusPagesData?.data?.status_pages || []);
    } catch (error) {
      console.error('Error fetching status pages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPageId) return;

    setIsDeleting(true);

    try {
      const result = await request(`/status-pages/${selectedPageId}`, {
        method: 'DELETE',
      });
      if (!result) return;

      if (result?.statusPagesData?.status === 'success') {
        toast.success('Status page deleted successfully');
        await fetchStatusPages();
        setIsDeleteModalOpen(false);
        setSelectedPageId(null);
      } else {
        toast.error(result.data?.message || 'Failed to delete status page');
      }
    } catch (error) {
      toast.error('Something went wrong while deleting monitor');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublishToggle = async (page: any) => {
    try {
      const isPublished = page.is_published === true ? false : true;

      const payload = {
        id: page.id,
        is_published: isPublished,
      };

      const result = await request('/status-pages', {
        method: 'PUT',
        data: payload,
      });
      if (!result) return;

      if (result?.statusPagesData?.status === 'success') {
        toast.success(isPublished ? 'Status page published' : 'Status page unpublished');
        const updatedPage = result?.statusPagesData?.data.status_page;
        setStatusPages((prev) =>
          prev.map((p) =>
            p.id === updatedPage.id ? { ...p, is_published: updatedPage.is_published } : p
          )
        );
      } else {
        toast.error(result.data?.message || 'Failed to update page');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const resetShareableLink = async (page: any) => {
    try {
      const result = await request(`/status-pages/reset`, {
        method: 'POST',
        data: { id: page.id },
      });
      if (!result) return;

      if (result?.statusPagesData?.status === 'success') {
        const updatedPage = result?.statusPagesData?.data.status_page;
        toast.success('Shareable link reset successfully');
        setStatusPages((prev) =>
          prev.map((p) =>
            p.id === updatedPage.id ? { ...p, shareable_id: updatedPage.shareable_id } : p
          )
        );
      } else {
        toast.error(result.data?.message || 'Failed to reset link');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleAddStatusPage = async () => {
    try {
      const userDetails = await getUserDetailsCached();
      console.log('User details from cache:', userDetails);
      const maxStatusPagesLimit =
        userDetails?.plan_limits?.max_status_pages || PLAN_LIMITS.TRIAL.max_status_pages;
      console.log('Max status pages limit for user:', maxStatusPagesLimit);
      if (maxStatusPagesLimit !== undefined && statusPages.length >= maxStatusPagesLimit) {
        toast.error(
          `You have reached your plan limit of ${maxStatusPagesLimit} status pages. Please upgrade your plan to add more status pages.`
        );
        return;
      }
      console.log('Navigating to create status page');
      navigate('/plugins/upsnap/status-pages/new');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <>
      {/* Title + Button */}
      <Flex justifyContent="space-between" gap={2} alignItems={{ initial: "start", medium: "center" }} direction={{ initial: "column", medium: "row" }} marginBottom={6}>
        <Box>
          <Flex direction="column" gap={1} alignItems="flex-start">
            <Typography variant="alpha" fontWeight="bold">
              Status Pages
            </Typography>
            <Typography variant="pi" textColor="neutral600">
              Manage your Status Pages
            </Typography>
          </Flex>
        </Box>
        <Button startIcon={<Plus />} onClick={handleAddStatusPage} variant="primary" size="S">
          Add Status Page
        </Button>
      </Flex>
      <Card>
        <Box style={{ overflowX: 'auto' }}>
          <Table colCount={3} rowCount={statusPages.length}>
            <Thead>
              <Tr>
                <Th>
                  <Typography variant="sigma">Name</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Status</Typography>
                </Th>
                <Th>
                  <Flex justifyContent="flex-end" width="100%">
                    <Typography variant="sigma">Actions</Typography>
                  </Flex>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                <SkeletonRow rows={3} />
              ) : statusPages.length === 0 ? (
                <Tr>
                  <Td colSpan={3}>
                    <Flex justifyContent="center" alignItems="center" padding={5}>
                      <Typography>No status pages found</Typography>
                    </Flex>
                  </Td>
                </Tr>
              ) : (
                statusPages.map((page, index) => (
                  <Tr key={page.id}>
                    <Td>
                      <Box>
                        <Flex direction="column" gap={1} alignItems="flex-start">
                          <Typography variant="omega" fontWeight="bold">
                            {page.name}
                          </Typography>
                          <Typography variant="pi" textColor="neutral600">
                            {page.monitor_ids.length} monitors
                          </Typography>
                        </Flex>
                      </Box>
                    </Td>
                    <Td>
                      <Badge
                        backgroundColor={page.is_published ? 'success100' : 'neutral200'}
                        textColor={page.is_published ? 'success700' : 'neutral700'}
                      >
                        {page.is_published ? 'Published' : 'Unpublished'}
                      </Badge>
                    </Td>
                    <Td>
                      <Flex gap={2} justifyContent="flex-end">
                        <Tooltip
                          description={
                            !page.is_published || !page?.shareable_id
                              ? 'This page is not published yet'
                              : 'View public page'
                          }
                        >
                          <Button
                            variant="secondary"
                            size="S"
                            disabled={!page.is_published}
                            onClick={() => {
                              if (!page.is_published || !page.shareable_id) return;
                              window.open(
                                `${DASHBOARD_URL}/shared/${page.shareable_id}`,
                                '_blank',
                                'noopener,noreferrer'
                              );
                            }}
                            startIcon={<Eye />}
                          >
                            View
                          </Button>
                        </Tooltip>
                        <SimpleMenu label="Actions" tag={IconButton} icon={<ChevronDown />}>
                          <MenuItem
                            onClick={(e: any) => {
                              e.stopPropagation();
                              handlePublishToggle(page);
                            }}
                            startIcon={page.is_published === true ? <MinusCircle /> : <Rocket />}
                          >
                            {page.is_published === true ? <>Un-publish</> : <>Publish</>}
                          </MenuItem>
                          <MenuItem
                            onClick={(e: any) => {
                              e.stopPropagation();
                              resetShareableLink(page);
                            }}
                            startIcon={<ArrowsCounterClockwise />}
                          >
                            Reset Shareable Link
                          </MenuItem>
                          <MenuItem
                            onClick={(e: any) => {
                              e.stopPropagation();
                              navigate(`/plugins/upsnap/status-pages/${page.id}`);
                            }}
                            startIcon={<Pencil />}
                          >
                            Edit
                          </MenuItem>
                          <MenuItem
                            onClick={(e: any) => {
                              e.stopPropagation();
                              setSelectedPageId(page.id);
                              setIsDeleteModalOpen(true);
                            }}
                            textColor="danger700"
                            startIcon={<Trash />}
                          >
                            Delete
                          </MenuItem>
                        </SimpleMenu>
                      </Flex>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
        <ConfirmationModal
          open={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Status Page"
          description="Are you sure you want to delete this status page? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          confirmColor="red"
          isLoading={isDeleting}
          loadingText="Deleting..."
        />
      </Card>
    </>
  );
}
