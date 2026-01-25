import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import * as hotelApi from '@/lib/hotelApi';
import { useToast } from '@/hooks/use-toast';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  order: number;
}

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
  media?: MediaItem[];
}

interface RoomEditModalProps {
  selectedRoom: Room | null;
  loading: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: (roomId: number) => void;
  onChange: (room: Room) => void;
  onEditBorders?: (room: Room) => void;
}

const RoomEditModal = ({ 
  selectedRoom, 
  loading, 
  onClose, 
  onUpdate, 
  onDelete, 
  onChange,
  onEditBorders
}: RoomEditModalProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  if (!selectedRoom) return null;

  const media = selectedRoom.media || [];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newMediaItems: MediaItem[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        await new Promise<void>((resolve, reject) => {
          reader.onload = async (event) => {
            try {
              const base64Data = event.target?.result as string;
              const cdnUrl = await hotelApi.uploadImage(base64Data, file.name);
              
              const type = file.type.startsWith('video/') ? 'video' : 'image';
              const maxOrder = media.length > 0 ? Math.max(...media.map(m => m.order)) : 0;
              
              newMediaItems.push({
                type,
                url: cdnUrl,
                order: maxOrder + i + 1
              });
              
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
      
      onChange({ 
        ...selectedRoom, 
        media: [...media, ...newMediaItems]
      });
      
      toast({
        title: "Файлы загружены",
        description: `Добавлено файлов: ${newMediaItems.length}`
      });
    } catch (error) {
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить файлы",
        variant: "destructive"
      });
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = (index: number) => {
    const updatedMedia = media.filter((_, i) => i !== index);
    onChange({ ...selectedRoom, media: updatedMedia });
  };

  const handleMoveMedia = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === media.length - 1)
    ) return;

    const newMedia = [...media];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newMedia[index], newMedia[targetIndex]] = [newMedia[targetIndex], newMedia[index]];
    
    newMedia.forEach((item, i) => {
      item.order = i + 1;
    });
    
    onChange({ ...selectedRoom, media: newMedia });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <Card className="p-6 w-full max-w-2xl my-8" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4">Редактировать номер {selectedRoom.room_number}</h3>
        
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
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
            <select
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={selectedRoom.category}
              onChange={(e) => onChange({ ...selectedRoom, category: e.target.value })}
              disabled={loading}
            >
              <option value="Стандарт">Стандарт</option>
              <option value="Комфорт">Комфорт</option>
              <option value="Люкс">Люкс</option>
              <option value="Президентский">Президентский</option>
            </select>
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
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={selectedRoom.status}
              onChange={(e) => onChange({ ...selectedRoom, status: e.target.value })}
              disabled={loading}
            >
              <option value="available">Доступен</option>
              <option value="occupied">Занят</option>
              <option value="maintenance">Ремонт</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Фото и видео</label>
            <div className="space-y-2">
              <input
                type="file"
                id="media-upload"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading || loading}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById('media-upload')?.click()}
                disabled={uploading || loading}
              >
                <Icon name={uploading ? "Loader2" : "Upload"} size={16} className={`mr-2 ${uploading ? 'animate-spin' : ''}`} />
                {uploading ? 'Загрузка...' : 'Загрузить фото/видео'}
              </Button>

              {media.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {media.map((item, index) => (
                    <div key={index} className="relative border rounded-lg p-2 bg-muted">
                      {item.type === 'image' ? (
                        <img src={item.url} alt={`Media ${index + 1}`} className="w-full h-32 object-cover rounded" />
                      ) : (
                        <video src={item.url} className="w-full h-32 object-cover rounded" controls />
                      )}
                      <div className="flex gap-1 mt-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMoveMedia(index, 'up')}
                          disabled={index === 0}
                          className="flex-1"
                        >
                          <Icon name="ArrowUp" size={14} />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMoveMedia(index, 'down')}
                          disabled={index === media.length - 1}
                          className="flex-1"
                        >
                          <Icon name="ArrowDown" size={14} />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteMedia(index)}
                          className="flex-1"
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <Button 
              type="button"
              variant="outline" 
              className="w-full"
              onClick={() => {
                if (onEditBorders && selectedRoom) {
                  onEditBorders(selectedRoom);
                }
              }} 
              disabled={loading || !onEditBorders}
            >
              <Icon name="Edit" size={16} className="mr-2" />
              Редактировать границы
            </Button>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4 mt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading || uploading}>
            Отмена
          </Button>
          <Button variant="destructive" onClick={() => onDelete(selectedRoom.id)} disabled={loading || uploading}>
            Удалить
          </Button>
          <Button onClick={onUpdate} disabled={loading || uploading}>
            Сохранить
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default RoomEditModal;
