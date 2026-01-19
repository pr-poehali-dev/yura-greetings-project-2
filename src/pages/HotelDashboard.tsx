import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Room {
  id: string;
  number: string;
  floor: number;
  x: number;
  y: number;
  width: number;
  height: number;
  category: string;
  price: number;
  description: string;
}

interface Floor {
  id: number;
  name: string;
  imageUrl: string;
  rooms: Room[];
}

const HotelDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [floors, setFloors] = useState<Floor[]>([]);
  const [currentFloor, setCurrentFloor] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    category: 'Стандарт',
    price: 3500,
    description: ''
  });

  useEffect(() => {
    const isAuth = localStorage.getItem('hotel_admin_auth');
    if (!isAuth) {
      navigate('/hotel-admin');
      return;
    }

    const savedFloors = localStorage.getItem('hotel_floors');
    if (savedFloors) {
      setFloors(JSON.parse(savedFloors));
    } else {
      setFloors([
        { id: 1, name: '1 этаж', imageUrl: '', rooms: [] },
        { id: 2, name: '2 этаж', imageUrl: '', rooms: [] },
        { id: 3, name: '3 этаж', imageUrl: '', rooms: [] }
      ]);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('hotel_admin_auth');
    navigate('/hotel-admin');
  };

  const handleImageUpload = (floorId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      const updatedFloors = floors.map(floor =>
        floor.id === floorId ? { ...floor, imageUrl } : floor
      );
      setFloors(updatedFloors);
      localStorage.setItem('hotel_floors', JSON.stringify(updatedFloors));
      toast({
        title: "Схема загружена",
        description: `Схема ${floorId} этажа успешно загружена`
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const roomNumber = prompt('Номер комнаты:');
    if (!roomNumber) return;

    const newRoomData: Room = {
      id: `${currentFloor}-${roomNumber}`,
      number: roomNumber,
      floor: currentFloor,
      x,
      y,
      width: 80,
      height: 60,
      category: newRoom.category || 'Стандарт',
      price: newRoom.price || 3500,
      description: newRoom.description || ''
    };

    const updatedFloors = floors.map(floor =>
      floor.id === currentFloor
        ? { ...floor, rooms: [...floor.rooms, newRoomData] }
        : floor
    );

    setFloors(updatedFloors);
    localStorage.setItem('hotel_floors', JSON.stringify(updatedFloors));
    setIsDrawing(false);

    toast({
      title: "Номер добавлен",
      description: `Номер ${roomNumber} добавлен на схему`
    });
  };

  const handleRoomClick = (room: Room, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRoom(room);
  };

  const handleUpdateRoom = () => {
    if (!selectedRoom) return;

    const updatedFloors = floors.map(floor =>
      floor.id === selectedRoom.floor
        ? {
            ...floor,
            rooms: floor.rooms.map(r =>
              r.id === selectedRoom.id ? selectedRoom : r
            )
          }
        : floor
    );

    setFloors(updatedFloors);
    localStorage.setItem('hotel_floors', JSON.stringify(updatedFloors));
    toast({
      title: "Номер обновлён",
      description: `Данные номера ${selectedRoom.number} обновлены`
    });
    setSelectedRoom(null);
  };

  const handleDeleteRoom = (roomId: string) => {
    const updatedFloors = floors.map(floor => ({
      ...floor,
      rooms: floor.rooms.filter(r => r.id !== roomId)
    }));

    setFloors(updatedFloors);
    localStorage.setItem('hotel_floors', JSON.stringify(updatedFloors));
    setSelectedRoom(null);
    toast({
      title: "Номер удалён",
      description: "Номер удалён со схемы"
    });
  };

  const currentFloorData = floors.find(f => f.id === currentFloor);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Icon name="Hotel" size={32} className="text-primary" />
            <div>
              <h1 className="text-xl font-bold">IVAN HOTEL</h1>
              <p className="text-sm text-muted-foreground">Панель управления</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <Icon name="LogOut" size={16} className="mr-2" />
            Выход
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="floors" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="floors">Схемы этажей</TabsTrigger>
            <TabsTrigger value="bookings">Бронирования</TabsTrigger>
          </TabsList>

          <TabsContent value="floors" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Управление этажами</h2>
              
              <div className="flex gap-2 mb-6">
                {floors.map(floor => (
                  <Button
                    key={floor.id}
                    variant={currentFloor === floor.id ? 'default' : 'outline'}
                    onClick={() => setCurrentFloor(floor.id)}
                  >
                    {floor.name}
                  </Button>
                ))}
              </div>

              {currentFloorData && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Загрузить схему {currentFloorData.name}
                    </label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(currentFloor, e)}
                    />
                  </div>

                  {currentFloorData.imageUrl && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Button
                          variant={isDrawing ? 'default' : 'outline'}
                          onClick={() => setIsDrawing(!isDrawing)}
                        >
                          <Icon name={isDrawing ? 'Check' : 'Plus'} size={16} className="mr-2" />
                          {isDrawing ? 'Режим добавления (нажмите на схему)' : 'Добавить номер'}
                        </Button>

                        {isDrawing && (
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              placeholder="Категория"
                              value={newRoom.category}
                              onChange={(e) => setNewRoom({ ...newRoom, category: e.target.value })}
                              className="w-32"
                            />
                            <Input
                              type="number"
                              placeholder="Цена"
                              value={newRoom.price}
                              onChange={(e) => setNewRoom({ ...newRoom, price: Number(e.target.value) })}
                              className="w-32"
                            />
                          </div>
                        )}
                      </div>

                      <div
                        className="relative border-2 border-dashed border-primary/20 rounded-lg overflow-hidden"
                        style={{ cursor: isDrawing ? 'crosshair' : 'default' }}
                        onClick={handleCanvasClick}
                      >
                        <img
                          src={currentFloorData.imageUrl}
                          alt={currentFloorData.name}
                          className="w-full h-auto"
                        />
                        
                        {currentFloorData.rooms.map(room => (
                          <div
                            key={room.id}
                            className="absolute bg-primary/30 border-2 border-primary rounded cursor-pointer hover:bg-primary/50 transition-colors flex items-center justify-center"
                            style={{
                              left: room.x,
                              top: room.y,
                              width: room.width,
                              height: room.height
                            }}
                            onClick={(e) => handleRoomClick(room, e)}
                          >
                            <span className="font-bold text-white text-sm">{room.number}</span>
                          </div>
                        ))}
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        {currentFloorData.rooms.map(room => (
                          <Card key={room.id} className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-bold text-lg">№ {room.number}</div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRoom(room.id)}
                              >
                                <Icon name="Trash2" size={16} className="text-red-500" />
                              </Button>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>{room.category}</div>
                              <div className="font-bold text-primary">{room.price} ₽/ночь</div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Бронирования</h2>
              <p className="text-muted-foreground">Здесь будет отображаться список бронирований</p>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedRoom && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6">
              <h3 className="text-xl font-bold mb-4">Редактировать номер {selectedRoom.number}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Номер</label>
                  <Input
                    value={selectedRoom.number}
                    onChange={(e) => setSelectedRoom({ ...selectedRoom, number: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Категория</label>
                  <Input
                    value={selectedRoom.category}
                    onChange={(e) => setSelectedRoom({ ...selectedRoom, category: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Цена за ночь (₽)</label>
                  <Input
                    type="number"
                    value={selectedRoom.price}
                    onChange={(e) => setSelectedRoom({ ...selectedRoom, price: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Описание</label>
                  <Input
                    value={selectedRoom.description}
                    onChange={(e) => setSelectedRoom({ ...selectedRoom, description: e.target.value })}
                    placeholder="Описание номера"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleUpdateRoom} className="flex-1">
                    <Icon name="Save" size={16} className="mr-2" />
                    Сохранить
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedRoom(null)} className="flex-1">
                    Отмена
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelDashboard;
