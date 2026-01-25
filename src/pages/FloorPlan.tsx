import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Room {
  id: number;
  room_number: string;
  category: string;
  price: number;
  position_x: number;
  position_y: number;
  status: string;
  width?: number;
  height?: number;
  polygon?: Array<{ x: number; y: number }>;
  floor_id: number;
}

interface Floor {
  id: number;
  floor_number: number;
  plan_image_url: string | null;
  rooms: Room[];
}

const FloorPlan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const checkInStr = searchParams.get('checkIn');
  const checkOutStr = searchParams.get('checkOut');
  const categoryFilter = searchParams.get('category');
  
  const checkIn = checkInStr ? new Date(checkInStr) : null;
  const checkOut = checkOutStr ? new Date(checkOutStr) : null;

  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageRef, setImageRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchFloors = async () => {
      setLoading(true);
      
      try {
        const response = await fetch('https://functions.poehali.dev/4250a74c-56b6-4c2d-b516-8640091b4926');
        const data = await response.json();
        
        if (data.floors && data.floors.length > 0) {
          setFloors(data.floors);
          setSelectedFloor(data.floors[0].floor_number);
        }
      } catch (error) {
        console.error('Error fetching floors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFloors();
  }, []);

  const currentFloor = floors.find(f => f.floor_number === selectedFloor);
  
  const floorRooms = currentFloor?.rooms.filter(room => {
    const matchesCategory = !categoryFilter || room.category === categoryFilter;
    return matchesCategory;
  }) || [];

  const availableRooms = floorRooms.filter(r => r.status === 'available');

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef) return;

    const rect = imageRef.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const clickedRoom = floorRooms.find(room => {
      if (room.polygon && room.polygon.length >= 3) {
        return isPointInPolygon(x, y, room.polygon);
      }
      return false;
    });

    if (clickedRoom?.status === 'available') {
      setSelectedRoom(clickedRoom);
    }
  };

  const handleConfirmBooking = () => {
    if (selectedRoom) {
      navigate(`/booking?checkIn=${checkInStr}&checkOut=${checkOutStr}&roomId=${selectedRoom.id}`);
    }
  };

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
            {categoryFilter ? `Категория: ${categoryFilter}` : 'Все категории'} • {checkIn && checkOut && `${format(checkIn, 'dd MMM', { locale: ru })} - ${format(checkOut, 'dd MMM', { locale: ru })}`}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {floors.map((floor) => (
                  <Button
                    key={floor.id}
                    variant={selectedFloor === floor.floor_number ? 'default' : 'outline'}
                    onClick={() => setSelectedFloor(floor.floor_number)}
                    className="flex-shrink-0"
                  >
                    <Icon name="Building" size={16} className="mr-2" />
                    {floor.floor_number} этаж
                  </Button>
                ))}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : floors.length === 0 ? (
                <div className="bg-muted/30 rounded-lg p-8 text-center">
                  <Icon name="Building" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">Этажи не настроены</h3>
                  <p className="text-muted-foreground">Пожалуйста, добавьте этажи в панели администратора</p>
                </div>
              ) : currentFloor?.plan_image_url ? (
                <>
                  <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-500"></div>
                      <span>Свободен</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-500"></div>
                      <span>Занят</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-primary bg-primary/50"></div>
                      <span>Выбран</span>
                    </div>
                  </div>

                  <div
                    ref={setImageRef}
                    className="relative w-full aspect-[3/2] bg-background rounded-xl overflow-hidden border-2 border-border cursor-pointer"
                    onClick={handleCanvasClick}
                  >
                    <img
                      src={currentFloor.plan_image_url}
                      alt={`План ${currentFloor.floor_number} этажа`}
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />

                    {floorRooms.map(room => {
                      if (!room.polygon || room.polygon.length < 3) return null;

                      const color = room.status === 'available' ? '#22c55e' : 
                                   room.status === 'occupied' ? '#ef4444' : '#94a3b8';
                      
                      const isSelected = selectedRoom?.id === room.id;

                      return (
                        <div
                          key={room.id}
                          className="absolute pointer-events-none"
                          style={{
                            left: `${room.position_x}%`,
                            top: `${room.position_y}%`,
                            width: `${room.width}%`,
                            height: `${room.height}%`
                          }}
                        >
                          <svg
                            className="absolute inset-0 w-full h-full"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                          >
                            <polygon
                              points={room.polygon.map(p => 
                                `${((p.x - room.position_x) / (room.width || 1)) * 100},${((p.y - room.position_y) / (room.height || 1)) * 100}`
                              ).join(' ')}
                              fill={isSelected ? 'hsl(var(--primary))' : color}
                              fillOpacity={isSelected ? 0.5 : 0.3}
                              stroke={isSelected ? 'hsl(var(--primary))' : color}
                              strokeWidth="2"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-white drop-shadow-lg">
                              {room.room_number}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="bg-muted/30 rounded-lg p-8 text-center">
                  <Icon name="ImageOff" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">План этажа не загружен</h3>
                  <p className="text-muted-foreground">Пожалуйста, загрузите изображение плана в панели администратора</p>
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              {selectedRoom ? (
                <>
                  <h3 className="text-xl font-bold mb-4">Выбранный номер</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Номер:</span>
                      <span className="font-semibold">{selectedRoom.room_number}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Категория:</span>
                      <span className="font-semibold">{selectedRoom.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Цена:</span>
                      <span className="font-semibold">{selectedRoom.price.toLocaleString()} ₽/сутки</span>
                    </div>
                  </div>
                  <Button className="w-full" size="lg" onClick={handleConfirmBooking}>
                    Забронировать
                    <Icon name="ArrowRight" className="ml-2" size={16} />
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <Icon name="MousePointerClick" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Выберите номер</h3>
                  <p className="text-sm text-muted-foreground">Кликните на свободный номер на плане этажа</p>
                  {availableRooms.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-4">
                      Доступно номеров: {availableRooms.length}
                    </p>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

function isPointInPolygon(x: number, y: number, polygon: Array<{ x: number; y: number }>): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    
    const intersect = ((yi > y) !== (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  return inside;
}

export default FloorPlan;