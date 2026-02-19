import { CardContent, Flex, CardBody, Card, Button, Box } from '@strapi/design-system';
import { Plus, Trash } from '@strapi/icons';
import { useNavigate } from 'react-router-dom';
import MonitorsTable from './MonitorsTable';
import { getUserData } from '../../utils/userStorage';
import { getUserDetails, request } from '../../utils/helpers';
import { useEffect, useState } from 'react';
import { Monitor } from '../../utils/types';
import { toast } from 'react-toastify';
import MonitorForm from './MonitorForm';
import { ConfirmationModal } from '../DeleteConfirmation';

async function getMonitors() {
  const res = await request('/monitors', {
    method: 'GET',
  });
  if (!res) return;

  if (!res.monitorsData.data) throw new Error('Failed to fetch monitors');

  return res.monitorsData.data;
}

export default function Monitors({ onTabChange }: {
  onTabChange: (tab: string) => void;
}) {
  const navigate = useNavigate();
  const [monitors, setMonitors] = useState<Monitor[]>();
  const [selectedMonitor, setSelectedMonitor] = useState<Monitor>();
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const userDetails = getUserData();
  const load = async () => {
    try {
      setLoading(true);
      const res = await getMonitors();
      if (res?.monitors?.message === 'Invalid authentication token') {
        onTabChange('api_key')
      }
      setMonitors(res.monitors);
    } catch (e) {
      console.error('Error loading monitors:', e);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
 
    load();
    getUserDetails();
  }, []);
  const handleAddMonitor = async () => {
    let userPlan = userDetails?.user?.subscription_type;
    let maxMonitorsAllowed = userDetails?.plan_limits?.max_monitors;
    if (!userPlan) {
      const user = await getUserDetails();
      userPlan = user?.user?.subscription_type;
      maxMonitorsAllowed = user?.plan_limits?.max_monitors;
    }
    if (maxMonitorsAllowed && monitors && maxMonitorsAllowed <= monitors?.length) {
      toast.info('Upgrade your plan to add more monitors.');
      return;
    }
    navigate('/plugins/upsnap/monitors/new');
  };

  const handleEditMonitor = (monitor: Monitor) => {
    setSelectedMonitor(monitor);
    setShowEdit(true);
  };
  const handleCancelEdit = () => {
    setSelectedMonitor(undefined);
    setShowEdit(false);
  };
  const handleDelete = async (monitor: Monitor) => {
    if (!monitor.id) return;
    setSelectedMonitor(monitor);
    setDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (!selectedMonitor){
      toast.error('Please select a monitor to delete.');
      setDeleteModalOpen(false);
      return;
    };
    setLoading(true);
    try {
      const result = await request(`/monitors/${selectedMonitor.id}`, {
        method: 'DELETE',
      });
      if (!result) return;
      if (result?.monitorsData?.status === 'success') {
        toast.success('Monitor deleted successfully');
        const res = await getMonitors();
        setMonitors(res.monitors);
      } else {
        console.error(result?.monitorsData?.message);
        toast.error('Failed to delete monitor');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while deleting the monitor');
    } finally {
      setDeleteModalOpen(false);
      setLoading(false);
    }
  }
  const handleBulkDelete = async () => {
    if (!bulkDeleteIds) return;
    setBulkDeleteModalOpen(true);
  }
  const confirmBulkDelete = async () => {
    if (!bulkDeleteIds){
      toast.error('Please select monitors to delete.');
      setBulkDeleteModalOpen(false);
      return;
    };
    setLoading(true);
    try {
      const result = await request('/monitors/bulk-delete', {
        method: 'POST',
        data: { monitorIds: bulkDeleteIds}
      });
      if (!result) return;
      if (result?.monitorsData?.status === 'success') {
        toast.success('Monitor deleted successfully');
        setBulkDeleteIds([])
        const res = await getMonitors();
        setMonitors(res.monitors);
      } else {
        console.error(result?.monitorsData?.message);
        toast.error('Failed to delete monitor');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while deleting the monitor');
    } finally {
      setBulkDeleteModalOpen(false);
      setLoading(false);
    }
  }

  return (
    <Box width="100%">
      {!showEdit && (
        <Flex direction="column" alignItems="flex-start" gap={4}>
          <Flex alignItems="end" width="100%" justifyContent="end" gap={2} direction={{initial: "column", medium: "row"}}>
            <Button startIcon={<Plus />} variant={'secondary'} size="M" onClick={handleAddMonitor}>
              Add Monitor
            </Button>
            {bulkDeleteIds.length > 0 && (
              <Button startIcon={<Trash />} variant='danger-light' size="M" onClick={handleBulkDelete}>
                Bulk Delete
              </Button>
            )}
            
          </Flex>
          <MonitorsTable
            monitors={monitors}
            onEdit={handleEditMonitor}
            handleDelete={handleDelete}
            setBulkDeleteIds={setBulkDeleteIds}
          />
        </Flex>
      )}
      {showEdit && selectedMonitor && (
        <MonitorForm monitor={selectedMonitor} mode="edit" handleCancelEdit={handleCancelEdit} load={load} />
      )}
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Monitor"
        description={`Are you sure you want to delete "${selectedMonitor?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
        isLoading={loading}
        loadingText="Deleting..."
      />
      <ConfirmationModal
        open={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Monitors"
        description={`Are you sure you want to delete selected monitors? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
        isLoading={loading}
        loadingText="Deleting..."
      />
    </Box>
  );
}
