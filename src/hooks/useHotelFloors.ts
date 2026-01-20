import { useState } from 'react';
import * as hotelApi from '@/lib/hotelApi';

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

export const useHotelFloors = (toast: any) => {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [currentFloor, setCurrentFloor] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

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
      
      if (floorsWithRooms.length > 0 && !currentFloor) {
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

  const handleNewFloorUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const floorNumber = prompt('Введите номер этажа:');
    if (!floorNumber) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      
      try {
        setLoading(true);
        const cdnUrl = await hotelApi.uploadImage(base64Data, file.name);
        const newFloor = await hotelApi.createFloor(parseInt(floorNumber), cdnUrl);
        
        setFloors([...floors, { ...newFloor, rooms: [] }]);
        setCurrentFloor(newFloor.id);
        
        toast({
          title: "Этаж добавлен",
          description: `Этаж ${floorNumber} успешно создан`
        });
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось создать этаж",
          variant: "destructive"
        });
        console.error('Error creating floor:', error);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteFloor = async (floorId: number) => {
    if (!confirm('Удалить этаж и все связанные номера?')) return;

    try {
      setLoading(true);
      await hotelApi.deleteFloor(floorId);
      setFloors(floors.filter(f => f.id !== floorId));
      
      if (currentFloor === floorId) {
        setCurrentFloor(floors[0]?.id || null);
      }
      
      toast({
        title: "Этаж удалён",
        description: "Этаж успешно удалён"
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить этаж",
        variant: "destructive"
      });
      console.error('Error deleting floor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateFloor = async (floorId: number) => {
    const floor = floors.find(f => f.id === floorId);
    if (!floor) return;

    const newFloorNumber = prompt('Введите номер нового этажа:', String(floor.floor_number + 1));
    if (!newFloorNumber) return;

    try {
      setLoading(true);
      const newFloor = await hotelApi.duplicateFloor(floorId, parseInt(newFloorNumber));
      await loadFloors();
      setCurrentFloor(newFloor.id);
      
      toast({
        title: "Этаж скопирован",
        description: `Создан этаж ${newFloorNumber} с копией всех номеров`
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать этаж",
        variant: "destructive"
      });
      console.error('Error duplicating floor:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    floors,
    setFloors,
    currentFloor,
    setCurrentFloor,
    loading,
    setLoading,
    loadFloors,
    handleNewFloorUpload,
    handleDeleteFloor,
    handleDuplicateFloor
  };
};
