import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface AvailableRoom {
  category: string;
  price: number;
  count: number;
  description: string;
}

const Rooms = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState<AvailableRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const checkInStr = searchParams.get('checkIn');
  const checkOutStr = searchParams.get('checkOut');
  
  const checkIn = checkInStr ? new Date(checkInStr) : null;
  const checkOut = checkOutStr ? new Date(checkOutStr) : null;

  useEffect(() => {
    const fetchAvailableRooms = async () => {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockAvailableRooms: AvailableRoom[] = [
        { 
          category: 'Стандарт', 
          price: 3500, 
          count: 5, 
          description: 'Уютный номер с одной двуспальной кроватью, ванной комнатой и телевизором' 
        },
        { 
          category: 'Комфорт', 
          price: 5000, 
          count: 3, 
          description: 'Просторный номер с улучшенной мебелью, мини-баром и рабочей зоной' 
        },
        { 
          category: 'Люкс', 
          price: 8500, 
          count: 2, 
          description: 'Премиум номер с отдельной гостиной, джакузи и панорамным видом' 
        },
      ];
      
      setRooms(mockAvailableRooms);
      setLoading(false);
    };

    fetchAvailableRooms();
  }, [checkInStr, checkOutStr]);

  const handleViewFloorPlan = (category: string) => {
    navigate(`/floorplan?checkIn=${checkInStr}&checkOut=${checkOutStr}&category=${category}`);
  };

  const handleBookDirect = (category: string) => {
    navigate(`/booking?checkIn=${checkInStr}&checkOut=${checkOutStr}&category=${category}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/hotel')}>
            <Icon name="ArrowLeft" className="mr-2" size={16} />
            Назад
          </Button>
          <h1 className="text-xl font-bold">IVAN HOTEL</h1>
          <div className="w-24" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {checkIn && checkOut && (
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-center gap-8 text-center">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Дата заезда</div>
                <div className="font-bold text-lg">{format(checkIn, 'dd MMMM yyyy', { locale: ru })}</div>
              </div>
              <Icon name="ArrowRight" size={24} className="text-primary" />
              <div>
                <div className="text-sm text-muted-foreground mb-1">Дата выезда</div>
                <div className="font-bold text-lg">{format(checkOut, 'dd MMMM yyyy', { locale: ru })}</div>
              </div>
            </div>
          </Card>
        )}

        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Доступные номера</h2>
          <p className="text-muted-foreground">Выберите категорию номера для бронирования</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {rooms.map((room) => (
              <Card 
                key={room.category}
                className={`p-6 transition-all ${
                  selectedCategory === room.category ? 'border-primary shadow-lg' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/4 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="Home" size={48} className="text-primary" />
                    </div>
                  </div>
                  
                  <div className="md:w-3/4 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{room.category}</h3>
                      <p className="text-muted-foreground">{room.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Icon name="Check" size={16} className="text-green-600" />
                        <span className="font-medium text-green-600">
                          Доступно: {room.count} {room.count === 1 ? 'номер' : 'номера'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-end justify-between pt-4 border-t">
                      <div>
                        <div className="text-3xl font-bold text-primary">{room.price} ₽</div>
                        <div className="text-sm text-muted-foreground">за ночь</div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => handleViewFloorPlan(room.category)}
                        >
                          <Icon name="Map" size={16} className="mr-2" />
                          Выбрать на плане
                        </Button>
                        <Button
                          onClick={() => handleBookDirect(room.category)}
                        >
                          <Icon name="Calendar" size={16} className="mr-2" />
                          Забронировать
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;
