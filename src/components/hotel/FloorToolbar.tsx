import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Floor {
  id: number;
  floor_number: number;
  plan_image_url: string | null;
  rooms: any[];
}

interface FloorToolbarProps {
  floors: Floor[];
  currentFloor: number | null;
  loading: boolean;
  onFloorChange: (floorId: number) => void;
  onNewFloorUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteFloor: (floorId: number) => void;
  onDuplicateFloor: (floorId: number) => void;
}

const FloorToolbar = ({
  floors,
  currentFloor,
  loading,
  onFloorChange,
  onNewFloorUpload,
  onDeleteFloor,
  onDuplicateFloor
}: FloorToolbarProps) => {
  return (
    <>
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
    </>
  );
};

export default FloorToolbar;
