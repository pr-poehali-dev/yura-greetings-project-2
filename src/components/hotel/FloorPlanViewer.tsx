import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import * as hotelApi from '@/lib/hotelApi';
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

interface Floor {
  id: number;
  floor_number: number;
  plan_image_url: string | null;
  rooms: Room[];
}

interface FloorPlanViewerProps {
  onRoomSelect: (room: Room) => void;
}

const FloorPlanViewer = ({ onRoomSelect }: FloorPlanViewerProps) => {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [currentFloor, setCurrentFloor] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [hoveredRoomId, setHoveredRoomId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFloors();
    
    const interval = setInterval(() => {
      loadFloors();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadFloors = async () => {
    try {
      setLoading(true);
      const floorsData = await hotelApi.getFloors();
      const allRooms = await hotelApi.getRooms();
      
      const floorsWithRooms = floorsData.map(floor => ({
        ...floor,
        rooms: allRooms
          .filter(room => room.floor_id === floor.id)
          .filter(room => 
            room.id && 
            room.room_number && 
            ['available', 'occupied', 'maintenance'].includes(room.status)
          )
      }));
      
      setFloors(floorsWithRooms);
      
      if (floorsWithRooms.length > 0) {
        setCurrentFloor(floorsWithRooms[0].id);
      }
    } catch (error) {
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить данные этажей",
        variant: "destructive"
      });
      console.error('Error loading floors:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentFloorData = floors.find(f => f.id === currentFloor);

  useEffect(() => {
    if (!currentFloorData?.plan_image_url) return;
    
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = currentFloorData.plan_image_url;
  }, [currentFloorData?.plan_image_url]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleMouseDownDrag = (e: React.MouseEvent) => {
    if (scale === 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - translateX, y: e.clientY - translateY });
  };

  const handleMouseMoveDrag = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTranslateX(e.clientX - dragStart.x);
    setTranslateY(e.clientY - dragStart.y);
  };

  const handleMouseUpDrag = () => {
    setIsDragging(false);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
  };

  const handleRoomClick = (room: Room) => {
    if (room.status !== 'available') {
      toast({
        title: "Номер недоступен",
        description: `Номер ${room.room_number} сейчас ${room.status === 'occupied' ? 'занят' : 'на ремонте'}`,
        variant: "destructive"
      });
      return;
    }
    
    setSelectedRoomId(room.id);
    onRoomSelect(room);
  };

  const availableRooms = currentFloorData?.rooms.filter(r => r.status === 'available') || [];

  if (loading) {
    return (
      <Card className="p-6 text-center">
        <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Загрузка плана этажа...</p>
      </Card>
    );
  }

  if (!currentFloorData || !currentFloorData.plan_image_url) {
    return (
      <Card className="p-6 text-center">
        <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">План этажа не найден</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Выберите номер на плане</h2>
          <Badge variant="secondary">
            {availableRooms.length} {availableRooms.length === 1 ? 'номер доступен' : 'номеров доступно'}
          </Badge>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {floors.map(floor => (
            <Button
              key={floor.id}
              variant={currentFloor === floor.id ? 'default' : 'outline'}
              onClick={() => setCurrentFloor(floor.id)}
              size="sm"
            >
              {floor.floor_number} этаж
            </Button>
          ))}
        </div>

        <div className="mb-4 p-3 bg-muted rounded-lg text-sm">
          <strong>Подсказка:</strong> Нажмите на зелёный номер для выбора. 
          Используйте колесико мыши для масштабирования плана.
        </div>

        <div
          className="relative border-2 rounded-lg overflow-hidden"
          style={{ 
            minHeight: '600px',
            cursor: isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'default'
          }}
          onWheel={handleWheel}
        >
          <div
            style={{
              transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
              transformOrigin: 'top left',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
            onMouseMove={handleMouseMoveDrag}
            onMouseDown={handleMouseDownDrag}
            onMouseUp={handleMouseUpDrag}
            onMouseLeave={handleMouseUpDrag}
          >
            <img
              ref={imgRef}
              src={currentFloorData.plan_image_url}
              alt={`План ${currentFloorData.floor_number} этажа`}
              className="w-full h-auto pointer-events-none select-none"
              draggable="false"
              onLoad={handleImageLoad}
            />
          
            {currentFloorData.rooms.map(room => {
              const color = room.status === 'available' ? '#22c55e' :
                           room.status === 'occupied' ? '#ef4444' : '#f59e0b';
              const isSelected = selectedRoomId === room.id;
              
              if (room.polygon && room.polygon.length > 0) {
                return null;
              }
              
              const isHovered = hoveredRoomId === room.id;
              
              return (
                <div
                  key={room.id}
                  className="absolute rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-all"
                  style={{
                    left: `${room.position_x}px`,
                    top: `${room.position_y}px`,
                    width: `${room.width || 60}px`,
                    height: `${room.height || 40}px`,
                    backgroundColor: color,
                    color: 'white',
                    opacity: isSelected ? 1 : isHovered ? 0.95 : 0.8,
                    border: isSelected ? '3px solid white' : isHovered ? '2px solid white' : 'none',
                    boxShadow: isSelected 
                      ? '0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.4)' 
                      : isHovered ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    zIndex: isSelected ? 10 : isHovered ? 5 : 1
                  }}
                  onClick={() => handleRoomClick(room)}
                  onMouseEnter={() => setHoveredRoomId(room.id)}
                  onMouseLeave={() => setHoveredRoomId(null)}
                  title={`${room.room_number} - ${room.category} - ${room.price}₽/ночь`}
                >
                  {room.room_number}
                </div>
              );
            })}
            
            <svg 
              className="absolute top-0 left-0" 
              width={imageDimensions.width}
              height={imageDimensions.height}
              style={{ pointerEvents: 'all' }}
            >
              {currentFloorData.rooms.map(room => {
                const color = room.status === 'available' ? '#22c55e' :
                             room.status === 'occupied' ? '#ef4444' : '#f59e0b';
                const isSelected = selectedRoomId === room.id;
                const isHovered = hoveredRoomId === room.id;
                
                if (room.polygon && room.polygon.length > 0) {
                  const points = room.polygon.map(p => `${p.x},${p.y}`).join(' ');
                  const centerX = room.polygon.reduce((sum, p) => sum + p.x, 0) / room.polygon.length;
                  const centerY = room.polygon.reduce((sum, p) => sum + p.y, 0) / room.polygon.length;
                  
                  return (
                    <g 
                      key={room.id} 
                      style={{ cursor: 'pointer' }} 
                      onClick={() => handleRoomClick(room)}
                      onMouseEnter={() => setHoveredRoomId(room.id)}
                      onMouseLeave={() => setHoveredRoomId(null)}
                    >
                      <polygon
                        points={points}
                        fill={color}
                        fillOpacity={isSelected ? "0.7" : isHovered ? "0.55" : "0.4"}
                        stroke={color}
                        strokeWidth="2"
                        className="transition-all"
                      />
                      {isSelected && (
                        <>
                          <polygon
                            points={points}
                            fill="none"
                            stroke="white"
                            strokeWidth="5"
                            strokeDasharray="10,5"
                            style={{ filter: 'drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.8))' }}
                          />
                        </>
                      )}
                      <text
                        x={centerX}
                        y={centerY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="16"
                        fontWeight="bold"
                        style={{ pointerEvents: 'none' }}
                      >
                        {room.room_number}
                      </text>
                    </g>
                  );
                }
                return null;
              })}
            </svg>
          </div>
        </div>

        <div className="mt-4 flex gap-4 text-sm justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Доступен</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>Занят</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500"></div>
            <span>Ремонт</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FloorPlanViewer;