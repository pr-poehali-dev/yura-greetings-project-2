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
  x: number;
  y: number;
}

const FloorPlan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const checkInStr = searchParams.get('checkIn');
  const checkOutStr = searchParams.get('checkOut');
  const categoryFilter = searchParams.get('category');
  
  const checkIn = checkInStr ? new Date(checkInStr) : null;
  const checkOut = checkOutStr ? new Date(checkOutStr) : null;

  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<RoomOnFloor | null>(null);
  const [rooms, setRooms] = useState<RoomOnFloor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockRooms: RoomOnFloor[] = [
        { id: '101', number: '101', floor: 1, category: 'Стандарт', price: 3500, isAvailable: true, x: 50, y: 100 },
        { id: '102', number: '102', floor: 1, category: 'Стандарт', price: 3500, isAvailable: true, x: 200, y: 100 },
        { id: '103', number: '103', floor: 1, category: 'Стандарт', price: 3500, isAvailable: false, x: 350, y: 100 },
        { id: '104', number: '104', floor: 1, category: 'Комфорт', price: 5000, isAvailable: true, x: 500, y: 100 },
        { id: '105', number: '105', floor: 1, category: 'Стандарт', price: 3500, isAvailable: true, x: 50, y: 250 },
        { id: '106', number: '106', floor: 1, category: 'Стандарт', price: 3500, isAvailable: false, x: 200, y: 250 },
        
        { id: '201', number: '201', floor: 2, category: 'Комфорт', price: 5000, isAvailable: true, x: 50, y: 100 },
        { id: '202', number: '202', floor: 2, category: 'Комфорт', price: 5000, isAvailable: true, x: 200, y: 100 },
        { id: '203', number: '203', floor: 2, category: 'Люкс', price: 8500, isAvailable: true, x: 350, y: 100 },
        { id: '204', number: '204', floor: 2, category: 'Комфорт', price: 5000, isAvailable: false, x: 500, y: 100 },
        { id: '205', number: '205', floor: 2, category: 'Комфорт', price: 5000, isAvailable: true, x: 50, y: 250 },
        
        { id: '301', number: '301', floor: 3, category: 'Люкс', price: 8500, isAvailable: true, x: 50, y: 100 },
        { id: '302', number: '302', floor: 3, category: 'Люкс', price: 8500, isAvailable: false, x: 200, y: 100 },
        { id: '303', number: '303', floor: 3, category: 'Люкс', price: 8500, isAvailable: true, x: 350, y: 100 },
      ];
      
      setRooms(mockRooms);
      setLoading(false);
    };

    fetchRooms();
  }, [checkInStr, checkOutStr, categoryFilter]);

  const floorRooms = rooms.filter(room => {
    const matchesFloor = room.floor === selectedFloor;
    const matchesCategory = !categoryFilter || room.category === categoryFilter;
    return matchesFloor && matchesCategory;
  });

  const availableRooms = floorRooms.filter(r => r.isAvailable);
  const floors = [1, 2, 3];

  const handleRoomClick = (room: RoomOnFloor) => {
    if (room.isAvailable) {
      setSelectedRoom(room);
    }
  };

  const handleConfirmBooking = () => {
    if (selectedRoom) {
      navigate(`/booking?checkIn=${checkInStr}&checkOut=${checkOutStr}&roomId=${selectedRoom.id}`);
    }
  };

  if (!checkIn || !checkOut) {
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
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Выберите номер на плане</h2>
          <p className="text-muted-foreground">
            {categoryFilter ? `Категория: ${categoryFilter}` : 'Все категории'} • {format(checkIn, 'dd MMM', { locale: ru })} - {format(checkOut, 'dd MMM', { locale: ru })}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex gap-2 mb-6">
                {floors.map((floor) => (
                  <Button
                    key={floor}
                    variant={selectedFloor === floor ? 'default' : 'outline'}
                    onClick={() => setSelectedFloor(floor)}
                    className="flex-1"
                  >
                    <Icon name="Building" size={16} className="mr-2" />
                    {floor} этаж
                  </Button>
                ))}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="relative bg-muted/30 rounded-lg p-8" style={{ minHeight: '400px' }}>
                  <div className="text-xs text-muted-foreground mb-4 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-500"></div>
                      <span>Свободен</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-500"></div>
                      <span>Занят</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-primary bg-primary/20"></div>
                      <span>Выбран</span>
                    </div>
                  </div>

                  {floorRooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => handleRoomClick(room)}
                      className={`absolute w-24 h-24 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                        selectedRoom?.id === room.id
                          ? 'border-primary bg-primary/20 scale-110 shadow-lg'
                          : room.isAvailable
                          ? 'border-green-500 bg-green-500/20 hover:scale-105 cursor-pointer hover:shadow-md'
                          : 'border-red-500 bg-red-500/20 cursor-not-allowed opacity-50'
                      }`}
                      style={{ left: `${room.x}px`, top: `${room.y}px` }}
                    >
                      <div className="text-lg font-bold">{room.number}</div>
                      <div className="text-xs text-muted-foreground">{room.category}</div>
                      <div className="text-sm font-medium">{room.price} ₽</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 text-sm text-muted-foreground">
                Доступно номеров: {availableRooms.length}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            {selectedRoom ? (
              <Card className="p-6 sticky top-24">
                <h3 className="text-xl font-bold mb-4">Выбранный номер</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-primary">№ {selectedRoom.number}</div>
                    <div className="text-muted-foreground">{selectedRoom.category}</div>
                  </div>

                  <div className="py-4 border-y space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Заезд</span>
                      <span className="font-medium">{format(checkIn, 'dd MMM', { locale: ru })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Выезд</span>
                      <span className="font-medium">{format(checkOut, 'dd MMM', { locale: ru })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Цена за ночь</span>
                      <span className="font-bold">{selectedRoom.price} ₽</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleConfirmBooking}
                  >
                    <Icon name="Calendar" size={16} className="mr-2" />
                    Забронировать
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-6 bg-muted/50">
                <Icon name="MousePointerClick" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-center text-muted-foreground">
                  Выберите свободный номер на плане этажа
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorPlan;
