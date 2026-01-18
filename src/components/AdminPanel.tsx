import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import FloorPlanEditor from '@/components/admin/FloorPlanEditor';
import RoomPhotoManager from '@/components/admin/RoomPhotoManager';
import RoomEditDialog from '@/components/admin/RoomEditDialog';

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

const STORAGE_KEY = 'hotel-admin-floors';

export default function AdminPanel() {
  const { toast } = useToast();
  const [floors, setFloors] = useState<Floor[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [currentFloor, setCurrentFloor] = useState<string>('');
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(floors));
  }, [floors]);

  const handleFloorPlanUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const floorNumber = prompt('Введите номер этажа:');
      if (!floorNumber) return;

      const newFloor: Floor = {
        id: Date.now().toString(),
        number: floorNumber,
        planImage: event.target?.result as string,
        rooms: []
      };

      setFloors([...floors, newFloor]);
      setCurrentFloor(newFloor.id);
      
      toast({
        title: 'План этажа загружен',
        description: `Этаж ${floorNumber} добавлен. Теперь отметьте границы номеров.`,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFloorDelete = (floorId: string) => {
    const floor = floors.find(f => f.id === floorId);
    if (!floor) return;

    if (confirm(`Вы уверены, что хотите удалить план этажа ${floor.number}? Все номера на этом этаже также будут удалены.`)) {
      setFloors(floors.filter(f => f.id !== floorId));
      if (currentFloor === floorId) {
        setCurrentFloor(floors[0]?.id || '');
      }
      toast({
        title: 'План этажа удален',
        description: `Этаж ${floor.number} был удален`,
      });
    }
  };

  const handleRoomPhotosUpload = (files: FileList) => {
    const readers: Promise<string>[] = [];
    
    Array.from(files).forEach(file => {
      const promise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.readAsDataURL(file);
      });
      readers.push(promise);
    });

    Promise.all(readers).then(images => {
      setFloors(floors.map(f => ({
        ...f,
        rooms: f.rooms.map(r => 
          selectedRooms.includes(r.id)
            ? { ...r, views: [...r.views, ...images] }
            : r
        )
      })));

      toast({
        title: 'Фотографии добавлены',
        description: `Добавлено ${images.length} фото для ${selectedRooms.length} номеров`,
      });

      setSelectedRooms([]);
    });
  };

  const handleRoomDelete = (roomId: string) => {
    setFloors(floors.map(f => ({
      ...f,
      rooms: f.rooms.filter(r => r.id !== roomId)
    })));
    
    toast({
      title: 'Номер удален',
      description: 'Комната удалена с плана этажа',
    });
  };

  const handleRoomEdit = (room: Room) => {
    setEditingRoom(room);
  };

  const handleRoomSave = (roomId: string, updates: Partial<Room>) => {
    setFloors(floors.map(f => ({
      ...f,
      rooms: f.rooms.map(r => 
        r.id === roomId
          ? { ...r, ...updates }
          : r
      )
    })));

    toast({
      title: 'Изменения сохранены',
      description: `Номер ${updates.number} обновлен`,
    });
  };

  const saveConfiguration = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(floors));
    toast({
      title: 'Конфигурация сохранена',
      description: 'Все изменения успешно сохранены',
    });
  };

  const exportConfiguration = () => {
    const config = JSON.stringify(floors, null, 2);
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hotel-configuration.json';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Конфигурация экспортирована',
      description: 'Файл конфигурации сохранен',
    });
  };

  const importConfiguration = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        setFloors(imported);
        toast({
          title: 'Конфигурация импортирована',
          description: 'Данные успешно загружены',
        });
      } catch (error) {
        toast({
          title: 'Ошибка импорта',
          description: 'Неверный формат файла',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Административная панель
            </h1>
            <p className="text-muted-foreground mt-2">Управление планами этажей и номерами</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => window.location.href = '/'} variant="outline" size="lg">
              <Icon name="Home" className="mr-2" />
              Вернуться к сайту
            </Button>
            <Button onClick={saveConfiguration} variant="default" size="lg">
              <Icon name="Save" className="mr-2" />
              Сохранить
            </Button>
            <Button onClick={exportConfiguration} variant="outline" size="lg">
              <Icon name="Download" className="mr-2" />
              Экспорт
            </Button>
            <Button variant="outline" size="lg" asChild>
              <label className="cursor-pointer">
                <Icon name="Upload" className="mr-2" />
                Импорт
                <input
                  type="file"
                  accept=".json"
                  onChange={importConfiguration}
                  className="hidden"
                />
              </label>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="floors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="floors">
              <Icon name="Building2" className="mr-2" size={18} />
              Этажи
            </TabsTrigger>
            <TabsTrigger value="rooms">
              <Icon name="DoorOpen" className="mr-2" size={18} />
              Номера
            </TabsTrigger>
          </TabsList>

          <TabsContent value="floors" className="space-y-6">
            <FloorPlanEditor
              floors={floors}
              currentFloor={currentFloor}
              onFloorsChange={setFloors}
              onCurrentFloorChange={setCurrentFloor}
              onRoomEdit={handleRoomEdit}
              onRoomDelete={handleRoomDelete}
              onFloorUpload={handleFloorPlanUpload}
              onFloorDelete={handleFloorDelete}
            />
          </TabsContent>

          <TabsContent value="rooms" className="space-y-6">
            <RoomPhotoManager
              floors={floors}
              selectedRooms={selectedRooms}
              onSelectedRoomsChange={setSelectedRooms}
              onPhotosUpload={handleRoomPhotosUpload}
            />
          </TabsContent>
        </Tabs>

        <RoomEditDialog
          room={editingRoom}
          onClose={() => setEditingRoom(null)}
          onSave={handleRoomSave}
        />
      </div>
    </div>
  );
}