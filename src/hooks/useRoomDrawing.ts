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
  const [drawMode, setDrawMode] = useState<'polygon' | 'area'>('polygon');
  const [polygonPoints, setPolygonPoints] = useState<Array<{x: number, y: number}>>([]);
  const [areaStart, setAreaStart] = useState<{x: number, y: number} | null>(null);
  const [areaEnd, setAreaEnd] = useState<{x: number, y: number} | null>(null);
  const [isDrawingArea, setIsDrawingArea] = useState(false);
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawMode === 'area' && isDrawingArea && areaStart) {
      setAreaEnd({ x, y });
      return;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawMode === 'area') {
      setIsDrawingArea(true);
      setAreaStart({ x, y });
      setAreaEnd({ x, y });
      return;
    }
  };

  const handleMouseUp = async () => {
    if (!isDrawing) return;

    if (drawMode === 'area' && isDrawingArea && areaStart && areaEnd) {
      setIsDrawingArea(false);
      await handleFinishArea();
      return;
    }
  };



  const handleFinishArea = async () => {
    if (!areaStart || !areaEnd || !currentFloor) return;

    const roomNumber = prompt('Номер комнаты:');
    if (!roomNumber) {
      setAreaStart(null);
      setAreaEnd(null);
      return;
    }

    const x1 = Math.min(areaStart.x, areaEnd.x);
    const y1 = Math.min(areaStart.y, areaEnd.y);
    const x2 = Math.max(areaStart.x, areaEnd.x);
    const y2 = Math.max(areaStart.y, areaEnd.y);
    const width = x2 - x1;
    const height = y2 - y1;

    if (width < 10 || height < 10) {
      toast({
        title: "Область слишком мала",
        description: "Выделите область побольше",
        variant: "destructive"
      });
      setAreaStart(null);
      setAreaEnd(null);
      return;
    }

    try {
      setLoading(true);
      const newRoomData = await hotelApi.createRoom({
        floor_id: currentFloor,
        room_number: roomNumber,
        category: newRoom.category || 'Стандарт',
        price: newRoom.price || 3500,
        position_x: x1,
        position_y: y1,
        width: width,
        height: height,
        status: newRoom.status || 'available'
      });

      setFloors(floors.map(floor =>
        floor.id === currentFloor
          ? { ...floor, rooms: [...floor.rooms, newRoomData] }
          : floor
      ));

      setAreaStart(null);
      setAreaEnd(null);
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

  const handleCancelArea = () => {
    setAreaStart(null);
    setAreaEnd(null);
    setIsDrawingArea(false);
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
    areaStart,
    areaEnd,
    isDrawingArea,
    handleCanvasClick,
    handleFinishPolygon,
    handleCancelPolygon,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    handleCancelArea
  };
};