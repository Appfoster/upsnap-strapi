import { CardContent, Flex, CardBody, Card, Button } from '@strapi/design-system';
import { Plus } from '@strapi/icons';
import { useNavigate } from 'react-router-dom';

export default function Monitors() {
  const navigate = useNavigate();
  const handleAddMonitor = () => {
    navigate('/plugins/upsnap/monitors/new');
  };

  return (
    <>
      <Flex>
        <Button startIcon={<Plus />} variant={'secondary'} size="M" onClick={handleAddMonitor}>
          Add Monitor
        </Button>
      </Flex>
    </>
  );
}
