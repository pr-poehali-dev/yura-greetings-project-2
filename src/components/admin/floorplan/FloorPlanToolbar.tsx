import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { Floor } from './types';

interface FloorPlanToolbarProps {
  floors: Floor[];
  currentFloor: string;
  currentFloorData: Floor | undefined;
  isDrawing: boolean;
  drawMode: 'rectangle' | 'polygon';
  editingBoundsId: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCurrentFloorChange: (floorId: string) => void;
  onFloorDelete: (floorId: string) => void;
  onToggleDrawing: () => void;
  onDrawModeChange: (mode: 'rectangle' | 'polygon') => void;
}

export default function FloorPlanToolbar({
  floors,
  currentFloor,
  currentFloorData,
  isDrawing,
  drawMode,
  editingBoundsId,
  onFileChange,
  onCurrentFloorChange,
  onFloorDelete,
  onToggleDrawing,
  onDrawModeChange
}: FloorPlanToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="floor-upload">Загрузить план этажа</Label>
        <Input
          id="floor-upload"
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="cursor-pointer"
        />
      </div>

      {floors.length > 0 && (
        <>
          <div className="flex-1 space-y-2">
            <Label htmlFor="floor-select">Выбрать этаж</Label>
            <Select value={currentFloor} onValueChange={onCurrentFloorChange}>
              <SelectTrigger id="floor-select">
                <SelectValue placeholder="Выберите этаж" />
              </SelectTrigger>
              <SelectContent>
                {floors.map(floor => (
                  <SelectItem key={floor.id} value={floor.id}>
                    Этаж {floor.number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {currentFloorData && (
            <Button
              onClick={() => onFloorDelete(currentFloor)}
              variant="destructive"
              size="lg"
            >
              <Icon name="Trash2" className="mr-2" />
              Удалить этаж
            </Button>
          )}
        </>
      )}

      {currentFloorData && !editingBoundsId && (
        <div className="flex gap-2">
          <Button
            onClick={onToggleDrawing}
            variant={isDrawing ? 'default' : 'outline'}
            size="lg"
          >
            <Icon name={isDrawing ? 'Check' : 'PenTool'} className="mr-2" />
            {isDrawing ? 'Завершить разметку' : 'Начать разметку'}
          </Button>
          {isDrawing && (
            <Select value={drawMode} onValueChange={(v) => onDrawModeChange(v as 'rectangle' | 'polygon')}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rectangle">
                  <div className="flex items-center gap-2">
                    <Icon name="Square" size={16} />
                    Прямоугольник
                  </div>
                </SelectItem>
                <SelectItem value="polygon">
                  <div className="flex items-center gap-2">
                    <Icon name="Pentagon" size={16} />
                    Произвольная форма
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      )}
      
      {editingBoundsId && (
        <div className="bg-secondary/20 px-4 py-2 rounded-lg border border-secondary">
          <p className="text-sm font-medium">
            <Icon name="Move" className="inline mr-2" size={16} />
            Редактирование границ: перетаскивайте точки для изменения формы
          </p>
        </div>
      )}
    </div>
  );
}
