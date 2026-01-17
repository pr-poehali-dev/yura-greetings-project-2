import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

const apartmentRooms: Room[] = [
  { id: '1', number: '1', type: 'Стандарт', area: 32, rooms: 1, capacity: 2, price: 6500, available: true, 
    position: { x: 3, y: 52, width: 30, height: 43 }, 
    views: ['https://images.unsplash.com/photo-1502672260066-6bc05ed0d1cc', 'https://images.unsplash.com/photo-1566073771259-6a8506099945'], 
    amenities: ['Ванная комната', 'Wi-Fi', 'Кондиционер', 'Телевизор', 'Рабочая зона'] },
  
  { id: '2', number: '2', type: 'Стандарт', area: 30, rooms: 1, capacity: 2, price: 6000, available: false, 
    position: { x: 3, y: 5, width: 30, height: 43 }, 
    views: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'], 
    amenities: ['Ванная комната', 'Wi-Fi', 'Кондиционер', 'Телевизор'] },
  
  { id: '3', number: '3', type: 'Комфорт', area: 38, rooms: 1, capacity: 3, price: 7500, available: true, 
    position: { x: 37, y: 5, width: 26, height: 43 }, 
    views: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', 'https://images.unsplash.com/photo-1502672260066-6bc05ed0d1cc'], 
    amenities: ['Ванная комната', 'Wi-Fi', 'Кондиционер', 'Телевизор', 'Мини-бар', 'Увеличенная площадь'] },
  
  { id: '4', number: '4', type: 'Стандарт', area: 31, rooms: 1, capacity: 2, price: 6200, available: true, 
    position: { x: 67, y: 5, width: 30, height: 43 }, 
    views: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'], 
    amenities: ['Ванная комната', 'Wi-Fi', 'Кондиционер', 'Телевизор'] },
  
  { id: '5', number: '5', type: 'Стандарт', area: 32, rooms: 1, capacity: 2, price: 6500, available: true, 
    position: { x: 67, y: 52, width: 30, height: 43 }, 
    views: ['https://images.unsplash.com/photo-1556020685-ae41abfc9365', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'], 
    amenities: ['Ванная комната', 'Wi-Fi', 'Кондиционер', 'Телевизор', 'Рабочая зона'] }
];

export default function RoomSelector() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-scale-in">
            Выбор апартамента
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">Интерактивная планировка типового этажа</p>
        </div>

        <Card className="p-4 md:p-8 bg-card/50 backdrop-blur-sm border-2 border-primary/20 shadow-2xl">
          <div className="relative w-full aspect-[3/2] bg-background rounded-xl overflow-hidden">
            <img 
              src="https://cdn.poehali.dev/files/этаж 1.jpg" 
              alt="План этажа"
              className="absolute inset-0 w-full h-full object-contain"
            />
            
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/90 backdrop-blur px-4 py-2 rounded-full shadow-lg z-30">
              <Icon name="Layers" size={18} className="text-primary" />
              <span className="font-semibold">Типовой этаж</span>
            </div>

            {apartmentRooms.map(room => (
              <div
                key={room.id}
                className={`absolute cursor-pointer transition-all duration-200 group z-10`}
                style={{
                  left: `${room.position.x}%`,
                  top: `${room.position.y}%`,
                  width: `${room.position.width}%`,
                  height: `${room.position.height}%`
                }}
                onMouseEnter={() => setHoveredRoom(room.id)}
                onMouseLeave={() => setHoveredRoom(null)}
                onClick={() => {
                  setSelectedRoom(room);
                  setCurrentImageIndex(0);
                }}
              >
                <div
                  className={`w-full h-full rounded-lg transition-all duration-200 ${
                    room.available
                      ? 'hover:bg-primary/30 hover:ring-4 hover:ring-primary/50 hover:shadow-2xl hover:shadow-primary/50'
                      : 'hover:bg-destructive/30 hover:ring-4 hover:ring-destructive/50 cursor-not-allowed'
                  }`}
                />

                {hoveredRoom === room.id && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-background/95 backdrop-blur-sm border-2 border-primary/50 rounded-lg p-3 shadow-2xl w-56 animate-scale-in pointer-events-none z-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-base font-bold">№{room.number}</p>
                        <p className="text-xs text-muted-foreground">{room.type} • {room.rooms}-комн</p>
                      </div>
                      {!room.available && (
                        <Badge variant="destructive" className="text-xs">
                          Занят
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Icon name="Maximize2" size={14} className="text-primary" />
                      <span className="text-xs">{room.area} м²</span>
                    </div>
                    <p className="text-primary font-bold mt-2 text-lg">{room.price.toLocaleString()} ₽/сутки</p>
                  </div>
                )}
              </div>
            ))}

            <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur px-4 py-3 rounded-lg shadow-lg z-30 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-2">Наведите курсор на номер</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs">Доступен</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-xs">Занят</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Dialog open={!!selectedRoom} onOpenChange={(open) => !open && setSelectedRoom(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            {selectedRoom && (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold">
                    Апартамент №{selectedRoom.number} — {selectedRoom.type}
                  </DialogTitle>
                  <p className="text-muted-foreground">
                    {selectedRoom.rooms}-комнатный • {selectedRoom.area} м²
                  </p>
                </DialogHeader>

                <div className="relative">
                  <div className="relative aspect-video rounded-xl overflow-hidden group">
                    <img
                      src={selectedRoom.views[currentImageIndex]}
                      alt={`Вид ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                        <Icon name="Eye" size={20} />
                        <span className="font-medium">Вид из окна {currentImageIndex + 1} из {selectedRoom.views.length}</span>
                      </div>
                    </div>
                  </div>

                  {selectedRoom.views.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur hover:bg-background/95"
                        onClick={() => setCurrentImageIndex((prev) => 
                          prev === 0 ? selectedRoom.views.length - 1 : prev - 1
                        )}
                      >
                        <Icon name="ChevronLeft" size={24} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur hover:bg-background/95"
                        onClick={() => setCurrentImageIndex((prev) => 
                          prev === selectedRoom.views.length - 1 ? 0 : prev + 1
                        )}
                      >
                        <Icon name="ChevronRight" size={24} />
                      </Button>
                    </>
                  )}

                  <div className="flex justify-center gap-2 mt-4">
                    {selectedRoom.views.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          currentImageIndex === idx 
                            ? 'bg-primary w-8' 
                            : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="p-4 flex items-center gap-3 bg-primary/10 border-primary/30">
                    <Icon name="Users" size={24} className="text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Вместимость</p>
                      <p className="font-semibold">до {selectedRoom.capacity} гостей</p>
                    </div>
                  </Card>

                  <Card className="p-4 flex items-center gap-3 bg-secondary/10 border-secondary/30">
                    <Icon name="Maximize2" size={24} className="text-secondary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Площадь</p>
                      <p className="font-semibold">{selectedRoom.area} м²</p>
                    </div>
                  </Card>

                  <Card className="p-4 flex items-center gap-3 bg-primary/10 border-primary/30">
                    <Icon name="DoorOpen" size={24} className="text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Комнат</p>
                      <p className="font-semibold">{selectedRoom.rooms}</p>
                    </div>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Icon name="Sparkles" size={20} className="text-primary" />
                    Удобства
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoom.amenities.map((amenity, idx) => (
                      <Badge key={idx} variant="secondary" className="px-3 py-1">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <p className="text-muted-foreground text-sm">Стоимость за сутки</p>
                      <p className="text-4xl font-bold text-primary">{selectedRoom.price.toLocaleString()} ₽</p>
                    </div>
                    {selectedRoom.available && (
                      <Badge variant="outline" className="border-primary text-primary">
                        <Icon name="Check" size={16} className="mr-1" />
                        Доступен
                      </Badge>
                    )}
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full text-lg font-semibold"
                    disabled={!selectedRoom.available}
                  >
                    {selectedRoom.available ? (
                      <>
                        <Icon name="CalendarCheck" className="mr-2" size={20} />
                        Забронировать апартамент
                      </>
                    ) : (
                      <>
                        <Icon name="X" className="mr-2" size={20} />
                        Апартамент занят
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}