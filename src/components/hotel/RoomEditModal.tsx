import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Room {
  id: number;
  room_number: string;
  floor_id: number;
  position_x: number;
  position_y: number;
  category: string;
  price: number;
  status: string;
}

interface RoomEditModalProps {
  selectedRoom: Room | null;
  loading: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: (roomId: number) => void;
  onChange: (room: Room) => void;
}

const RoomEditModal = ({ 
  selectedRoom, 
  loading, 
  onClose, 
  onUpdate, 
  onDelete, 
  onChange 
}: RoomEditModalProps) => {
  if (!selectedRoom) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <Card className="p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4">Редактировать номер {selectedRoom.room_number}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Номер комнаты</label>
            <Input
              value={selectedRoom.room_number}
              onChange={(e) => onChange({ ...selectedRoom, room_number: e.target.value })}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Категория</label>
            <Input
              value={selectedRoom.category}
              onChange={(e) => onChange({ ...selectedRoom, category: e.target.value })}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Цена за ночь</label>
            <Input
              type="number"
              value={selectedRoom.price}
              onChange={(e) => onChange({ ...selectedRoom, price: Number(e.target.value) })}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Статус</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={selectedRoom.status}
              onChange={(e) => onChange({ ...selectedRoom, status: e.target.value })}
              disabled={loading}
            >
              <option value="available">Доступен</option>
              <option value="occupied">Занят</option>
              <option value="maintenance">Ремонт</option>
            </select>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={() => onDelete(selectedRoom.id)} disabled={loading}>
              Удалить
            </Button>
            <Button onClick={onUpdate} disabled={loading}>
              Сохранить
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RoomEditModal;
