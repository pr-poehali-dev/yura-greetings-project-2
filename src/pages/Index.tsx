import RoomSelector from '@/components/RoomSelector';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

const Index = () => {
  return (
    <div className="relative">
      <Link to="/admin" className="fixed top-4 right-4 z-50">
        <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur">
          <Icon name="Settings" className="mr-2" size={16} />
          Админ-панель
        </Button>
      </Link>
      <RoomSelector />
    </div>
  );
};

export default Index;