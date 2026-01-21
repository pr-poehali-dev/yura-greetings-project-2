import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import DraggablePoint from './DraggablePoint';

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
  onCanvasClick: (e: React.MouseEvent<HTMLDivElement>) => void;
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
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void;
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
  const [hoveredRoomId, setHoveredRoomId] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const currentFloorData = floors.find(f => f.id === currentFloor);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
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

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Управление этажами</h2>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <Button disabled={loading} asChild>
              <span>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить этаж
              </span>
            </Button>
            <input
              type="file"
              accept="image/*"
              onChange={onNewFloorUpload}
              disabled={loading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {floors.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {floors.map(floor => (
            <div key={floor.id} className="relative group">
              <Button
                variant={currentFloor === floor.id ? 'default' : 'outline'}
                onClick={() => onFloorChange(floor.id)}
              >
                {floor.floor_number} этаж
              </Button>
              <div className="absolute -top-2 -right-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 rounded-full bg-blue-500 text-white hover:bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateFloor(floor.id);
                  }}
                  title="Копировать этаж"
                >
                  <Icon name="Copy" size={12} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 rounded-full bg-destructive text-white hover:bg-destructive/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFloor(floor.id);
                  }}
                  title="Удалить этаж"
                >
                  <Icon name="X" size={12} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentFloorData?.plan_image_url && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Настройка новых номеров</h3>
            <Button
              variant={isDrawing ? 'destructive' : 'default'}
              onClick={onToggleDrawing}
              disabled={loading}
            >
              <Icon name={isDrawing ? 'X' : 'Plus'} size={16} className="mr-2" />
              {isDrawing ? 'Отменить' : 'Добавить номер'}
            </Button>
          </div>

          {editingRoomBorders && (
            <div className="space-y-4 mb-4 p-4 bg-blue-50 border-2 border-blue-500 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-blue-900">Редактирование границ</h4>
                  <p className="text-sm text-blue-700">Перемещайте точки, добавляйте новые или удаляйте лишние</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    onClick={onSaveBorders}
                    size="sm"
                    disabled={editPolygonPoints.length < 3}
                  >
                    <Icon name="Check" size={16} className="mr-2" />
                    Сохранить
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onCancelEditBorders}
                    size="sm"
                  >
                    <Icon name="X" size={16} className="mr-2" />
                    Отмена
                  </Button>
                </div>
              </div>
              <div className="text-sm text-blue-700">
                <div className="flex items-center gap-4">
                  <span>Точек: {editPolygonPoints.length}</span>
                  <span className="text-xs">💡 Клик между точками = добавить точку | Правый клик на точке = удалить</span>
                </div>
              </div>
            </div>
          )}

          {isDrawing && (
            <div className="space-y-4 mb-4 p-4 bg-muted rounded-lg">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={drawMode === 'polygon' ? 'default' : 'outline'}
                  onClick={() => onDrawModeChange('polygon')}
                  size="sm"
                >
                  <Icon name="Pentagon" size={16} className="mr-2" />
                  Кликать по углам
                </Button>
                <Button
                  variant={drawMode === 'area' ? 'default' : 'outline'}
                  onClick={() => onDrawModeChange('area')}
                  size="sm"
                >
                  <Icon name="Move" size={16} className="mr-2" />
                  Выделить область
                </Button>
              </div>
              
              {drawMode === 'area' && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm text-blue-900">
                    💡 <strong>Зажмите кнопку мыши</strong> в одной точке и ведите курсор — прямоугольная область будет расширяться
                  </p>
                  {areaStart && areaEnd && (
                    <div className="flex gap-2 items-center mt-2">
                      <span className="text-sm text-blue-900">
                        Размер: {Math.round(Math.abs(areaEnd.x - areaStart.x))} × {Math.round(Math.abs(areaEnd.y - areaStart.y))} px
                      </span>
                      <Button
                        variant="outline"
                        onClick={onCancelArea}
                        size="sm"
                      >
                        <Icon name="X" size={16} className="mr-2" />
                        Отменить
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {drawMode === 'polygon' && polygonPoints.length > 0 && (
                <div className="flex gap-2 items-center">
                  <span className="text-sm">Точек: {polygonPoints.length}</span>
                  <Button
                    variant="default"
                    onClick={onFinishPolygon}
                    size="sm"
                    disabled={polygonPoints.length < 3}
                  >
                    <Icon name="Check" size={16} className="mr-2" />
                    Завершить
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onCancelPolygon}
                    size="sm"
                  >
                    <Icon name="X" size={16} className="mr-2" />
                    Отмена
                  </Button>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-1">Категория</label>
                  <Input
                    value={newRoom.category}
                    onChange={(e) => onNewRoomChange({ ...newRoom, category: e.target.value })}
                    placeholder="Стандарт"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Цена за ночь</label>
                  <Input
                    type="number"
                    value={newRoom.price}
                    onChange={(e) => onNewRoomChange({ ...newRoom, price: Number(e.target.value) })}
                    placeholder="3500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Статус</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={newRoom.status}
                    onChange={(e) => onNewRoomChange({ ...newRoom, status: e.target.value })}
                  >
                    <option value="available">Доступен</option>
                    <option value="occupied">Занят</option>
                    <option value="maintenance">Ремонт</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div
            className="relative border-2 border-dashed rounded-lg overflow-hidden"
            style={{ 
              minHeight: '600px', 
              cursor: isDragging 
                ? 'grabbing'
                : isDrawing 
                  ? 'crosshair'
                  : editingRoomBorders ? 'move' : scale > 1 && drawMode !== 'area' ? 'grab' : drawMode === 'area' ? 'crosshair' : 'default' 
            }}
            onWheel={handleWheel}
          >
            <div
              style={{
                transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
                transformOrigin: 'top left',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
              onClick={editingRoomBorders ? undefined : (drawMode === 'area' ? undefined : onCanvasClick)}
              onMouseMove={(e) => {
                if (drawMode === 'area' && onMouseMove) {
                  onMouseMove(e);
                } else if (!drawMode || drawMode !== 'area') {
                  handleMouseMoveDrag(e);
                }
              }}
              onMouseDown={(e) => {
                if (drawMode === 'area' && onMouseDown) {
                  onMouseDown(e);
                } else if ((!drawMode || drawMode !== 'area') && !editingRoomBorders) {
                  handleMouseDownDrag(e);
                }
              }}
              onMouseUp={(e) => {
                if (drawMode === 'area' && onMouseUp) {
                  onMouseUp(e);
                } else if (!drawMode || drawMode !== 'area') {
                  handleMouseUpDrag(e);
                }
              }}
              onMouseLeave={() => handleMouseUpDrag()}
            >
              <img
                src={currentFloorData.plan_image_url}
                alt={`План ${currentFloorData.floor_number} этажа`}
                className="w-full h-auto pointer-events-none select-none"
                draggable="false"
              />
            
            {currentFloorData.rooms.map(room => {
              const color = room.status === 'available' ? '#22c55e' :
                           room.status === 'occupied' ? '#ef4444' : '#f59e0b';
              const isSelected = selectedRoomId === room.id;
              
              if (room.polygon && room.polygon.length > 0) {
                return null;
              }
              
              const isHovered = hoveredRoomId === room.id;
              
              return (
                <div
                  key={room.id}
                  className="absolute rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-all"
                  style={{
                    left: `${room.position_x}px`,
                    top: `${room.position_y}px`,
                    width: `${room.width || 60}px`,
                    height: `${room.height || 40}px`,
                    backgroundColor: color,
                    color: 'white',
                    opacity: isSelected ? 1 : isHovered ? 0.95 : 0.8,
                    border: isSelected ? '3px solid white' : isHovered ? '2px solid white' : 'none',
                    boxShadow: isSelected 
                      ? '0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.4)' 
                      : isHovered ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    zIndex: isSelected ? 10 : isHovered ? 5 : 1
                  }}
                  onClick={(e) => onRoomClick(room, e)}
                  onMouseEnter={() => setHoveredRoomId(room.id)}
                  onMouseLeave={() => setHoveredRoomId(null)}
                  title={`${room.room_number} - ${room.category}`}
                >
                  {room.room_number}
                </div>
              );
            })}
            
            <svg className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: editingRoomBorders ? 'all' : 'none' }}>
              {currentFloorData.rooms.map(room => {
                const color = room.status === 'available' ? '#22c55e' :
                             room.status === 'occupied' ? '#ef4444' : '#f59e0b';
                const isSelected = selectedRoomId === room.id;
                const isHovered = hoveredRoomId === room.id;
                
                if (room.polygon && room.polygon.length > 0) {
                  const points = room.polygon.map(p => `${p.x},${p.y}`).join(' ');
                  const centerX = room.polygon.reduce((sum, p) => sum + p.x, 0) / room.polygon.length;
                  const centerY = room.polygon.reduce((sum, p) => sum + p.y, 0) / room.polygon.length;
                  
                  return (
                    <g 
                      key={room.id} 
                      style={{ pointerEvents: isDrawing ? 'none' : 'all', cursor: isDrawing ? 'default' : 'pointer' }} 
                      onClick={(e) => onRoomClick(room, e as any)}
                      onMouseEnter={() => !isDrawing && setHoveredRoomId(room.id)}
                      onMouseLeave={() => setHoveredRoomId(null)}
                    >
                      <polygon
                        points={points}
                        fill={color}
                        fillOpacity={isSelected ? "0.7" : isHovered ? "0.55" : "0.4"}
                        stroke={color}
                        strokeWidth="2"
                        className="transition-all"
                      />
                      {isSelected && (
                        <>
                          <polygon
                            points={points}
                            fill="none"
                            stroke="white"
                            strokeWidth="5"
                            strokeDasharray="10,5"
                            style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.9))' }}
                          />
                          <polygon
                            points={points}
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            opacity="0.6"
                          />
                        </>
                      )}
                      {isHovered && !isSelected && (
                        <polygon
                          points={points}
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          opacity="0.7"
                          style={{ filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.5))' }}
                        />
                      )}
                      <text
                        x={centerX}
                        y={centerY}
                        fill="white"
                        fontSize={isSelected ? "15" : isHovered ? "13" : "12"}
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ 
                          pointerEvents: 'none', 
                          userSelect: 'none', 
                          filter: isSelected ? 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.9))' : isHovered ? 'drop-shadow(0 0 3px rgba(0, 0, 0, 0.7))' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {room.room_number}
                      </text>
                    </g>
                  );
                }
                
                return null;
              })}
              
              {drawMode === 'polygon' && polygonPoints.length > 0 && (
                <>
                  <polyline
                    points={polygonPoints.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  {polygonPoints.map((point, i) => (
                    <circle
                      key={i}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill="#3b82f6"
                    />
                  ))}
                </>
              )}
              
              {drawMode === 'area' && areaStart && areaEnd && (
                <rect
                  x={Math.min(areaStart.x, areaEnd.x)}
                  y={Math.min(areaStart.y, areaEnd.y)}
                  width={Math.abs(areaEnd.x - areaStart.x)}
                  height={Math.abs(areaEnd.y - areaStart.y)}
                  fill="rgba(59, 130, 246, 0.2)"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' }}
                />
              )}
              
              {editingRoomBorders && editPolygonPoints.length > 0 && (
                <>
                  <polygon
                    points={editPolygonPoints.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="#3b82f6"
                    fillOpacity="0.2"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray="8,4"
                  />
                  
                  {editPolygonPoints.map((point, i) => {
                    const nextPoint = editPolygonPoints[(i + 1) % editPolygonPoints.length];
                    const midX = (point.x + nextPoint.x) / 2;
                    const midY = (point.y + nextPoint.y) / 2;
                    
                    return (
                      <g key={`edge-${i}`}>
                        <line
                          x1={point.x}
                          y1={point.y}
                          x2={nextPoint.x}
                          y2={nextPoint.y}
                          stroke="#3b82f6"
                          strokeWidth="2"
                        />
                        <circle
                          cx={midX}
                          cy={midY}
                          r="6"
                          fill="#10b981"
                          stroke="white"
                          strokeWidth="2"
                          style={{ cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = (e.target as SVGElement).ownerSVGElement?.getBoundingClientRect();
                            if (rect) {
                              onAddEditPoint(i, midX, midY);
                            }
                          }}
                        />
                      </g>
                    );
                  })}
                  
                  {editPolygonPoints.map((point, i) => (
                    <DraggablePoint
                      key={`point-${i}`}
                      x={point.x}
                      y={point.y}
                      index={i}
                      onDrag={onEditPointDrag}
                      onDelete={onDeleteEditPoint}
                    />
                  ))}
                </>
              )}
            </svg>
            </div>
          </div>

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