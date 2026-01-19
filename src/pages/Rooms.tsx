import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface RoomOnFloor {
  id: string;
  number: string;
  floor: number;
  category: string;
  price: number;
  isAvailable: boolean;
}

const Rooms = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState<RoomOnFloor[]>([]);
  const [loading, setLoading] = useState(true);
  
  const checkInStr = searchParams.get('checkIn');
  const checkOutStr = searchParams.get('checkOut');
  
  const checkIn = checkInStr ? new Date(checkInStr) : null;
  const checkOut = checkOutStr ? new Date(checkOutStr) : null;

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockRooms: RoomOnFloor[] = [
        { id: '101', number: '101', floor: 1, category: 'Стандарт', price: 3500, isAvailable: true },
        { id: '102', number: '102', floor: 1, category: 'Стандарт', price: 3500, isAvailable: true },
        { id: '103', number: '103', floor: 1, category: 'Стандарт', price: 3500, isAvailable: false },
        { id: '104', number: '104', floor: 1, category: 'Комфорт', price: 5000, isAvailable: true },
        { id: '201', number: '201', floor: 2, category: 'Комфорт', price: 5000, isAvailable: true },
        { id: '202', number: '202', floor: 2, category: 'Комфорт', price: 5000, isAvailable: true },
        { id: '203', number: '203', floor: 2, category: 'Люкс', price: 8500, isAvailable: true },
        { id: '301', number: '301', floor: 3, category: 'Люкс', price: 8500, isAvailable: true },
        { id: '302', number: '302', floor: 3, category: 'Люкс', price: 8500, isAvailable: false },
      ];
      
      setRooms(mockRooms);
      setLoading(false);
    };

    fetchRooms();
  }, [checkInStr, checkOutStr]);

  const handleRoomSelect = (roomId: string) => {
    navigate(`/floorplan?checkIn=${checkInStr}&checkOut=${checkOutStr}&room=${roomId}`);
  };

  const groupedByFloor = rooms.reduce((acc, room) => {
    if (!acc[room.floor]) acc[room.floor] = [];
    acc[room.floor].push(room);
    return acc;
  }, {} as Record<number, RoomOnFloor[]>);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/hotel')}>
            <Icon name="ArrowLeft" className="mr-2" size={16} />
            Назад
          </Button>
          <h1 className="text-xl font-bold">IVAN HOTEL</h1>
          <div className="w-24" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {checkIn && checkOut && (
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-center gap-8 text-center">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Дата заезда</div>
                <div className="font-bold text-lg">{format(checkIn, 'dd MMMM yyyy', { locale: ru })}</div>
              </div>
              <Icon name="ArrowRight" size={24} className="text-primary" />
              <div>
                <div className="text-sm text-muted-foreground mb-1">Дата выезда</div>
                <div className="font-bold text-lg">{format(checkOut, 'dd MMMM yyyy', { locale: ru })}</div>
              </div>
            </div>
          </Card>
        )}

        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Выберите номер на схеме</h2>
          <p className="text-muted-foreground">Доступные номера на выбранные даты</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.keys(groupedByFloor).sort((a, b) => Number(b) - Number(a)).map((floor) => (
              <div key={floor}>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Icon name="Building" size={24} className="text-primary" />
                  {floor} этаж
                </h3>
                
                <div className="grid md:grid-cols-4 gap-4">
                  {groupedByFloor[Number(floor)].map((room) => (
                    <Card 
                      key={room.id}
                      className={`p-6 cursor-pointer transition-all ${
                        room.isAvailable 
                          ? 'hover:shadow-lg hover:border-primary' 
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => room.isAvailable && handleRoomSelect(room.id)}
                    >
                      <div className="text-center space-y-3">
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                          room.isAvailable ? 'bg-primary/10' : 'bg-muted'
                        }`}>
                          <Icon 
                            name={room.isAvailable ? 'Home' : 'Lock'} 
                            size={32} 
                            className={room.isAvailable ? 'text-primary' : 'text-muted-foreground'} 
                          />
                        </div>
                        
                        <div>
                          <div className="text-2xl font-bold">№ {room.number}</div>
                          <div className="text-sm text-muted-foreground">{room.category}</div>
                        </div>
                        
                        <div className="pt-3 border-t">
                          <div className="text-xl font-bold text-primary">{room.price} ₽</div>
                          <div className="text-xs text-muted-foreground">за ночь</div>
                        </div>
                        
                        <div className={`text-sm font-medium ${
                          room.isAvailable ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {room.isAvailable ? '✓ Доступен' : '✗ Занят'}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;