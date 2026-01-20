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

export const useRoomEditing = (
  floors: Floor[],
  setFloors: (floors: Floor[]) => void,
  setLoading: (loading: boolean) => void,
  toast: any
) => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [editingRoomBorders, setEditingRoomBorders] = useState<number | null>(null);
  const [editPolygonPoints, setEditPolygonPoints] = useState<Array<{x: number, y: number}>>([]);

  const handleRoomClick = (room: Room, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingRoomBorders) return;
    setSelectedRoom(room);
  };

  const handleStartEditBorders = (room: Room) => {
    setSelectedRoom(null);
    setEditingRoomBorders(room.id);
    if (room.polygon && room.polygon.length > 0) {
      setEditPolygonPoints([...room.polygon]);
    } else if (room.width && room.height) {
      setEditPolygonPoints([
        { x: room.position_x, y: room.position_y },
        { x: room.position_x + room.width, y: room.position_y },
        { x: room.position_x + room.width, y: room.position_y + room.height },
        { x: room.position_x, y: room.position_y + room.height }
      ]);
    }
  };

  const handleSaveBorders = async () => {
    if (!editingRoomBorders || editPolygonPoints.length < 3) return;

    const room = floors.flatMap(f => f.rooms).find(r => r.id === editingRoomBorders);
    if (!room) return;

    const centerX = editPolygonPoints.reduce((sum, p) => sum + p.x, 0) / editPolygonPoints.length;
    const centerY = editPolygonPoints.reduce((sum, p) => sum + p.y, 0) / editPolygonPoints.length;

    try {
      setLoading(true);
      const updatedRoomData = await hotelApi.updateRoom({
        id: room.id,
        room_number: room.room_number,
        category: room.category,
        price: room.price,
        position_x: centerX,
        position_y: centerY,
        polygon: editPolygonPoints,
        status: room.status
      });

      setFloors(floors.map(floor =>
        floor.id === room.floor_id
          ? {
              ...floor,
              rooms: floor.rooms.map(r =>
                r.id === room.id ? updatedRoomData : r
              )
            }
          : floor
      ));

      setEditingRoomBorders(null);
      setEditPolygonPoints([]);
      toast({
        title: "Границы обновлены",
        description: `Границы номера ${room.room_number} сохранены`
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить границы",
        variant: "destructive"
      });
      console.error('Error updating room borders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEditBorders = () => {
    setEditingRoomBorders(null);
    setEditPolygonPoints([]);
  };

  const handleEditPointDrag = (index: number, newX: number, newY: number) => {
    const updated = [...editPolygonPoints];
    updated[index] = { x: newX, y: newY };
    setEditPolygonPoints(updated);
  };

  const handleAddEditPoint = (afterIndex: number, x: number, y: number) => {
    const updated = [...editPolygonPoints];
    updated.splice(afterIndex + 1, 0, { x, y });
    setEditPolygonPoints(updated);
  };

  const handleDeleteEditPoint = (index: number) => {
    if (editPolygonPoints.length <= 3) return;
    const updated = editPolygonPoints.filter((_, i) => i !== index);
    setEditPolygonPoints(updated);
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
        width: selectedRoom.width,
        height: selectedRoom.height,
        polygon: selectedRoom.polygon,
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

  return {
    selectedRoom,
    setSelectedRoom,
    editingRoomBorders,
    editPolygonPoints,
    handleRoomClick,
    handleStartEditBorders,
    handleSaveBorders,
    handleCancelEditBorders,
    handleEditPointDrag,
    handleAddEditPoint,
    handleDeleteEditPoint,
    handleUpdateRoom,
    handleDeleteRoom
  };
};
