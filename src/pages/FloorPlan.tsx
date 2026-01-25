import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import FloorPlanViewer from '@/components/hotel/FloorPlanViewer';
import { useToast } from '@/hooks/use-toast';

interface Room {
  id: number;
  room_number: string;
  floor_id: number;
  position_x: number;
  position_y: number;
  width?: number;
  height?: number;
  polygon?: Array<{x: number, y: number}>;
  category: string;
  price: number;
  status: string;
}

const FloorPlan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const checkInStr = searchParams.get('checkIn');
  const checkOutStr = searchParams.get('checkOut');
  const categoryFilter = searchParams.get('category');

  if (!checkInStr || !checkOutStr) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Данные не найдены</h2>
          <p className="text-muted-foreground mb-4">Пожалуйста, начните бронирование сначала</p>
          <Button onClick={() => navigate('/hotel')}>
            Вернуться на главную
          </Button>
        </Card>
      </div>
    );
  }

  const handleRoomSelect = (room: Room) => {
    navigate(`/booking?roomId=${room.id}&checkIn=${checkInStr}&checkOut=${checkOutStr}`);
    toast({
      title: "Номер выбран",
      description: `Вы выбрали номер ${room.room_number}`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <Icon name="ArrowLeft" className="mr-2" size={16} />
            Назад
          </Button>
          <h1 className="text-xl font-bold">IVAN HOTEL</h1>
          <div className="w-24" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <FloorPlanViewer onRoomSelect={handleRoomSelect} />
      </div>
    </div>
  );
};

export default FloorPlan;