import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Floor, Room } from './types';
import RoomOverlay from './RoomOverlay';

interface FloorPlanCanvasProps {
  currentFloorData: Floor;
  isDrawing: boolean;
  drawMode: 'rectangle' | 'polygon';
  polygonPoints: { x: number; y: number }[];
  editingBoundsId: string | null;
  editingRoom: Room | null;
  editPolygonPoints: { x: number; y: number }[];
  imageRef: HTMLDivElement | null;
  onImageRefSet: (ref: HTMLDivElement | null) => void;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onRoomEdit: (room: Room) => void;
  onRoomDelete: (roomId: string) => void;
  onBoundsEdit: (room: Room) => void;
  onCompletePolygon: () => void;
  onCancelPolygon: () => void;
  onSaveEditedBounds: () => void;
  onCancelEditingBounds: () => void;
  onPointDrag: (e: React.MouseEvent<HTMLDivElement>) => void;
  onPointMouseDown: (index: number) => void;
  onPointMouseUp: () => void;
}

export default function FloorPlanCanvas({
  currentFloorData,
  isDrawing,
  drawMode,
  polygonPoints,
  editingBoundsId,
  editingRoom,
  editPolygonPoints,
  onImageRefSet,
  onMouseDown,
  onMouseUp,
  onClick,
  onRoomEdit,
  onRoomDelete,
  onBoundsEdit,
  onCompletePolygon,
  onCancelPolygon,
  onSaveEditedBounds,
  onCancelEditingBounds,
  onPointDrag,
  onPointMouseDown,
  onPointMouseUp
}: FloorPlanCanvasProps) {
  return (
    <div>
      {!editingBoundsId && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {isDrawing 
              ? drawMode === 'polygon'
                ? 'Кликайте на план для создания точек контура. Минимум 3 точки.'
                : 'Кликните и перетащите мышью для создания прямоугольной зоны номера'
              : 'Нажмите "Начать разметку" для добавления номеров'}
          </p>
          {isDrawing && drawMode === 'polygon' && polygonPoints.length > 0 && (
            <div className="flex gap-2">
              <Button onClick={onCompletePolygon} size="sm" variant="default">
                <Icon name="Check" size={16} className="mr-1" />
                Завершить ({polygonPoints.length} точек)
              </Button>
              <Button onClick={onCancelPolygon} size="sm" variant="outline">
                <Icon name="X" size={16} className="mr-1" />
                Отмена
              </Button>
            </div>
          )}
        </div>
      )}
      <div
        ref={onImageRefSet}
        className="relative w-full aspect-[3/2] bg-background rounded-xl overflow-hidden border-2 border-border"
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onClick={onClick}
      >
        <img
          src={currentFloorData.planImage}
          alt="План этажа"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />

        {currentFloorData.rooms.map(room => (
          <RoomOverlay
            key={room.id}
            room={room}
            onEdit={onRoomEdit}
            onBoundsEdit={onBoundsEdit}
            onDelete={onRoomDelete}
          />
        ))}

        {isDrawing && drawMode === 'polygon' && polygonPoints.length > 0 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polyline
              points={polygonPoints.map(p => `${p.x},${p.y}`).join(' ')}
              className="fill-none stroke-primary stroke-[0.5]"
            />
            {polygonPoints.map((point, i) => (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r="0.8"
                className="fill-primary"
              />
            ))}
          </svg>
        )}

        {editingBoundsId && editingRoom?.polygon && editPolygonPoints.length > 0 && (
          <>
            <div
              className="absolute inset-0"
              onMouseMove={onPointDrag}
              onMouseUp={onPointMouseUp}
            >
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <polygon
                  points={editPolygonPoints.map(p => `${p.x},${p.y}`).join(' ')}
                  className="fill-secondary/40 stroke-secondary stroke-[0.5]"
                />
                {editPolygonPoints.map((point, i) => (
                  <circle
                    key={i}
                    cx={point.x}
                    cy={point.y}
                    r="1.2"
                    className="fill-secondary stroke-white stroke-[0.3] cursor-move"
                    style={{ pointerEvents: 'auto' }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onPointMouseDown(i);
                    }}
                  />
                ))}
              </svg>
            </div>
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <Button onClick={onSaveEditedBounds} size="sm" variant="default">
                <Icon name="Check" size={16} className="mr-1" />
                Сохранить
              </Button>
              <Button onClick={onCancelEditingBounds} size="sm" variant="outline">
                <Icon name="X" size={16} className="mr-1" />
                Отмена
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
