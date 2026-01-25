import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  order: number;
}

interface Room {
  id: number;
  room_number: string;
  category: string;
  price: number;
  media?: MediaItem[];
}

interface RoomMediaModalProps {
  room: Room | null;
  onClose: () => void;
  onSelect?: (room: Room) => void;
}

const RoomMediaModal = ({ room, onClose, onSelect }: RoomMediaModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!room) return null;

  const media = room.media || [];
  const hasMedia = media.length > 0;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-4xl max-h-[90vh] overflow-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold">Номер {room.room_number}</h2>
            <p className="text-muted-foreground">{room.category} • {room.price}₽/ночь</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={24} />
          </Button>
        </div>

        <div className="p-6">
          {hasMedia ? (
            <div className="space-y-4">
              <div className="relative bg-muted rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
                {media[currentIndex].type === 'image' ? (
                  <img 
                    src={media[currentIndex].url} 
                    alt={`${room.room_number} - фото ${currentIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video 
                    src={media[currentIndex].url} 
                    controls
                    className="w-full h-full object-contain"
                  />
                )}

                {media.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      onClick={handlePrev}
                    >
                      <Icon name="ChevronLeft" size={24} />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      onClick={handleNext}
                    >
                      <Icon name="ChevronRight" size={24} />
                    </Button>
                  </>
                )}

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentIndex + 1} / {media.length}
                </div>
              </div>

              {media.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {media.map((item, index) => (
                    <button
                      key={index}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentIndex ? 'border-primary scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      onClick={() => setCurrentIndex(index)}
                    >
                      {item.type === 'image' ? (
                        <img src={item.url} alt={`Миниатюра ${index + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Icon name="Video" size={24} className="text-muted-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Icon name="ImageOff" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">Фото и видео для этого номера пока не загружены</p>
            </div>
          )}

          {onSelect && (
            <div className="mt-6 pt-6 border-t">
              <Button onClick={() => onSelect(room)} className="w-full" size="lg">
                <Icon name="Check" size={20} className="mr-2" />
                Выбрать этот номер
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default RoomMediaModal;
