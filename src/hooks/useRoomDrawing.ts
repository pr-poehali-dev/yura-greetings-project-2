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

export const useRoomDrawing = (
  floors: Floor[],
  setFloors: (floors: Floor[]) => void,
  currentFloor: number | null,
  setLoading: (loading: boolean) => void,
  toast: any
) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'rectangle' | 'polygon'>('rectangle');
  const [polygonPoints, setPolygonPoints] = useState<Array<{x: number, y: number}>>([]);
  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    category: 'Стандарт',
    price: 3500,
    status: 'available'
  });

  const handleCanvasClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !currentFloor) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawMode === 'polygon') {
      setPolygonPoints([...polygonPoints, { x, y }]);
      return;
    }

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
        width: 60,
        height: 40,
        status: newRoom.status || 'available'
      });

      setFloors(floors.map(floor =>
        floor.id === currentFloor
          ? { ...floor, rooms: [...floor.rooms, newRoomData] }
          : floor
      ));

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

  const handleFinishPolygon = async () => {
    if (polygonPoints.length < 3 || !currentFloor) return;

    const roomNumber = prompt('Номер комнаты:');
    if (!roomNumber) return;

    const centerX = polygonPoints.reduce((sum, p) => sum + p.x, 0) / polygonPoints.length;
    const centerY = polygonPoints.reduce((sum, p) => sum + p.y, 0) / polygonPoints.length;

    try {
      setLoading(true);
      const newRoomData = await hotelApi.createRoom({
        floor_id: currentFloor,
        room_number: roomNumber,
        category: newRoom.category || 'Стандарт',
        price: newRoom.price || 3500,
        position_x: centerX,
        position_y: centerY,
        polygon: polygonPoints,
        status: newRoom.status || 'available'
      });

      setFloors(floors.map(floor =>
        floor.id === currentFloor
          ? { ...floor, rooms: [...floor.rooms, newRoomData] }
          : floor
      ));

      setPolygonPoints([]);
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

  const handleCancelPolygon = () => {
    setPolygonPoints([]);
  };

  return {
    isDrawing,
    setIsDrawing,
    drawMode,
    setDrawMode,
    polygonPoints,
    setPolygonPoints,
    newRoom,
    setNewRoom,
    handleCanvasClick,
    handleFinishPolygon,
    handleCancelPolygon
  };
};
