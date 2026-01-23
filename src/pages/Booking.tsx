import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface RoomDetails {
  id: string;
  number: string;
  category: string;
  price: number;
  image: string;
}

const Booking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const checkInStr = searchParams.get('checkIn');
  const checkOutStr = searchParams.get('checkOut');
  const roomId = searchParams.get('roomId');
  const category = searchParams.get('category');
  
  const checkIn = checkInStr ? new Date(checkInStr) : null;
  const checkOut = checkOutStr ? new Date(checkOutStr) : null;

  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const fetchRoomDetails = async () => {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const roomDetails: Record<string, RoomDetails> = {
        '101': { id: '101', number: '101', category: 'Стандарт', price: 3500, image: 'https://cdn.poehali.dev/projects/e22df45d-2e7a-49eb-bbb7-4cd88aa61e87/files/556ce1d4-e81c-482e-9d89-8e7a055c6441.jpg' },
        '102': { id: '102', number: '102', category: 'Стандарт', price: 3500, image: 'https://cdn.poehali.dev/projects/e22df45d-2e7a-49eb-bbb7-4cd88aa61e87/files/556ce1d4-e81c-482e-9d89-8e7a055c6441.jpg' },
        '104': { id: '104', number: '104', category: 'Комфорт', price: 5000, image: 'https://cdn.poehali.dev/projects/e22df45d-2e7a-49eb-bbb7-4cd88aa61e87/files/14653dac-4fd7-4b10-bb48-19d947f3e3d8.jpg' },
        '201': { id: '201', number: '201', category: 'Комфорт', price: 5000, image: 'https://cdn.poehali.dev/projects/e22df45d-2e7a-49eb-bbb7-4cd88aa61e87/files/14653dac-4fd7-4b10-bb48-19d947f3e3d8.jpg' },
        '203': { id: '203', number: '203', category: 'Люкс', price: 8500, image: 'https://cdn.poehali.dev/projects/e22df45d-2e7a-49eb-bbb7-4cd88aa61e87/files/d8fbf5ce-f852-4a87-a7ee-a1028ffffff3.jpg' },
        '301': { id: '301', number: '301', category: 'Люкс', price: 8500, image: 'https://cdn.poehali.dev/projects/e22df45d-2e7a-49eb-bbb7-4cd88aa61e87/files/d8fbf5ce-f852-4a87-a7ee-a1028ffffff3.jpg' },
      };
      
      if (roomId && roomDetails[roomId]) {
        setRoom(roomDetails[roomId]);
      } else if (category) {
        const matchingRoom = Object.values(roomDetails).find(r => r.category === category);
        setRoom(matchingRoom || null);
      }
      
      setLoading(false);
    };

    fetchRoomDetails();
  }, [roomId, category]);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const totalPrice = room ? room.price * nights : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      alert('Пожалуйста, заполните все поля');
      return;
    }
    
    navigate(`/payment?checkIn=${checkInStr}&checkOut=${checkOutStr}&roomId=${room?.id}&price=${totalPrice}`);
  };

  if (!checkIn || !checkOut || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Номер не найден</h2>
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
          <h1 className="text-xl font-bold">IVAN HOTEL</h1>
          <div className="w-24" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Оформление бронирования</h2>
            <p className="text-muted-foreground">Заполните данные для завершения</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6">Контактные данные</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Имя *</label>
                      <Input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Иван"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Фамилия *</label>
                      <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Иванов"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="ivan@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Телефон *</label>
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+7 (999) 123-45-67"
                      required
                    />
                  </div>

                  <div className="pt-4">
                    <Button type="submit" size="lg" className="w-full">
                      <Icon name="CreditCard" size={16} className="mr-2" />
                      Перейти к оплате
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h3 className="font-bold mb-4">Детали бронирования</h3>
                
                <div 
                  className="h-32 bg-cover bg-center rounded-lg mb-4"
                  style={{ backgroundImage: `url(${room.image})` }}
                />

                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-xl font-bold">Номер {room.number}</div>
                    <div className="text-muted-foreground">{room.category}</div>
                  </div>

                  <div className="py-3 border-y space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Заезд</span>
                      <span className="font-medium">{format(checkIn, 'dd MMM yyyy', { locale: ru })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Выезд</span>
                      <span className="font-medium">{format(checkOut, 'dd MMM yyyy', { locale: ru })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ночей</span>
                      <span className="font-medium">{nights}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Итого</span>
                      <span className="text-2xl font-bold text-primary">{totalPrice.toLocaleString()} ₽</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
