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
  const [drawMode, setDrawMode] = useState<'rectangle' | 'polygon' | 'trace'>('rectangle');
  const [polygonPoints, setPolygonPoints] = useState<Array<{x: number, y: number}>>([]);
  const [isTracing, setIsTracing] = useState(false);
  const [tracePoints, setTracePoints] = useState<Array<{x: number, y: number}>>([]);
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

    if (drawMode === 'trace') {
      setTracePoints([...tracePoints, { x, y }]);
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || drawMode !== 'trace' || !isTracing) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (tracePoints.length > 0) {
      const lastPoint = tracePoints[tracePoints.length - 1];
      const distance = Math.sqrt(Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2));
      
      if (distance > 3) {
        setTracePoints([...tracePoints, { x, y }]);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || drawMode !== 'trace') return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsTracing(true);
    setTracePoints([{ x, y }]);
  };

  const handleMouseUp = () => {
    if (!isDrawing || drawMode !== 'trace') return;
    setIsTracing(false);
  };

  const simplifyPath = (points: Array<{x: number, y: number}>, tolerance: number = 5): Array<{x: number, y: number}> => {
    if (points.length < 3) return points;
    
    const simplified: Array<{x: number, y: number}> = [points[0]];
    
    for (let i = 1; i < points.length - 1; i++) {
      const prev = simplified[simplified.length - 1];
      const current = points[i];
      const distance = Math.sqrt(Math.pow(current.x - prev.x, 2) + Math.pow(current.y - prev.y, 2));
      
      if (distance > tolerance) {
        simplified.push(current);
      }
    }
    
    simplified.push(points[points.length - 1]);
    return simplified;
  };

  const handleFinishTrace = async () => {
    if (tracePoints.length < 10 || !currentFloor) return;

    const roomNumber = prompt('Номер комнаты:');
    if (!roomNumber) return;

    const simplified = simplifyPath(tracePoints, 8);
    const centerX = simplified.reduce((sum, p) => sum + p.x, 0) / simplified.length;
    const centerY = simplified.reduce((sum, p) => sum + p.y, 0) / simplified.length;

    try {
      setLoading(true);
      const newRoomData = await hotelApi.createRoom({
        floor_id: currentFloor,
        room_number: roomNumber,
        category: newRoom.category || 'Стандарт',
        price: newRoom.price || 3500,
        position_x: centerX,
        position_y: centerY,
        polygon: simplified,
        status: newRoom.status || 'available'
      });

      setFloors(floors.map(floor =>
        floor.id === currentFloor
          ? { ...floor, rooms: [...floor.rooms, newRoomData] }
          : floor
      ));

      setTracePoints([]);
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

  const handleCancelTrace = () => {
    setTracePoints([]);
    setIsTracing(false);
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
    tracePoints,
    isTracing,
    handleCanvasClick,
    handleFinishPolygon,
    handleCancelPolygon,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    handleFinishTrace,
    handleCancelTrace
  };
};