import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Room {
  id: string;
  number: string;
  type: string;
  area: number;
  rooms: number;
  capacity: number;
  price: number;
  available: boolean;
  position: { x: number; y: number; width: number; height: number };
  views: string[];
  amenities: string[];
  bedTypes?: string[];
  polygon?: { x: number; y: number }[];
}

interface Floor {
  id: string;
  number: string;
  planImage: string;
  rooms: Room[];
}

interface RoomPhotoManagerProps {
  floors: Floor[];
  selectedRooms: string[];
  onSelectedRoomsChange: (roomIds: string[]) => void;
  onPhotosUpload: (files: FileList) => void;
}

export default function RoomPhotoManager({
  floors,
  selectedRooms,
  onSelectedRoomsChange,
  onPhotosUpload
}: RoomPhotoManagerProps) {
  const toggleRoomSelection = (roomId: string) => {
    onSelectedRoomsChange(
      selectedRooms.includes(roomId)
        ? selectedRooms.filter(id => id !== roomId)
        : [...selectedRooms, roomId]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && selectedRooms.length > 0) {
      onPhotosUpload(files);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Управление фотографиями</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Выберите номера и загрузите фотографии для них
            </p>
          </div>
          {selectedRooms.length > 0 && (
            <Badge variant="default" className="text-base px-4 py-2">
              {selectedRooms.length} номеров выбрано
            </Badge>
          )}
        </div>

        {selectedRooms.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="photo-upload">Загрузить фотографии</Label>
            <Input
              id="photo-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Можно выбрать несколько фотографий. Они будут добавлены ко всем выбранным номерам.
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {floors.flatMap(floor => 
            floor.rooms.map(room => (
              <Card
                key={room.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                  selectedRooms.includes(room.id) 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted/30'
                }`}
                onClick={() => toggleRoomSelection(room.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">Номер {room.number}</h4>
                    <p className="text-sm text-muted-foreground">Этаж {floor.number}</p>
                  </div>
                  <Badge variant={room.views.length > 0 ? 'default' : 'secondary'}>
                    {room.views.length} фото
                  </Badge>
                </div>

                {room.views.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {room.views.slice(0, 3).map((view, idx) => (
                      <img
                        key={idx}
                        src={view}
                        alt={`Вид ${idx + 1}`}
                        className="w-full aspect-square object-cover rounded"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted/30 aspect-video rounded flex items-center justify-center">
                    <Icon name="ImageOff" size={32} className="text-muted-foreground" />
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}