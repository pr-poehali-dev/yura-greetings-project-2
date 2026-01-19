import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const FloorPlan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const checkInStr = searchParams.get('checkIn');
  const checkOutStr = searchParams.get('checkOut');
  const roomId = searchParams.get('room');
  
  const checkIn = checkInStr ? new Date(checkInStr) : null;
  const checkOut = checkOutStr ? new Date(checkOutStr) : null;

  const [selectedRoom] = useState(roomId);

  const roomDetails: Record<string, { number: string; category: string; price: number; image: string }> = {
    '101': { number: '101', category: 'Стандарт', price: 3500, image: 'https://cdn.poehali.dev/projects/e22df45d-2e7a-49eb-bbb7-4cd88aa61e87/files/556ce1d4-e81c-482e-9d89-8e7a055c6441.jpg' },
    '102': { number: '102', category: 'Стандарт', price: 3500, image: 'https://cdn.poehali.dev/projects/e22df45d-2e7a-49eb-bbb7-4cd88aa61e87/files/556ce1d4-e81c-482e-9d89-8e7a055c6441.jpg' },
    '103': { number: '103', category: 'Стандарт', price: 3500, image: 'https://cdn.poehali.dev/projects/e22df45d-2e7a-49eb-bbb7-4cd88aa61e87/files/556ce1d4-e81c-482e-9d89-8e7a055c6441.jpg' },
    '104': { number: '104', category: 'Комфорт', price: 5000, image: 'https://cdn.poehali.dev/projects/e22df45d-2e7a-49eb-bbb7-4cd88aa61e87/files/14653dac-4fd7-4b10-bb48-19d947f3e3d8.jpg' },
    '201': { number: '201', category: 'Комфорт', price: 5000, image: 'https://cdn.poehali.dev/projects/e22df45d-2e7a-49eb-bbb7-4cd88aa61e87/files/14653dac-4fd7-4b10-bb48-19d947f3e3d8.jpg' },
    '202': { number: '202', category: 'Комфорт', price: 5000, image: 'https://cdn.poehali.dev/projects/e22df45d-2e7a-49eb-bbb7-4cd88aa61e87/files/14653dac-4fd7-4b10-bb48-19d947f3e3d8.jpg' },
    '203': { number: '203', category: 'Люкс', price: 8500, image: 'https://cdn.poehali.dev/projects/e22df45d-2e7a-49eb-bbb7-4cd88aa61e87/files/d8fbf5ce-f852-4a87-a7ee-a1028ffffff3.jpg' },
    '301': { number: '301', category: 'Люкс', price: 8500, image: 'https://cdn.poehali.dev/projects/e22df45d-2e7a-49eb-bbb7-4cd88aa61e87/files/d8fbf5ce-f852-4a87-a7ee-a1028ffffff3.jpg' },
    '302': { number: '302', category: 'Люкс', price: 8500, image: 'https://cdn.poehali.dev/projects/e22df45d-2e7a-49eb-bbb7-4cd88aa61e87/files/d8fbf5ce-f852-4a87-a7ee-a1028ffffff3.jpg' },
  };

  const room = selectedRoom ? roomDetails[selectedRoom] : null;

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const totalPrice = room ? room.price * nights : 0;

  const handleConfirmBooking = () => {
    navigate(`/payment?checkIn=${checkInStr}&checkOut=${checkOutStr}&room=${roomId}&price=${totalPrice}`);
  };

  if (!room || !checkIn || !checkOut) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Данные не найдены</h2>
          <p className="text-muted-foreground mb-4">Пожалуйста, начните бронирование сначала</p>
          <Button onClick={() => navigate('/hotel')}>
            Вернуться на главную
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <Icon name="ArrowLeft" className="mr-2" size={16} />
            Назад
          </Button>
          <h1 className="text-xl font-bold">STATUS HOTEL</h1>
          <div className="w-24" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Подтверждение бронирования</h2>
            <p className="text-muted-foreground">Проверьте детали вашего бронирования</p>
          </div>

          <Card className="overflow-hidden">
            <div 
              className="h-64 bg-cover bg-center"
              style={{ backgroundImage: `url(${room.image})` }}
            />
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Номер {room.number}</h3>
                <p className="text-muted-foreground text-lg">{room.category}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 py-6 border-y">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Icon name="Calendar" size={20} className="text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Дата заезда</div>
                      <div className="font-medium">{format(checkIn, 'dd MMMM yyyy', { locale: ru })}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Icon name="Calendar" size={20} className="text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Дата выезда</div>
                      <div className="font-medium">{format(checkOut, 'dd MMMM yyyy', { locale: ru })}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Icon name="Moon" size={20} className="text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Количество ночей</div>
                      <div className="font-medium">{nights}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Icon name="DollarSign" size={20} className="text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Цена за ночь</div>
                      <div className="font-medium">{room.price} ₽</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Итого к оплате</div>
                  <div className="text-3xl font-bold text-primary">{totalPrice.toLocaleString()} ₽</div>
                </div>
                
                <Button size="lg" onClick={handleConfirmBooking}>
                  <Icon name="CreditCard" className="mr-2" />
                  Перейти к оплате
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-muted/50">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <Icon name="Info" size={20} className="text-primary" />
              Информация о бронировании
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Заезд с 14:00, выезд до 12:00</li>
              <li>• Оплата при бронировании или на месте</li>
              <li>• Бесплатная отмена за 24 часа до заезда</li>
              <li>• В стоимость включен завтрак</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FloorPlan;
