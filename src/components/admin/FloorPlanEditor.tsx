import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Room, Floor } from './floorplan/types';
import FloorPlanToolbar from './floorplan/FloorPlanToolbar';
import FloorPlanCanvas from './floorplan/FloorPlanCanvas';

interface FloorPlanEditorProps {
  floors: Floor[];
  currentFloor: string;
  onFloorsChange: (floors: Floor[]) => void;
  onCurrentFloorChange: (floorId: string) => void;
  onRoomEdit: (room: Room) => void;
  onRoomDelete: (roomId: string) => void;
  onFloorUpload: (file: File) => void;
  onFloorDelete: (floorId: string) => void;
  editingBoundsId: string | null;
  onBoundsEdit: (roomId: string) => void;
  onBoundsSave: (roomId: string, bounds: { position: { x: number; y: number; width: number; height: number }; polygon?: { x: number; y: number }[] }) => void;
  onBoundsCancel: () => void;
}

export default function FloorPlanEditor({
  floors,
  currentFloor,
  onFloorsChange,
  onCurrentFloorChange,
  onRoomEdit,
  onRoomDelete,
  onFloorUpload,
  onFloorDelete,
  editingBoundsId,
  onBoundsEdit,
  onBoundsSave,
  onBoundsCancel
}: FloorPlanEditorProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'rectangle' | 'polygon'>('rectangle');
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [polygonPoints, setPolygonPoints] = useState<{ x: number; y: number }[]>([]);
  const [imageRef, setImageRef] = useState<HTMLDivElement | null>(null);
  const [editPolygonPoints, setEditPolygonPoints] = useState<{ x: number; y: number }[]>([]);
  const [draggedPointIndex, setDraggedPointIndex] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFloorUpload(file);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef || !isDrawing) return;
    
    const rect = imageRef.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (drawMode === 'polygon') {
      setPolygonPoints([...polygonPoints, { x, y }]);
    } else {
      setDrawStart({ x, y });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drawMode === 'rectangle' && imageRef && isDrawing) {
      const rect = imageRef.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setDrawStart({ x, y });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef || !isDrawing || !drawStart || drawMode === 'polygon') return;
    
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
      amenities: ['Ванная комната', 'Wi-Fi', 'Кондиционер', 'Телевизор'],
      bedTypes: []
    };

    onFloorsChange(floors.map(f => 
      f.id === currentFloor 
        ? { ...f, rooms: [...f.rooms, newRoom] }
        : f
    ));

    setDrawStart(null);
  };

  const completePolygon = () => {
    if (polygonPoints.length < 3) {
      alert('Нужно минимум 3 точки для создания номера');
      return;
    }

    const roomNumber = prompt('Введите номер комнаты:');
    if (!roomNumber) {
      setPolygonPoints([]);
      return;
    }

    const xs = polygonPoints.map(p => p.x);
    const ys = polygonPoints.map(p => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

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
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      },
      polygon: polygonPoints,
      views: [],
      amenities: ['Ванная комната', 'Wi-Fi', 'Кондиционер', 'Телевизор'],
      bedTypes: []
    };

    onFloorsChange(floors.map(f => 
      f.id === currentFloor 
        ? { ...f, rooms: [...f.rooms, newRoom] }
        : f
    ));

    setPolygonPoints([]);
  };

  const cancelPolygon = () => {
    setPolygonPoints([]);
  };

  const startEditingBounds = (room: Room) => {
    if (room.polygon) {
      setEditPolygonPoints([...room.polygon]);
    }
    onBoundsEdit(room.id);
  };

  const saveEditedBounds = () => {
    if (!editingBoundsId) return;
    
    const room = currentFloorData?.rooms.find(r => r.id === editingBoundsId);
    if (!room) return;

    if (room.polygon && editPolygonPoints.length >= 3) {
      const xs = editPolygonPoints.map(p => p.x);
      const ys = editPolygonPoints.map(p => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);

      onBoundsSave(editingBoundsId, {
        position: {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY
        },
        polygon: editPolygonPoints
      });
    }
    
    setEditPolygonPoints([]);
  };

  const cancelEditingBounds = () => {
    setEditPolygonPoints([]);
    onBoundsCancel();
  };

  const handlePointDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggedPointIndex === null || !imageRef) return;

    const rect = imageRef.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPoints = [...editPolygonPoints];
    newPoints[draggedPointIndex] = { x, y };
    setEditPolygonPoints(newPoints);
  };

  const handleToggleDrawing = () => {
    setIsDrawing(!isDrawing);
    setPolygonPoints([]);
  };

  const currentFloorData = floors.find(f => f.id === currentFloor);
  const editingRoom = editingBoundsId ? currentFloorData?.rooms.find(r => r.id === editingBoundsId) : null;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <FloorPlanToolbar
          floors={floors}
          currentFloor={currentFloor}
          currentFloorData={currentFloorData}
          isDrawing={isDrawing}
          drawMode={drawMode}
          editingBoundsId={editingBoundsId}
          onFileChange={handleFileChange}
          onCurrentFloorChange={onCurrentFloorChange}
          onFloorDelete={onFloorDelete}
          onToggleDrawing={handleToggleDrawing}
          onDrawModeChange={setDrawMode}
        />

        {currentFloorData && (
          <FloorPlanCanvas
            currentFloorData={currentFloorData}
            isDrawing={isDrawing}
            drawMode={drawMode}
            polygonPoints={polygonPoints}
            editingBoundsId={editingBoundsId}
            editingRoom={editingRoom}
            editPolygonPoints={editPolygonPoints}
            imageRef={imageRef}
            onImageRefSet={setImageRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onClick={drawMode === 'polygon' ? handleClick : () => {}}
            onRoomEdit={onRoomEdit}
            onRoomDelete={onRoomDelete}
            onBoundsEdit={startEditingBounds}
            onCompletePolygon={completePolygon}
            onCancelPolygon={cancelPolygon}
            onSaveEditedBounds={saveEditedBounds}
            onCancelEditingBounds={cancelEditingBounds}
            onPointDrag={handlePointDrag}
            onPointMouseDown={setDraggedPointIndex}
            onPointMouseUp={() => setDraggedPointIndex(null)}
          />
        )}
      </div>
    </Card>
  );
}
