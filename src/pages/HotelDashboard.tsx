import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import * as hotelApi from '@/lib/hotelApi';

interface Booking {
  id: number;
  room_id: number;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  check_in: string;
  check_out: string;
  total_price: number;
  status: string;
  room_number?: string;
  category?: string;
  floor_number?: number;
}

interface Room {
  id: number;
  room_number: string;
  floor_id: number;
  position_x: number;
  position_y: number;
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

const HotelDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [floors, setFloors] = useState<Floor[]>([]);
  const [currentFloor, setCurrentFloor] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    category: 'Стандарт',
    price: 3500,
    status: 'available'
  });

  useEffect(() => {
    const isAuth = localStorage.getItem('hotel_admin_auth');
    if (!isAuth) {
      navigate('/hotel-admin');
      return;
    }

    loadFloors();
  }, [navigate]);

  const loadFloors = async () => {
    try {
      setLoading(true);
      const floorsData = await hotelApi.getFloors();
      const allRooms = await hotelApi.getRooms();
      
      const floorsWithRooms = floorsData.map(floor => ({
        ...floor,
        rooms: allRooms.filter(room => room.floor_id === floor.id)
      }));
      
      setFloors(floorsWithRooms);
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

  const loadBookings = async () => {
    try {
      const bookingsData = await hotelApi.getBookings();
      setBookings(bookingsData);
    } catch (error) {
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить бронирования",
        variant: "destructive"
      });
      console.error('Error loading bookings:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hotel_admin_auth');
    navigate('/hotel-admin');
  };

  const handleImageUpload = async (floorId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      
      try {
        setLoading(true);
        const cdnUrl = await hotelApi.uploadImage(base64Data, file.name);
        await hotelApi.updateFloorImage(floorId, cdnUrl);
        
        setFloors(floors.map(floor =>
          floor.id === floorId ? { ...floor, plan_image_url: cdnUrl } : floor
        ));
        
        toast({
          title: "Схема загружена",
          description: `Схема ${floorId} этажа успешно загружена`
        });
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить схему",
          variant: "destructive"
        });
        console.error('Error uploading image:', error);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCanvasClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const roomNumber = prompt('Номер комнаты:');
    if (!roomNumber) return;

    try {
      setLoading(true);
      const newRoomData = await hotelApi.createRoom({
        floor_id: currentFloor,
        room_number: roomNumber,
        category: newRoom.category || 'Стандарт',
        price: newRoom.price || 3500,
        position_x: x,
        position_y: y,
        status: newRoom.status || 'available'
      });

      setFloors(floors.map(floor =>
        floor.id === currentFloor
          ? { ...floor, rooms: [...floor.rooms, newRoomData] }
          : floor
      ));

      setIsDrawing(false);

      toast({
        title: "Номер добавлен",
        description: `Номер ${roomNumber} добавлен на схему`
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить номер",
        variant: "destructive"
      });
      console.error('Error creating room:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomClick = (room: Room, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRoom(room);
  };

  const handleUpdateRoom = async () => {
    if (!selectedRoom) return;

    try {
      setLoading(true);
      const updatedRoomData = await hotelApi.updateRoom({
        id: selectedRoom.id,
        room_number: selectedRoom.room_number,
        category: selectedRoom.category,
        price: selectedRoom.price,
        position_x: selectedRoom.position_x,
        position_y: selectedRoom.position_y,
        status: selectedRoom.status
      });

      setFloors(floors.map(floor =>
        floor.id === selectedRoom.floor_id
          ? {
              ...floor,
              rooms: floor.rooms.map(r =>
                r.id === selectedRoom.id ? updatedRoomData : r
              )
            }
          : floor
      ));

      toast({
        title: "Номер обновлён",
        description: `Данные номера ${selectedRoom.room_number} обновлены`
      });
      setSelectedRoom(null);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить номер",
        variant: "destructive"
      });
      console.error('Error updating room:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    try {
      setLoading(true);
      await hotelApi.deleteRoom(roomId);

      setFloors(floors.map(floor => ({
        ...floor,
        rooms: floor.rooms.filter(r => r.id !== roomId)
      })));

      setSelectedRoom(null);
      toast({
        title: "Номер удалён",
        description: "Номер удалён со схемы"
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить номер",
        variant: "destructive"
      });
      console.error('Error deleting room:', error);
    } finally {
      setLoading(false);
    }
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
                    disabled={loading}
                  >
                    {floor.floor_number} этаж
                  </Button>
                ))}
              </div>

              {currentFloorData && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Загрузить схему {currentFloorData.floor_number} этажа
                    </label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(currentFloor, e)}
                      disabled={loading}
                    />
                  </div>

                  {currentFloorData.plan_image_url && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Button
                          variant={isDrawing ? 'default' : 'outline'}
                          onClick={() => setIsDrawing(!isDrawing)}
                          disabled={loading}
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
                        className="relative border-2 border-dashed rounded-lg overflow-hidden"
                        style={{ cursor: isDrawing ? 'crosshair' : 'default' }}
                        onClick={handleCanvasClick}
                      >
                        <img
                          src={currentFloorData.plan_image_url}
                          alt={`План ${currentFloorData.floor_number} этажа`}
                          className="w-full"
                        />
                        {currentFloorData.rooms.map(room => (
                          <div
                            key={room.id}
                            className="absolute bg-blue-500/70 hover:bg-blue-600/70 border-2 border-blue-700 rounded cursor-pointer flex items-center justify-center text-white font-bold transition-colors"
                            style={{
                              left: room.position_x,
                              top: room.position_y,
                              width: 80,
                              height: 60
                            }}
                            onClick={(e) => handleRoomClick(room, e)}
                          >
                            {room.room_number}
                          </div>
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Бронирования</h2>
                <Button onClick={loadBookings} disabled={loading}>
                  <Icon name="RefreshCw" size={16} className="mr-2" />
                  Обновить
                </Button>
              </div>

              {bookings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Нет активных бронирований</p>
              ) : (
                <div className="space-y-4">
                  {bookings.map(booking => (
                    <Card key={booking.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Icon name="User" size={16} />
                            <span className="font-semibold">{booking.guest_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Icon name="Mail" size={14} />
                            {booking.guest_email}
                          </div>
                          {booking.guest_phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Icon name="Phone" size={14} />
                              {booking.guest_phone}
                            </div>
                          )}
                        </div>
                        <div className="text-right space-y-1">
                          <div className="font-semibold">
                            Номер {booking.room_number} ({booking.floor_number} этаж)
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {booking.category}
                          </div>
                          <div className="text-sm font-medium">
                            {booking.total_price} ₽
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-muted-foreground">Заезд:</span>{' '}
                            <span className="font-medium">{new Date(booking.check_in).toLocaleDateString('ru-RU')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Выезд:</span>{' '}
                            <span className="font-medium">{new Date(booking.check_out).toLocaleDateString('ru-RU')}</span>
                          </div>
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status === 'confirmed' ? 'Подтверждено' :
                             booking.status === 'pending' ? 'Ожидает' : booking.status}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedRoom(null)}>
          <Card className="p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Редактировать номер {selectedRoom.room_number}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Номер комнаты</label>
                <Input
                  value={selectedRoom.room_number}
                  onChange={(e) => setSelectedRoom({ ...selectedRoom, room_number: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Категория</label>
                <Input
                  value={selectedRoom.category}
                  onChange={(e) => setSelectedRoom({ ...selectedRoom, category: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Цена за ночь</label>
                <Input
                  type="number"
                  value={selectedRoom.price}
                  onChange={(e) => setSelectedRoom({ ...selectedRoom, price: Number(e.target.value) })}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Статус</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={selectedRoom.status}
                  onChange={(e) => setSelectedRoom({ ...selectedRoom, status: e.target.value })}
                  disabled={loading}
                >
                  <option value="available">Доступен</option>
                  <option value="occupied">Занят</option>
                  <option value="maintenance">Ремонт</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setSelectedRoom(null)} disabled={loading}>
                  Отмена
                </Button>
                <Button variant="destructive" onClick={() => handleDeleteRoom(selectedRoom.id)} disabled={loading}>
                  Удалить
                </Button>
                <Button onClick={handleUpdateRoom} disabled={loading}>
                  Сохранить
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HotelDashboard;