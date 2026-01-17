import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Room {
  id: string;
  number: string;
  floor: number;
  type: string;
  capacity: number;
  price: number;
  available: boolean;
  position: { x: number; y: number };
  views: string[];
  amenities: string[];
  size: number;
}

const mockRooms: Room[] = [
  {
    id: '101',
    number: '101',
    floor: 1,
    type: 'Стандарт',
    capacity: 2,
    price: 5500,
    available: true,
    position: { x: 10, y: 20 },
    views: ['https://images.unsplash.com/photo-1566073771259-6a8506099945', 'https://images.unsplash.com/photo-1582719508461-905c673771fd'],
    amenities: ['Wi-Fi', 'Кондиционер', 'Телевизор'],
    size: 25
  },
  {
    id: '102',
    number: '102',
    floor: 1,
    type: 'Люкс',
    capacity: 3,
    price: 8900,
    available: true,
    position: { x: 35, y: 20 },
    views: ['https://images.unsplash.com/photo-1445019980597-93fa8acb246c', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461'],
    amenities: ['Wi-Fi', 'Кондиционер', 'Телевизор', 'Мини-бар', 'Балкон'],
    size: 35
  },
  {
    id: '103',
    number: '103',
    floor: 1,
    type: 'Делюкс',
    capacity: 4,
    price: 12500,
    available: false,
    position: { x: 60, y: 20 },
    views: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'],
    amenities: ['Wi-Fi', 'Кондиционер', 'Телевизор', 'Мини-бар', 'Балкон', 'Джакузи'],
    size: 45
  },
  {
    id: '201',
    number: '201',
    floor: 2,
    type: 'Стандарт',
    capacity: 2,
    price: 6000,
    available: true,
    position: { x: 10, y: 20 },
    views: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d'],
    amenities: ['Wi-Fi', 'Кондиционер', 'Телевизор'],
    size: 25
  },
  {
    id: '202',
    number: '202',
    floor: 2,
    type: 'Люкс',
    capacity: 3,
    price: 9500,
    available: true,
    position: { x: 35, y: 20 },
    views: ['https://images.unsplash.com/photo-1549294413-26f195200c16'],
    amenities: ['Wi-Fi', 'Кондиционер', 'Телевизор', 'Мини-бар', 'Балкон'],
    size: 35
  },
  {
    id: '203',
    number: '203',
    floor: 2,
    type: 'Президентский люкс',
    capacity: 5,
    price: 18000,
    available: true,
    position: { x: 60, y: 20 },
    views: ['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa'],
    amenities: ['Wi-Fi', 'Кондиционер', 'Телевизор', 'Мини-бар', 'Балкон', 'Джакузи', 'Кухня'],
    size: 65
  }
];

export default function RoomSelector() {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  const floors = [1, 2];
  const currentFloorRooms = mockRooms.filter(room => room.floor === selectedFloor);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-scale-in">
            Выбор номера
          </h1>
          <p className="text-muted-foreground text-lg">Выберите идеальный номер с панорамным видом</p>
        </div>

        <div className="flex justify-center gap-3">
          {floors.map(floor => (
            <Button
              key={floor}
              onClick={() => setSelectedFloor(floor)}
              variant={selectedFloor === floor ? 'default' : 'outline'}
              className="px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105"
            >
              <Icon name="Building2" className="mr-2" size={20} />
              {floor} этаж
            </Button>
          ))}
        </div>

        <Card className="p-8 bg-card/50 backdrop-blur-sm border-2 border-primary/20 shadow-2xl">
          <div className="relative w-full h-96 bg-muted/30 rounded-xl border-2 border-dashed border-primary/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
            
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur px-4 py-2 rounded-full">
              <Icon name="Layers" size={18} className="text-primary" />
              <span className="font-semibold">Этаж {selectedFloor}</span>
            </div>

            {currentFloorRooms.map(room => (
              <div
                key={room.id}
                className={`absolute cursor-pointer transition-all duration-300 group ${
                  hoveredRoom === room.id ? 'z-20' : 'z-10'
                }`}
                style={{
                  left: `${room.position.x}%`,
                  top: `${room.position.y}%`,
                  transform: hoveredRoom === room.id ? 'scale(1.1)' : 'scale(1)'
                }}
                onMouseEnter={() => setHoveredRoom(room.id)}
                onMouseLeave={() => setHoveredRoom(null)}
                onClick={() => setSelectedRoom(room)}
              >
                <div
                  className={`w-32 h-24 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300 ${
                    room.available
                      ? 'bg-primary/20 border-primary hover:bg-primary/40 hover:border-secondary hover:shadow-xl hover:shadow-primary/50'
                      : 'bg-muted/40 border-muted-foreground/30 cursor-not-allowed opacity-60'
                  } ${hoveredRoom === room.id ? 'animate-pulse-glow' : ''}`}
                >
                  <span className="text-2xl font-bold">{room.number}</span>
                  <span className="text-xs text-muted-foreground">{room.type}</span>
                  {!room.available && (
                    <Badge variant="destructive" className="mt-1 text-xs">
                      Занят
                    </Badge>
                  )}
                </div>

                {hoveredRoom === room.id && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-background/95 backdrop-blur-sm border border-primary/30 rounded-lg p-3 shadow-2xl w-48 animate-scale-in">
                    <p className="text-sm font-semibold">Номер {room.number}</p>
                    <p className="text-xs text-muted-foreground">{room.type}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Icon name="Users" size={14} className="text-primary" />
                      <span className="text-xs">{room.capacity} гостя</span>
                    </div>
                    <p className="text-primary font-bold mt-2">{room.price.toLocaleString()} ₽/ночь</p>
                  </div>
                )}
              </div>
            ))}

            <div className="absolute bottom-4 right-4 flex gap-4">
              <div className="flex items-center gap-2 bg-background/80 backdrop-blur px-3 py-2 rounded-full">
                <div className="w-4 h-4 rounded bg-primary border-2 border-primary" />
                <span className="text-xs">Доступен</span>
              </div>
              <div className="flex items-center gap-2 bg-background/80 backdrop-blur px-3 py-2 rounded-full">
                <div className="w-4 h-4 rounded bg-muted/40 border-2 border-muted-foreground/30" />
                <span className="text-xs">Занят</span>
              </div>
            </div>
          </div>
        </Card>

        <Dialog open={!!selectedRoom} onOpenChange={(open) => !open && setSelectedRoom(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedRoom && (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold">
                    Номер {selectedRoom.number} — {selectedRoom.type}
                  </DialogTitle>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-4">
                  {selectedRoom.views.map((view, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden group">
                      <img
                        src={view}
                        alt={`Вид ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                          <Icon name="Eye" size={18} />
                          <span className="text-sm font-medium">Вид из окна {idx + 1}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="p-4 flex items-center gap-3 bg-primary/10 border-primary/30">
                    <Icon name="Users" size={24} className="text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Вместимость</p>
                      <p className="font-semibold">{selectedRoom.capacity} гостя</p>
                    </div>
                  </Card>

                  <Card className="p-4 flex items-center gap-3 bg-secondary/10 border-secondary/30">
                    <Icon name="Maximize2" size={24} className="text-secondary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Площадь</p>
                      <p className="font-semibold">{selectedRoom.size} м²</p>
                    </div>
                  </Card>

                  <Card className="p-4 flex items-center gap-3 bg-primary/10 border-primary/30">
                    <Icon name="DollarSign" size={24} className="text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Цена</p>
                      <p className="font-semibold">{selectedRoom.price.toLocaleString()} ₽</p>
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

                <Button 
                  size="lg" 
                  className="w-full text-lg font-semibold"
                  disabled={!selectedRoom.available}
                >
                  {selectedRoom.available ? (
                    <>
                      <Icon name="Check" className="mr-2" size={20} />
                      Выбрать номер
                    </>
                  ) : (
                    <>
                      <Icon name="X" className="mr-2" size={20} />
                      Номер занят
                    </>
                  )}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
