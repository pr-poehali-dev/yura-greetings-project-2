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
}

export default function FloorPlanEditor({
  floors,
  currentFloor,
  onFloorsChange,
  onCurrentFloorChange,
  onRoomEdit,
  onRoomDelete,
  onFloorUpload
}: FloorPlanEditorProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [imageRef, setImageRef] = useState<HTMLDivElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFloorUpload(file);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef || !isDrawing) return;
    
    const rect = imageRef.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setDrawStart({ x, y });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef || !isDrawing || !drawStart) return;
    
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
      amenities: ['Ванная комната', 'Wi-Fi', 'Кондиционер', 'Телевизор']
    };

    onFloorsChange(floors.map(f => 
      f.id === currentFloor 
        ? { ...f, rooms: [...f.rooms, newRoom] }
        : f
    ));

    setDrawStart(null);
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
          )}

          {currentFloorData && (
            <Button
              onClick={() => setIsDrawing(!isDrawing)}
              variant={isDrawing ? 'default' : 'outline'}
              size="lg"
            >
              <Icon name={isDrawing ? 'Check' : 'PenTool'} className="mr-2" />
              {isDrawing ? 'Завершить разметку' : 'Начать разметку'}
            </Button>
          )}
        </div>

        {currentFloorData && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              {isDrawing 
                ? 'Кликните и перетащите мышью для создания зоны номера на плане этажа' 
                : 'Нажмите "Начать разметку" для добавления номеров'}
            </p>
            <div
              ref={setImageRef}
              className="relative w-full aspect-[3/2] bg-background rounded-xl overflow-hidden border-2 border-border"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
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
                  onClick={() => onRoomEdit(room)}
                >
                  <div className="w-full h-full bg-primary/30 border-2 border-primary rounded-lg flex items-center justify-center relative hover:bg-primary/40 transition-colors">
                    <span className="text-lg font-bold text-white drop-shadow-lg">
                      {room.number}
                    </span>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
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
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
