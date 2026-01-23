import { Button } from '@/components/ui/button';
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

interface RoomDrawingControlsProps {
  isDrawing: boolean;
  drawMode: 'polygon' | 'area';
  polygonPoints: Array<{x: number, y: number}>;
  editPolygonPoints: Array<{x: number, y: number}>;
  newRoom: Partial<Room>;
  loading: boolean;
  editingRoomBorders: number | null;
  areaStart?: {x: number, y: number} | null;
  areaEnd?: {x: number, y: number} | null;
  onToggleDrawing: () => void;
  onDrawModeChange: (mode: 'polygon' | 'area') => void;
  onFinishPolygon: () => void;
  onCancelPolygon: () => void;
  onNewRoomChange: (room: Partial<Room>) => void;
  onSaveBorders: () => void;
  onCancelEditBorders: () => void;
  onCancelArea?: () => void;
}

const RoomDrawingControls = ({
  isDrawing,
  drawMode,
  polygonPoints,
  editPolygonPoints,
  newRoom,
  loading,
  editingRoomBorders,
  areaStart = null,
  areaEnd = null,
  onToggleDrawing,
  onDrawModeChange,
  onFinishPolygon,
  onCancelPolygon,
  onNewRoomChange,
  onSaveBorders,
  onCancelEditBorders,
  onCancelArea
}: RoomDrawingControlsProps) => {
  return (
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
    </div>
  );
};

export default RoomDrawingControls;
