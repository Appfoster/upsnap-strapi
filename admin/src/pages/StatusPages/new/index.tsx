import { Link, Flex, Main } from '@strapi/design-system';
import { ArrowLeft } from '@strapi/icons';
import CreateUpdateForm from '../../../components/status-pages/StatusPageForm';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateStatusPage() {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate('/plugins/upsnap/status-pages');
  };
  return (
     <Main>
        <Flex direction="column" gap={2} padding={2} alignItems="start">
          {/* Back Button */}
          <Link onClick={handleBack} isExternal={false}>
            <Flex alignItems="center" gap={3} marginBottom={2}>
              <ArrowLeft />
              Status Pages
            </Flex>
          </Link>
          <CreateUpdateForm mode="create" />
        </Flex>
    </Main>
  );
}
