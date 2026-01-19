import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import * as hotelApi from '@/lib/hotelApi';
import FloorPlanEditor from '@/components/hotel/FloorPlanEditor';
import BookingsList from '@/components/hotel/BookingsList';
import RoomEditModal from '@/components/hotel/RoomEditModal';

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
        <Tabs defaultValue="floors" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="floors">
              <Icon name="Building" size={16} className="mr-2" />
              Этажи
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Icon name="Calendar" size={16} className="mr-2" />
              Бронирования
            </TabsTrigger>
          </TabsList>

          <TabsContent value="floors">
            <FloorPlanEditor
              floors={floors}
              currentFloor={currentFloor}
              isDrawing={isDrawing}
              loading={loading}
              newRoom={newRoom}
              onFloorChange={setCurrentFloor}
              onImageUpload={handleImageUpload}
              onToggleDrawing={() => setIsDrawing(!isDrawing)}
              onCanvasClick={handleCanvasClick}
              onRoomClick={handleRoomClick}
              onNewRoomChange={setNewRoom}
            />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsList
              bookings={bookings}
              loading={loading}
              onRefresh={loadBookings}
            />
          </TabsContent>
        </Tabs>
      </div>

      <RoomEditModal
        selectedRoom={selectedRoom}
        loading={loading}
        onClose={() => setSelectedRoom(null)}
        onUpdate={handleUpdateRoom}
        onDelete={handleDeleteRoom}
        onChange={setSelectedRoom}
      />
    </div>
  );
};

export default HotelDashboard;
