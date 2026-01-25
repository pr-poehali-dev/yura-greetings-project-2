import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

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
  onRoomSelect?: (room: Room) => void;
}

const FloorPlanViewer = ({ onRoomSelect }: FloorPlanViewerProps) => {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [currentFloor, setCurrentFloor] = useState<number | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const stored = localStorage.getItem('hotel-admin-floors');
    if (stored) {
      const parsed = JSON.parse(stored);
      setFloors(parsed);
      if (parsed.length > 0) {
        setCurrentFloor(parsed[0].id);
      }
    }
  }, []);

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
    e.stopPropagation();
  };

  const handleMouseMoveDrag = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTranslateX(e.clientX - dragStart.x);
    setTranslateY(e.clientY - dragStart.y);
    e.stopPropagation();
  };

  const handleMouseUpDrag = () => {
    setIsDragging(false);
  };

  const handleRoomClick = (room: Room) => {
    if (room.status === 'available' && onRoomSelect) {
      onRoomSelect(room);
    }
  };

  const isRoomAvailable = (room: Room) => room.status === 'available';

  const getRoomColor = (room: Room) => {
    if (hoveredRoom === room.id && isRoomAvailable(room)) {
      return 'rgba(34, 197, 94, 0.6)';
    }
    if (room.status === 'available') return 'rgba(34, 197, 94, 0.3)';
    if (room.status === 'occupied') return 'rgba(239, 68, 68, 0.3)';
    return 'rgba(251, 146, 60, 0.3)';
  };

  const getRoomStrokeColor = (room: Room) => {
    if (hoveredRoom === room.id && isRoomAvailable(room)) {
      return 'rgb(22, 163, 74)';
    }
    if (room.status === 'available') return 'rgb(34, 197, 94)';
    if (room.status === 'occupied') return 'rgb(239, 68, 68)';
    return 'rgb(251, 146, 60)';
  };

  if (floors.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-bold mb-2">План этажа недоступен</h2>
        <p className="text-muted-foreground">Администратор ещё не загрузил схему отеля</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Выберите номер на плане этажа</h2>
        {floors.length > 1 && (
          <div className="flex gap-2">
            {floors.map(floor => (
              <button
                key={floor.id}
                onClick={() => setCurrentFloor(floor.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentFloor === floor.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {floor.floor_number} этаж
              </button>
            ))}
          </div>
        )}
      </div>

      <Card className="p-6">
        {currentFloorData?.plan_image_url && (
          <>
            <div className="mb-2 p-2 bg-blue-100 dark:bg-blue-900 rounded text-xs">
              <strong>Режим просмотра:</strong> Масштаб: {Math.round(scale * 100)}% | 
              Доступных номеров: {currentFloorData.rooms.filter(r => r.status === 'available').length}
            </div>

            <div
              className="relative border-2 border-border rounded-lg overflow-hidden bg-muted"
              style={{
                height: '600px',
                cursor: isDragging ? 'grabbing' : (scale > 1 ? 'grab' : 'default')
              }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDownDrag}
              onMouseMove={handleMouseMoveDrag}
              onMouseUp={handleMouseUpDrag}
              onMouseLeave={handleMouseUpDrag}
            >
              <div
                style={{
                  transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <img
                  src={currentFloorData.plan_image_url}
                  alt="План этажа"
                  className="max-w-full max-h-full object-contain"
                  draggable={false}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                  }}
                />

                <svg
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: imageDimensions.width,
                    height: imageDimensions.height,
                    pointerEvents: 'none'
                  }}
                >
                  {currentFloorData.rooms.map((room) => {
                    if (!room.polygon || room.polygon.length === 0) return null;
                    
                    const points = room.polygon.map(p => `${p.x},${p.y}`).join(' ');
                    const centerX = room.polygon.reduce((sum, p) => sum + p.x, 0) / room.polygon.length;
                    const centerY = room.polygon.reduce((sum, p) => sum + p.y, 0) / room.polygon.length;

                    return (
                      <g key={room.id}>
                        <polygon
                          points={points}
                          fill={getRoomColor(room)}
                          stroke={getRoomStrokeColor(room)}
                          strokeWidth={hoveredRoom === room.id ? 3 : 2}
                          style={{
                            pointerEvents: 'auto',
                            cursor: isRoomAvailable(room) ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={() => setHoveredRoom(room.id)}
                          onMouseLeave={() => setHoveredRoom(null)}
                          onClick={() => handleRoomClick(room)}
                        />
                        <text
                          x={centerX}
                          y={centerY}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="black"
                          fontSize={14}
                          fontWeight="bold"
                          style={{ pointerEvents: 'none', userSelect: 'none' }}
                        >
                          {room.room_number}
                        </text>
                        {hoveredRoom === room.id && (
                          <text
                            x={centerX}
                            y={centerY + 16}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="black"
                            fontSize={12}
                            style={{ pointerEvents: 'none', userSelect: 'none' }}
                          >
                            {room.price}₽/ночь
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            <div className="mt-4 flex gap-4 text-sm">
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
          </>
        )}

        {!currentFloorData?.plan_image_url && (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Icon name="Upload" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">План этажа пока не загружен</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FloorPlanViewer;
