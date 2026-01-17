import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

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

export default function AdminPanel() {
  const { toast } = useToast();
  const [floors, setFloors] = useState<Floor[]>([]);
  const [currentFloor, setCurrentFloor] = useState<string>('');
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [imageRef, setImageRef] = useState<HTMLDivElement | null>(null);

  const handleFloorPlanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const floorNumber = prompt('Введите номер этажа:');
      if (!floorNumber) return;

      const newFloor: Floor = {
        id: Date.now().toString(),
        number: floorNumber,
        planImage: event.target?.result as string,
        rooms: []
      };

      setFloors([...floors, newFloor]);
      setCurrentFloor(newFloor.id);
      
      toast({
        title: 'План этажа загружен',
        description: `Этаж ${floorNumber} добавлен. Теперь отметьте границы номеров.`,
      });
    };
    reader.readAsDataURL(file);
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

    setFloors(floors.map(f => 
      f.id === currentFloor 
        ? { ...f, rooms: [...f.rooms, newRoom] }
        : f
    ));

    setDrawStart(null);
    toast({
      title: 'Номер добавлен',
      description: `Комната №${roomNumber} добавлена на этаж`,
    });
  };

  const handleRoomPhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || selectedRooms.length === 0) return;

    const readers: Promise<string>[] = [];
    
    Array.from(files).forEach(file => {
      const promise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.readAsDataURL(file);
      });
      readers.push(promise);
    });

    Promise.all(readers).then(images => {
      setFloors(floors.map(f => ({
        ...f,
        rooms: f.rooms.map(r => 
          selectedRooms.includes(r.id)
            ? { ...r, views: [...r.views, ...images] }
            : r
        )
      })));

      toast({
        title: 'Фотографии добавлены',
        description: `Добавлено ${images.length} фото для ${selectedRooms.length} номеров`,
      });

      setSelectedRooms([]);
    });
  };

  const toggleRoomSelection = (roomId: string) => {
    setSelectedRooms(prev => 
      prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const deleteRoom = (roomId: string) => {
    setFloors(floors.map(f => ({
      ...f,
      rooms: f.rooms.filter(r => r.id !== roomId)
    })));
    
    toast({
      title: 'Номер удален',
      description: 'Комната удалена с плана этажа',
    });
  };

  const exportConfiguration = () => {
    const config = JSON.stringify(floors, null, 2);
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hotel-configuration.json';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Конфигурация экспортирована',
      description: 'Файл конфигурации сохранен',
    });
  };

  const currentFloorData = floors.find(f => f.id === currentFloor);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Административная панель
            </h1>
            <p className="text-muted-foreground mt-2">Управление планами этажей и номерами</p>
          </div>
          <Button onClick={exportConfiguration} variant="outline" size="lg">
            <Icon name="Download" className="mr-2" />
            Экспортировать конфигурацию
          </Button>
        </div>

        <Tabs defaultValue="floors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="floors">
              <Icon name="Building2" className="mr-2" size={18} />
              Этажи
            </TabsTrigger>
            <TabsTrigger value="rooms">
              <Icon name="DoorOpen" className="mr-2" size={18} />
              Номера
            </TabsTrigger>
          </TabsList>

          <TabsContent value="floors" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="floor-upload" className="text-lg font-semibold">
                    Загрузить план этажа
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Загрузите изображение плана этажа (PNG, JPG)
                  </p>
                  <Input
                    id="floor-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFloorPlanUpload}
                    className="cursor-pointer"
                  />
                </div>

                {floors.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
                    {floors.map(floor => (
                      <Card
                        key={floor.id}
                        className={`p-4 cursor-pointer transition-all ${
                          currentFloor === floor.id
                            ? 'ring-2 ring-primary bg-primary/10'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setCurrentFloor(floor.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">Этаж {floor.number}</span>
                          <Badge variant="secondary">{floor.rooms.length}</Badge>
                        </div>
                        <img
                          src={floor.planImage}
                          alt={`Этаж ${floor.number}`}
                          className="w-full aspect-video object-cover rounded"
                        />
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {currentFloorData && (
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">
                      Этаж {currentFloorData.number} — Разметка номеров
                    </h3>
                    <Button
                      onClick={() => setIsDrawing(!isDrawing)}
                      variant={isDrawing ? 'destructive' : 'default'}
                    >
                      <Icon name={isDrawing ? 'X' : 'PenTool'} className="mr-2" />
                      {isDrawing ? 'Отменить рисование' : 'Добавить номер'}
                    </Button>
                  </div>

                  {isDrawing && (
                    <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                      <p className="text-sm flex items-center gap-2">
                        <Icon name="Info" size={16} />
                        Кликните и перетащите мышь, чтобы выделить границы номера на плане
                      </p>
                    </div>
                  )}

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
                        className="absolute group"
                        style={{
                          left: `${room.position.x}%`,
                          top: `${room.position.y}%`,
                          width: `${room.position.width}%`,
                          height: `${room.position.height}%`
                        }}
                      >
                        <div className="w-full h-full bg-primary/30 border-2 border-primary rounded-lg flex items-center justify-center relative">
                          <span className="text-lg font-bold text-white drop-shadow-lg">
                            {room.number}
                          </span>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            onClick={() => deleteRoom(room.id)}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rooms" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Управление фотографиями</h3>
                    <p className="text-sm text-muted-foreground">
                      Выберите номера и загрузите фотографии видов
                    </p>
                  </div>
                  {selectedRooms.length > 0 && (
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-base px-4 py-2">
                        Выбрано: {selectedRooms.length}
                      </Badge>
                      <Label htmlFor="room-photos" className="cursor-pointer">
                        <Button asChild>
                          <span>
                            <Icon name="Upload" className="mr-2" />
                            Загрузить фото
                          </span>
                        </Button>
                      </Label>
                      <Input
                        id="room-photos"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleRoomPhotosUpload}
                      />
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {floors.flatMap(floor =>
                    floor.rooms.map(room => (
                      <Card
                        key={room.id}
                        className={`p-4 cursor-pointer transition-all ${
                          selectedRooms.includes(room.id)
                            ? 'ring-2 ring-primary bg-primary/10'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => toggleRoomSelection(room.id)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">Номер {room.number}</h4>
                            <p className="text-sm text-muted-foreground">Этаж {floor.number}</p>
                          </div>
                          <Badge variant={room.views.length > 0 ? 'default' : 'secondary'}>
                            {room.views.length} фото
                          </Badge>
                        </div>

                        {room.views.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {room.views.slice(0, 3).map((view, idx) => (
                              <img
                                key={idx}
                                src={view}
                                alt={`Вид ${idx + 1}`}
                                className="w-full aspect-square object-cover rounded"
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="bg-muted/30 aspect-video rounded flex items-center justify-center">
                            <Icon name="ImageOff" size={32} className="text-muted-foreground" />
                          </div>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}