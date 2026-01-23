import { useState } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import FloorToolbar from './FloorToolbar';
import RoomDrawingControls from './RoomDrawingControls';
import FloorCanvas from './FloorCanvas';

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

interface FloorPlanEditorProps {
  floors: Floor[];
  currentFloor: number | null;
  isDrawing: boolean;
  drawMode: 'polygon' | 'area';
  polygonPoints: Array<{x: number, y: number}>;
  loading: boolean;
  newRoom: Partial<Room>;
  editingRoomBorders: number | null;
  editPolygonPoints: Array<{x: number, y: number}>;
  selectedRoomId?: number | null;
  areaStart?: {x: number, y: number} | null;
  areaEnd?: {x: number, y: number} | null;
  isDrawingArea?: boolean;
  onFloorChange: (floorId: number) => void;
  onNewFloorUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteFloor: (floorId: number) => void;
  onDuplicateFloor: (floorId: number) => void;
  onToggleDrawing: () => void;
  onDrawModeChange: (mode: 'polygon' | 'area') => void;
  onCanvasClick: (x: number, y: number) => void;
  onFinishPolygon: () => void;
  onCancelPolygon: () => void;
  onRoomClick: (room: Room, e: React.MouseEvent) => void;
  onNewRoomChange: (room: Partial<Room>) => void;
  onStartEditBorders: (room: Room) => void;
  onSaveBorders: () => void;
  onCancelEditBorders: () => void;
  onEditPointDrag: (index: number, newX: number, newY: number) => void;
  onAddEditPoint: (afterIndex: number, x: number, y: number) => void;
  onDeleteEditPoint: (index: number) => void;
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>, scale?: number, translateX?: number, translateY?: number) => void;
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>, scale?: number, translateX?: number, translateY?: number) => void;
  onMouseUp?: () => void;
  onCancelArea?: () => void;
}

const FloorPlanEditor = ({
  floors,
  currentFloor,
  isDrawing,
  drawMode,
  polygonPoints,
  loading,
  newRoom,
  editingRoomBorders,
  editPolygonPoints,
  selectedRoomId,
  areaStart = null,
  areaEnd = null,
  isDrawingArea = false,
  onFloorChange,
  onNewFloorUpload,
  onDeleteFloor,
  onDuplicateFloor,
  onToggleDrawing,
  onDrawModeChange,
  onCanvasClick,
  onFinishPolygon,
  onCancelPolygon,
  onRoomClick,
  onNewRoomChange,
  onStartEditBorders,
  onSaveBorders,
  onCancelEditBorders,
  onEditPointDrag,
  onAddEditPoint,
  onDeleteEditPoint,
  onMouseMove,
  onMouseDown,
  onMouseUp,
  onCancelArea
}: FloorPlanEditorProps) => {
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const currentFloorData = floors.find(f => f.id === currentFloor);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (editingRoomBorders) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleMouseDownDrag = (e: React.MouseEvent) => {
    if (drawMode === 'area' || editingRoomBorders) return;
    if (scale === 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - translateX, y: e.clientY - translateY });
    e.stopPropagation();
  };

  const handleMouseMoveDrag = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTranslateX(e.clientX - dragStart.x);
    setTranslateY(e.clientY - dragStart.y);
    e.stopPropagation();
  };

  const handleMouseUpDrag = (e?: React.MouseEvent) => {
    if (isDragging && e) {
      e.stopPropagation();
    }
    setIsDragging(false);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
  };

  return (
    <Card className="p-6">
      <FloorToolbar
        floors={floors}
        currentFloor={currentFloor}
        loading={loading}
        onFloorChange={onFloorChange}
        onNewFloorUpload={onNewFloorUpload}
        onDeleteFloor={onDeleteFloor}
        onDuplicateFloor={onDuplicateFloor}
      />

      {currentFloorData?.plan_image_url && (
        <div className="mb-6">
          <RoomDrawingControls
            isDrawing={isDrawing}
            drawMode={drawMode}
            polygonPoints={polygonPoints}
            editPolygonPoints={editPolygonPoints}
            newRoom={newRoom}
            loading={loading}
            editingRoomBorders={editingRoomBorders}
            areaStart={areaStart}
            areaEnd={areaEnd}
            onToggleDrawing={onToggleDrawing}
            onDrawModeChange={onDrawModeChange}
            onFinishPolygon={onFinishPolygon}
            onCancelPolygon={onCancelPolygon}
            onNewRoomChange={onNewRoomChange}
            onSaveBorders={onSaveBorders}
            onCancelEditBorders={onCancelEditBorders}
            onCancelArea={onCancelArea}
          />

          <div className="mb-2 p-2 bg-blue-100 dark:bg-blue-900 rounded text-xs">
            <strong>Отладка (Админ):</strong> Размеры изображения: {imageDimensions.width} × {imageDimensions.height}px | 
            Масштаб: {Math.round(scale * 100)}% | 
            Номеров: {currentFloorData.rooms.length}
          </div>

          <FloorCanvas
            currentFloorData={currentFloorData}
            isDrawing={isDrawing}
            drawMode={drawMode}
            polygonPoints={polygonPoints}
            editingRoomBorders={editingRoomBorders}
            editPolygonPoints={editPolygonPoints}
            selectedRoomId={selectedRoomId}
            areaStart={areaStart}
            areaEnd={areaEnd}
            scale={scale}
            translateX={translateX}
            translateY={translateY}
            isDragging={isDragging}
            imageDimensions={imageDimensions}
            onCanvasClick={onCanvasClick}
            onRoomClick={onRoomClick}
            onEditPointDrag={onEditPointDrag}
            onAddEditPoint={onAddEditPoint}
            onDeleteEditPoint={onDeleteEditPoint}
            onMouseMove={onMouseMove}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onWheel={handleWheel}
            onMouseDownDrag={handleMouseDownDrag}
            onMouseMoveDrag={handleMouseMoveDrag}
            onMouseUpDrag={handleMouseUpDrag}
            onImageLoad={handleImageLoad}
          />

          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>Доступен</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span>Занят</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-500"></div>
              <span>Ремонт</span>
            </div>
          </div>
        </div>
      )}

      {!currentFloorData?.plan_image_url && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Icon name="Upload" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Загрузите схему этажа для начала работы</p>
        </div>
      )}
    </Card>
  );
};

export default FloorPlanEditor;