import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

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
  drawMode: 'rectangle' | 'polygon';
  polygonPoints: Array<{x: number, y: number}>;
  loading: boolean;
  newRoom: Partial<Room>;
  onFloorChange: (floorId: number) => void;
  onNewFloorUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteFloor: (floorId: number) => void;
  onDuplicateFloor: (floorId: number) => void;
  onToggleDrawing: () => void;
  onDrawModeChange: (mode: 'rectangle' | 'polygon') => void;
  onCanvasClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onFinishPolygon: () => void;
  onCancelPolygon: () => void;
  onRoomClick: (room: Room, e: React.MouseEvent) => void;
  onNewRoomChange: (room: Partial<Room>) => void;
}

const FloorPlanEditor = ({
  floors,
  currentFloor,
  isDrawing,
  drawMode,
  polygonPoints,
  loading,
  newRoom,
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
  onNewRoomChange
}: FloorPlanEditorProps) => {
  const currentFloorData = floors.find(f => f.id === currentFloor);

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

          {isDrawing && (
            <div className="space-y-4 mb-4 p-4 bg-muted rounded-lg">
              <div className="flex gap-2">
                <Button
                  variant={drawMode === 'rectangle' ? 'default' : 'outline'}
                  onClick={() => onDrawModeChange('rectangle')}
                  size="sm"
                >
                  <Icon name="Square" size={16} className="mr-2" />
                  Прямоугольник
                </Button>
                <Button
                  variant={drawMode === 'polygon' ? 'default' : 'outline'}
                  onClick={() => onDrawModeChange('polygon')}
                  size="sm"
                >
                  <Icon name="Pentagon" size={16} className="mr-2" />
                  Произвольная форма
                </Button>
              </div>
              
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
            style={{ minHeight: '600px', cursor: isDrawing ? 'crosshair' : 'default' }}
            onClick={onCanvasClick}
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
              
              if (room.polygon && room.polygon.length > 0) {
                return null;
              }
              
              return (
                <div
                  key={room.id}
                  className="absolute rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-transform hover:scale-105"
                  style={{
                    left: `${room.position_x}px`,
                    top: `${room.position_y}px`,
                    width: `${room.width || 60}px`,
                    height: `${room.height || 40}px`,
                    backgroundColor: color,
                    color: 'white',
                    opacity: 0.8
                  }}
                  onClick={(e) => onRoomClick(room, e)}
                  title={`${room.room_number} - ${room.category}`}
                >
                  {room.room_number}
                </div>
              );
            })}
            
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {currentFloorData.rooms.map(room => {
                const color = room.status === 'available' ? '#22c55e' :
                             room.status === 'occupied' ? '#ef4444' : '#f59e0b';
                
                if (room.polygon && room.polygon.length > 0) {
                  const points = room.polygon.map(p => `${p.x},${p.y}`).join(' ');
                  const centerX = room.polygon.reduce((sum, p) => sum + p.x, 0) / room.polygon.length;
                  const centerY = room.polygon.reduce((sum, p) => sum + p.y, 0) / room.polygon.length;
                  
                  return (
                    <g key={room.id} style={{ pointerEvents: 'all', cursor: 'pointer' }} onClick={(e) => onRoomClick(room, e as any)}>
                      <polygon
                        points={points}
                        fill={color}
                        fillOpacity="0.4"
                        stroke={color}
                        strokeWidth="2"
                        className="transition-opacity hover:opacity-75"
                      />
                      <text
                        x={centerX}
                        y={centerY}
                        fill="white"
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
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
            </svg>
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