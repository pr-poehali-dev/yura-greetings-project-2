import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import FloorCanvas from '@/components/hotel/FloorCanvas';

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
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

  const handleRoomClick = (room: Room, e: React.MouseEvent) => {
    e.stopPropagation();
    if (room.status === 'available') {
      setSelectedRoom(room);
    }
  };

  const handleConfirmBooking = () => {
    if (selectedRoom) {
      navigate(`/booking?checkIn=${checkInStr}&checkOut=${checkOutStr}&roomId=${selectedRoom.id}`);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleMouseDownDrag = (e: React.MouseEvent) => {
    if (scale === 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - translateX, y: e.clientY - translateY });
    e.stopPropagation();
  };

  const handleMouseMoveDrag = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTranslateX(e.clientX - dragStart.x);
    setTranslateY(e.clientY - dragStart.y);
    e.stopPropagation();
  };

  const handleMouseUpDrag = (e?: React.MouseEvent) => {
    if (isDragging && e) {
      e.stopPropagation();
    }
    setIsDragging(false);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({ width: img.offsetWidth, height: img.offsetHeight });
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
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setScale(prev => Math.max(0.5, prev - 0.2))}
                        disabled={scale <= 0.5}
                      >
                        <Icon name="ZoomOut" size={16} />
                      </Button>
                      <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
                        {Math.round(scale * 100)}%
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setScale(prev => Math.min(3, prev + 0.2))}
                        disabled={scale >= 3}
                      >
                        <Icon name="ZoomIn" size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setScale(1);
                          setTranslateX(0);
                          setTranslateY(0);
                        }}
                        disabled={scale === 1}
                      >
                        <Icon name="Maximize2" size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    <FloorCanvas
                    currentFloorData={currentFloor}
                    isDrawing={false}
                    drawMode="polygon"
                    polygonPoints={[]}
                    editingRoomBorders={null}
                    editPolygonPoints={[]}
                    selectedRoomId={selectedRoom?.id}
                    areaStart={null}
                    areaEnd={null}
                    scale={scale}
                    translateX={translateX}
                    translateY={translateY}
                    isDragging={isDragging}
                    imageDimensions={imageDimensions}
                    onCanvasClick={() => {}}
                    onRoomClick={handleRoomClick}
                    onEditPointDrag={() => {}}
                    onAddEditPoint={() => {}}
                    onDeleteEditPoint={() => {}}
                    onWheel={handleWheel}
                    onMouseDownDrag={handleMouseDownDrag}
                    onMouseMoveDrag={handleMouseMoveDrag}
                    onMouseUpDrag={handleMouseUpDrag}
                    onImageLoad={handleImageLoad}
                  />
                    <div className="mt-3 text-xs text-muted-foreground text-center">
                      <Icon name="Info" size={14} className="inline mr-1" />
                      Используйте колесо мыши для масштабирования • При увеличении перетаскивайте схему мышью
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-muted/30 rounded-lg p-8 text-center">
                  <Icon name="ImageOff" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">План этажа не загружен</p>
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
                    <div className="text-3xl font-bold text-primary">№ {selectedRoom.room_number}</div>
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