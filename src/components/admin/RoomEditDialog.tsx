import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
}

interface RoomEditDialogProps {
  room: Room | null;
  onClose: () => void;
  onSave: (roomId: string, updates: Partial<Room>) => void;
}

export default function RoomEditDialog({ room, onClose, onSave }: RoomEditDialogProps) {
  const [formData, setFormData] = useState<Partial<Room>>({});

  useEffect(() => {
    if (room) {
      setFormData({
        number: room.number,
        type: room.type,
        area: room.area,
        rooms: room.rooms,
        capacity: room.capacity,
        price: room.price,
        available: room.available,
        amenities: room.amenities
      });
    }
  }, [room]);

  const handleSave = () => {
    if (room) {
      onSave(room.id, formData);
      onClose();
    }
  };

  const updateAmenities = (amenitiesText: string) => {
    const amenitiesArray = amenitiesText.split(',').map(a => a.trim()).filter(a => a);
    setFormData({ ...formData, amenities: amenitiesArray });
  };

  return (
    <Dialog open={!!room} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {room && (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Редактирование номера {room.number}
              </DialogTitle>
            </DialogHeader>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room-number">Номер комнаты</Label>
                <Input
                  id="room-number"
                  value={formData.number || ''}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="101"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room-type">Тип номера</Label>
                <Select
                  value={formData.type || ''}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="room-type">
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Стандарт">Стандарт</SelectItem>
                    <SelectItem value="Комфорт">Комфорт</SelectItem>
                    <SelectItem value="Люкс">Люкс</SelectItem>
                    <SelectItem value="Стандарт с видом на море">Стандарт с видом на море</SelectItem>
                    <SelectItem value="Стандарт с видом на сад">Стандарт с видом на сад</SelectItem>
                    <SelectItem value="Комфорт (без окон)">Комфорт (без окон)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="room-area">Площадь (м²)</Label>
                <Input
                  id="room-area"
                  type="number"
                  value={formData.area || ''}
                  onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
                  placeholder="30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room-rooms">Количество комнат</Label>
                <Input
                  id="room-rooms"
                  type="number"
                  value={formData.rooms || ''}
                  onChange={(e) => setFormData({ ...formData, rooms: Number(e.target.value) })}
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room-capacity">Вместимость (гостей)</Label>
                <Input
                  id="room-capacity"
                  type="number"
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  placeholder="2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room-price">Цена (₽/сутки)</Label>
                <Input
                  id="room-price"
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="6000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="room-available">Статус доступности</Label>
              <Select
                value={formData.available ? 'true' : 'false'}
                onValueChange={(value) => setFormData({ ...formData, available: value === 'true' })}
              >
                <SelectTrigger id="room-available">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Доступен</SelectItem>
                  <SelectItem value="false">Занят</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="room-amenities">Удобства (через запятую)</Label>
              <Textarea
                id="room-amenities"
                value={formData.amenities?.join(', ') || ''}
                onChange={(e) => updateAmenities(e.target.value)}
                placeholder="Ванная комната, Wi-Fi, Кондиционер, Телевизор"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1" size="lg">
                <Icon name="Save" className="mr-2" />
                Сохранить изменения
              </Button>
              <Button onClick={onClose} variant="outline" size="lg">
                Отмена
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
