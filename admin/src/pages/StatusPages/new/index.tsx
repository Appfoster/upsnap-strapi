import { Link, Flex } from '@strapi/design-system';
import { ArrowLeft } from '@strapi/icons';
import CreateUpdateForm from '../../../components/status-pages/StatusPageForm';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateStatusPage() {
  const navigate = useNavigate();
  //   useEffect(() => {
  //     document.title = `${process.env.NEXT_PUBLIC_APP_NAME} | Create Status Page`;
  //   }, []);
  const handleBack = () => {
    navigate('/plugins/upsnap/status-pages');
  };
  return (
    <div className="tw-mt-6">
      {/* Back Button */}
      <Link onClick={handleBack} isExternal={false}>
        <Flex alignItems="center" gap={3} marginBottom={4}>
          <ArrowLeft />
          Status Pages
        </Flex>
      </Link>

      {/* Form */}
      <CreateUpdateForm mode="create" />
    </div>
  );
}
