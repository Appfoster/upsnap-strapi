import { Link, Flex, Box, Main } from '@strapi/design-system';
import { ArrowLeft } from '@strapi/icons';
import { useEffect, useState } from 'react';
// import LoadingCard from "@/components/LoadingCard";
import CreateUpdateForm from '../../../components/status-pages/StatusPageForm';
import { toast } from 'react-toastify';
import { StatusPage } from '../../../utils/types';
import { useParams, useNavigate } from 'react-router-dom';
import { request } from '../../../utils/helpers';
import LoadingCard from '../../../components/reachability/LoadingCard';

export default function UpdateStatusPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [statusPage, setStatusPage] = useState<StatusPage | null>(null);
  const [loading, setLoading] = useState(true);
  const handleBack = () => {
    navigate('/plugins/upsnap/status-pages');
  };

  // Fetch monitor on load
  useEffect(() => {
    if (!id) return;

    const fetchStatusPage = async () => {
      try {
        const result = await request(`/status-pages/${id}`, {
          method: 'GET',
        });
        if (!result) return;

        if (result?.statusPagesData?.status === 'success') {
          setStatusPage(result?.statusPagesData?.data?.status_page);
        } else {
          console.error(result?.statusPagesData?.message);
        }
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchStatusPage();
  }, [id]);

  // Set breadcrumbs
  // useEffect(() => {
  // 	setBreadcrumbs([
  // 		{ label: "Status Pages", href: "/status-pages" },
  // 		{ label: statusPage?.name || "Status Page Details"},
  // 		{ label: "Edit" },
  // 	]);

  // 	return () => setBreadcrumbs(null);
  // }, [statusPage]);
  return (
    <Main>
      {loading ? <LoadingCard /> : (
        <Flex direction="column" gap={2} padding={2} alignItems="start">
          {/* Back Button */}
          <Link onClick={handleBack} isExternal={false}>
            <Flex alignItems="center" gap={3} marginBottom={2}>
              <ArrowLeft />
              Status Pages
            </Flex>
          </Link>
          {!loading && statusPage && <CreateUpdateForm mode="edit" statusPage={statusPage} />}
        </Flex>
      )}
    </Main>
  );
}
