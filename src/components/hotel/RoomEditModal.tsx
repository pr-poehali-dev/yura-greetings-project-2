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
  const [viewingMedia, setViewingMedia] = useState<number | null>(null);
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
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {media.map((item, index) => (
                    <div key={index} className="relative group border rounded-lg overflow-hidden bg-muted/50 hover:bg-muted transition-colors">
                      <div 
                        className="relative aspect-square cursor-pointer"
                        onClick={() => setViewingMedia(index)}
                      >
                        {item.type === 'image' ? (
                          <img 
                            src={item.url} 
                            alt={`Фото ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="relative w-full h-full bg-black flex items-center justify-center">
                            <video 
                              src={item.url} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                              <Icon name="Play" size={32} className="text-white" />
                            </div>
                          </div>
                        )}
                        
                        <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                          {index + 1}
                        </div>
                        
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Icon name="Maximize2" size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      
                      <div className="flex gap-1 p-1.5 bg-background/95">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMoveMedia(index, 'up')}
                          disabled={index === 0}
                          className="flex-1 h-7 px-1"
                        >
                          <Icon name="ArrowUp" size={14} />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMoveMedia(index, 'down')}
                          disabled={index === media.length - 1}
                          className="flex-1 h-7 px-1"
                        >
                          <Icon name="ArrowDown" size={14} />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteMedia(index)}
                          className="flex-1 h-7 px-1 text-destructive hover:text-destructive"
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

      {viewingMedia !== null && media[viewingMedia] && (
        <div 
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4"
          onClick={() => setViewingMedia(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setViewingMedia(null)}
          >
            <Icon name="X" size={24} />
          </Button>

          {viewingMedia > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setViewingMedia(viewingMedia - 1);
              }}
            >
              <Icon name="ChevronLeft" size={32} />
            </Button>
          )}

          {viewingMedia < media.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setViewingMedia(viewingMedia + 1);
              }}
            >
              <Icon name="ChevronRight" size={32} />
            </Button>
          )}

          <div className="max-w-5xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            {media[viewingMedia].type === 'image' ? (
              <img 
                src={media[viewingMedia].url} 
                alt={`Фото ${viewingMedia + 1}`} 
                className="w-full h-full object-contain"
              />
            ) : (
              <video 
                src={media[viewingMedia].url} 
                controls 
                autoPlay
                className="w-full h-full object-contain"
              />
            )}
            
            <div className="text-center text-white mt-4">
              {viewingMedia + 1} / {media.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomEditModal;