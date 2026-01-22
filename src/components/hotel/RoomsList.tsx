import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Room {
  id: number;
  room_number: string;
  floor_id: number;
  category: string;
  price: number;
  status: string;
}

interface Floor {
  id: number;
  floor_number: number;
  rooms: Room[];
}

interface RoomsListProps {
  floors: Floor[];
  loading: boolean;
  onDeleteRoom: (roomId: number) => Promise<void>;
  onEditRoom: (room: Room) => void;
}

const RoomsList = ({ floors, loading, onDeleteRoom, onEditRoom }: RoomsListProps) => {
  const allRooms = floors.flatMap(floor => 
    floor.rooms.map(room => ({
      ...room,
      floor_number: floor.floor_number
    }))
  ).sort((a, b) => {
    if (a.floor_number !== b.floor_number) {
      return a.floor_number - b.floor_number;
    }
    return a.room_number.localeCompare(b.room_number);
  });

  const handleDelete = async (roomId: number, roomNumber: string) => {
    if (confirm(`Удалить номер ${roomNumber}?`)) {
      await onDeleteRoom(roomId);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Все номера</h2>
          <p className="text-sm text-muted-foreground">Полный список номеров по всем этажам</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
      ) : allRooms.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Нет номеров</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Этаж</th>
                <th className="text-left py-3 px-4">Номер</th>
                <th className="text-left py-3 px-4">Категория</th>
                <th className="text-right py-3 px-4">Цена</th>
                <th className="text-center py-3 px-4">Статус</th>
                <th className="text-right py-3 px-4">Действия</th>
              </tr>
            </thead>
            <tbody>
              {allRooms.map((room) => (
                <tr key={room.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">{room.floor_number} этаж</td>
                  <td className="py-3 px-4 font-semibold">{room.room_number}</td>
                  <td className="py-3 px-4">{room.category}</td>
                  <td className="py-3 px-4 text-right">{room.price} ₽</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      room.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : room.status === 'occupied'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {room.status === 'available' ? 'Свободен' : 
                       room.status === 'occupied' ? 'Занят' : 'Обслуживание'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditRoom(room)}
                      >
                        <Icon name="Edit" size={14} className="mr-1" />
                        Изменить
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(room.id, room.room_number)}
                      >
                        <Icon name="Trash2" size={14} className="mr-1" />
                        Удалить
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default RoomsList;
