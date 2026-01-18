import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface Room {
  id: string;
  number: string;
  type: string;
  area: number;
  rooms: number;
  capacity: number;
  price: number;
  available: boolean;
  position: { x: number; y: number; width: number; height: number };
  views: string[];
  amenities: string[];
  bedTypes?: string[];
  polygon?: { x: number; y: number }[];
}

interface Floor {
  id: string;
  number: string;
  planImage: string;
  rooms: Room[];
}

interface FloorPlanEditorProps {
  floors: Floor[];
  currentFloor: string;
  onFloorsChange: (floors: Floor[]) => void;
  onCurrentFloorChange: (floorId: string) => void;
  onRoomEdit: (room: Room) => void;
  onRoomDelete: (roomId: string) => void;
  onFloorUpload: (file: File) => void;
  onFloorDelete: (floorId: string) => void;
}

export default function FloorPlanEditor({
  floors,
  currentFloor,
  onFloorsChange,
  onCurrentFloorChange,
  onRoomEdit,
  onRoomDelete,
  onFloorUpload,
  onFloorDelete
}: FloorPlanEditorProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'rectangle' | 'polygon'>('rectangle');
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [polygonPoints, setPolygonPoints] = useState<{ x: number; y: number }[]>([]);
  const [imageRef, setImageRef] = useState<HTMLDivElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFloorUpload(file);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef || !isDrawing) return;
    
    const rect = imageRef.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (drawMode === 'polygon') {
      setPolygonPoints([...polygonPoints, { x, y }]);
    } else {
      setDrawStart({ x, y });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef || !isDrawing || !drawStart || drawMode === 'polygon') return;
    
    const rect = imageRef.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const roomNumber = prompt('Введите номер комнаты:');
    if (!roomNumber) {
      setDrawStart(null);
      return;
    }

    const newRoom: Room = {
      id: Date.now().toString(),
      number: roomNumber,
      type: 'Стандарт',
      area: 30,
      rooms: 1,
      capacity: 2,
      price: 6000,
      available: true,
      position: {
        x: Math.min(drawStart.x, x),
        y: Math.min(drawStart.y, y),
        width: Math.abs(x - drawStart.x),
        height: Math.abs(y - drawStart.y)
      },
      views: [],
      amenities: ['Ванная комната', 'Wi-Fi', 'Кондиционер', 'Телевизор'],
      bedTypes: []
    };

    onFloorsChange(floors.map(f => 
      f.id === currentFloor 
        ? { ...f, rooms: [...f.rooms, newRoom] }
        : f
    ));

    setDrawStart(null);
  };

  const completePolygon = () => {
    if (polygonPoints.length < 3) {
      alert('Нужно минимум 3 точки для создания номера');
      return;
    }

    const roomNumber = prompt('Введите номер комнаты:');
    if (!roomNumber) {
      setPolygonPoints([]);
      return;
    }

    const xs = polygonPoints.map(p => p.x);
    const ys = polygonPoints.map(p => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    const newRoom: Room = {
      id: Date.now().toString(),
      number: roomNumber,
      type: 'Стандарт',
      area: 30,
      rooms: 1,
      capacity: 2,
      price: 6000,
      available: true,
      position: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      },
      polygon: polygonPoints,
      views: [],
      amenities: ['Ванная комната', 'Wi-Fi', 'Кондиционер', 'Телевизор'],
      bedTypes: []
    };

    onFloorsChange(floors.map(f => 
      f.id === currentFloor 
        ? { ...f, rooms: [...f.rooms, newRoom] }
        : f
    ));

    setPolygonPoints([]);
  };

  const cancelPolygon = () => {
    setPolygonPoints([]);
  };

  const currentFloorData = floors.find(f => f.id === currentFloor);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="floor-upload">Загрузить план этажа</Label>
            <Input
              id="floor-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>

          {floors.length > 0 && (
            <>
              <div className="flex-1 space-y-2">
                <Label htmlFor="floor-select">Выбрать этаж</Label>
                <Select value={currentFloor} onValueChange={onCurrentFloorChange}>
                  <SelectTrigger id="floor-select">
                    <SelectValue placeholder="Выберите этаж" />
                  </SelectTrigger>
                  <SelectContent>
                    {floors.map(floor => (
                      <SelectItem key={floor.id} value={floor.id}>
                        Этаж {floor.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {currentFloorData && (
                <Button
                  onClick={() => onFloorDelete(currentFloor)}
                  variant="destructive"
                  size="lg"
                >
                  <Icon name="Trash2" className="mr-2" />
                  Удалить этаж
                </Button>
              )}
            </>
          )}

          {currentFloorData && (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setIsDrawing(!isDrawing);
                  setPolygonPoints([]);
                }}
                variant={isDrawing ? 'default' : 'outline'}
                size="lg"
              >
                <Icon name={isDrawing ? 'Check' : 'PenTool'} className="mr-2" />
                {isDrawing ? 'Завершить разметку' : 'Начать разметку'}
              </Button>
              {isDrawing && (
                <Select value={drawMode} onValueChange={(v) => setDrawMode(v as 'rectangle' | 'polygon')}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rectangle">
                      <div className="flex items-center gap-2">
                        <Icon name="Square" size={16} />
                        Прямоугольник
                      </div>
                    </SelectItem>
                    <SelectItem value="polygon">
                      <div className="flex items-center gap-2">
                        <Icon name="Pentagon" size={16} />
                        Произвольная форма
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>

        {currentFloorData && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {isDrawing 
                  ? drawMode === 'polygon'
                    ? 'Кликайте на план для создания точек контура. Минимум 3 точки.'
                    : 'Кликните и перетащите мышью для создания прямоугольной зоны номера'
                  : 'Нажмите "Начать разметку" для добавления номеров'}
              </p>
              {isDrawing && drawMode === 'polygon' && polygonPoints.length > 0 && (
                <div className="flex gap-2">
                  <Button onClick={completePolygon} size="sm" variant="default">
                    <Icon name="Check" size={16} className="mr-1" />
                    Завершить ({polygonPoints.length} точек)
                  </Button>
                  <Button onClick={cancelPolygon} size="sm" variant="outline">
                    <Icon name="X" size={16} className="mr-1" />
                    Отмена
                  </Button>
                </div>
              )}
            </div>
            <div
              ref={setImageRef}
              className="relative w-full aspect-[3/2] bg-background rounded-xl overflow-hidden border-2 border-border"
              onMouseDown={drawMode === 'rectangle' ? (e) => {
                if (!imageRef || !isDrawing) return;
                const rect = imageRef.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setDrawStart({ x, y });
              } : undefined}
              onMouseUp={handleMouseUp}
              onClick={drawMode === 'polygon' ? handleClick : undefined}
            >
              <img
                src={currentFloorData.planImage}
                alt="План этажа"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />

              {currentFloorData.rooms.map(room => (
                <div
                  key={room.id}
                  className="absolute group cursor-pointer"
                  style={{
                    left: `${room.position.x}%`,
                    top: `${room.position.y}%`,
                    width: `${room.position.width}%`,
                    height: `${room.position.height}%`
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRoomEdit(room);
                  }}
                >
                  {room.polygon ? (
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <polygon
                        points={room.polygon.map(p => 
                          `${((p.x - room.position.x) / room.position.width) * 100},${((p.y - room.position.y) / room.position.height) * 100}`
                        ).join(' ')}
                        className="fill-primary/30 stroke-primary stroke-[2]"
                      />
                    </svg>
                  ) : (
                    <div className="w-full h-full bg-primary/30 border-2 border-primary rounded-lg" />
                  )}
                  
                  <div className="absolute inset-0 flex items-center justify-center hover:bg-primary/10 transition-colors">
                    <span className="text-lg font-bold text-white drop-shadow-lg">
                      {room.number}
                    </span>
                  </div>

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 pointer-events-auto">
                    <Button
                      size="icon"
                      variant="default"
                      className="h-8 w-8 shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRoomEdit(room);
                      }}
                    >
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRoomDelete(room.id);
                      }}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              ))}

              {isDrawing && drawMode === 'polygon' && polygonPoints.length > 0 && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <polyline
                    points={polygonPoints.map(p => `${p.x},${p.y}`).join(' ')}
                    className="fill-none stroke-primary stroke-[0.5]"
                  />
                  {polygonPoints.map((point, i) => (
                    <circle
                      key={i}
                      cx={point.x}
                      cy={point.y}
                      r="0.8"
                      className="fill-primary"
                    />
                  ))}
                </svg>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}