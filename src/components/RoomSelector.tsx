import { useState, useEffect } from 'react';
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

export default function RoomSelector() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [currentFloor, setCurrentFloor] = useState<Floor | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const loadedFloors: Floor[] = JSON.parse(saved);
      setFloors(loadedFloors);
      if (loadedFloors.length > 0) {
        setCurrentFloor(loadedFloors[0]);
      }
    }
  }, []);

  const apartmentRooms = currentFloor?.rooms || [];
  const floorPlanImage = currentFloor?.planImage;

  if (!currentFloor || floors.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-6 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Icon name="Info" size={32} className="text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">Планы этажей не загружены</h2>
          <p className="text-muted-foreground">
            Администратор еще не добавил планы этажей. Скоро здесь появится интерактивная планировка.
          </p>
        </Card>
      </div>
    );
  }

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
              src={floorPlanImage} 
              alt="План этажа"
              className="absolute inset-0 w-full h-full object-contain"
            />
            
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/90 backdrop-blur px-4 py-2 rounded-full shadow-lg z-30">
              <Icon name="Layers" size={18} className="text-primary" />
              <span className="font-semibold">{currentFloor ? `Этаж ${currentFloor.number}` : 'План этажа'}</span>
            </div>

            {floors.length > 1 && (
              <div className="absolute top-4 right-4 flex gap-2 z-30">
                {floors.map(floor => (
                  <Button
                    key={floor.id}
                    variant={currentFloor?.id === floor.id ? 'default' : 'outline'}
                    size="sm"
                    className="bg-background/90 backdrop-blur"
                    onClick={() => setCurrentFloor(floor)}
                  >
                    Этаж {floor.number}
                  </Button>
                ))}
              </div>
            )}

            {apartmentRooms.map(room => {
              const hasPolygon = room.polygon && room.polygon.length > 0;
              const polygonPoints = hasPolygon 
                ? room.polygon!.map(p => `${p.x}%,${p.y}%`).join(' ')
                : '';
              
              return (
                <div
                  key={room.id}
                  className={`absolute cursor-pointer transition-all duration-200 group z-10 ${!hasPolygon ? 'rounded-lg' : ''}`}
                  style={hasPolygon ? {
                    clipPath: `polygon(${polygonPoints})`
                  } : {
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
                    className={`w-full h-full transition-all duration-200 ${!hasPolygon ? 'rounded-lg' : ''} ${
                      room.available
                        ? 'hover:bg-primary/30 hover:ring-4 hover:ring-primary/50 hover:shadow-2xl hover:shadow-primary/50'
                        : 'hover:bg-destructive/30 hover:ring-4 hover:ring-destructive/50 cursor-not-allowed'
                    }`}
                    style={hasPolygon ? {
                      position: 'fixed',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      clipPath: `polygon(${polygonPoints})`
                    } : {}}
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
              );
            })}

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

        <Dialog open={isImageZoomed} onOpenChange={setIsImageZoomed}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0">
            {selectedRoom && selectedRoom.views.length > 0 && (
              <div className="relative w-full h-[95vh] flex items-center justify-center">
                <img
                  src={selectedRoom.views[currentImageIndex]}
                  alt={`Вид ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-white hover:bg-white/20"
                  onClick={() => setIsImageZoomed(false)}
                >
                  <Icon name="X" size={24} />
                </Button>

                {selectedRoom.views.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/60 h-12 w-12"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) => 
                          prev === 0 ? selectedRoom.views.length - 1 : prev - 1
                        );
                      }}
                    >
                      <Icon name="ChevronLeft" size={32} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/60 h-12 w-12"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) => 
                          prev === selectedRoom.views.length - 1 ? 0 : prev + 1
                        );
                      }}
                    >
                      <Icon name="ChevronRight" size={32} />
                    </Button>
                  </>
                )}

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-white">
                  {currentImageIndex + 1} / {selectedRoom.views.length}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

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

                {selectedRoom.views.length > 0 ? (
                  <div className="relative">
                    <div 
                      className="relative aspect-video rounded-xl overflow-hidden group cursor-zoom-in"
                      onClick={() => setIsImageZoomed(true)}
                    >
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
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Icon name="Maximize2" size={20} className="text-white" />
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
                ) : (
                  <Card className="p-12 bg-muted/30 border-2 border-dashed border-muted-foreground/30 rounded-xl">
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="p-4 bg-muted rounded-full">
                          <Icon name="EyeOff" size={48} className="text-muted-foreground" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Номер без окон</h3>
                        <p className="text-muted-foreground">
                          Этот номер не имеет окон, но оснащён современной системой вентиляции и кондиционирования для максимального комфорта.
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

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