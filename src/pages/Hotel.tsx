import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const Hotel = () => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBooking = () => {
    if (checkIn && checkOut) {
      navigate(`/rooms?checkIn=${checkIn.toISOString()}&checkOut=${checkOut.toISOString()}`);
    }
  };

  const roomCategories = [
    {
      id: 1,
      name: 'Стандарт',
      description: 'Уютный номер с современным дизайном и всеми удобствами',
      price: 3500,
      image: 'https://cdn.poehali.dev/projects/e22df45d-2e7a-49eb-bbb7-4cd88aa61e87/files/556ce1d4-e81c-482e-9d89-8e7a055c6441.jpg',
      features: ['20 м²', '1-2 гостя', 'Wi-Fi', 'Кондиционер']
    },
    {
      id: 2,
      name: 'Комфорт',
      description: 'Просторный номер повышенной комфортности с видом на город',
      price: 5000,
      image: 'https://cdn.poehali.dev/projects/e22df45d-2e7a-49eb-bbb7-4cd88aa61e87/files/14653dac-4fd7-4b10-bb48-19d947f3e3d8.jpg',
      features: ['30 м²', '2-3 гостя', 'Wi-Fi', 'Мини-бар']
    },
    {
      id: 3,
      name: 'Люкс',
      description: 'Роскошный номер с отдельной гостиной и панорамными окнами',
      price: 8500,
      image: 'https://cdn.poehali.dev/projects/e22df45d-2e7a-49eb-bbb7-4cd88aa61e87/files/d8fbf5ce-f852-4a87-a7ee-a1028ffffff3.jpg',
      features: ['50 м²', '3-4 гостя', 'Джакузи', 'Балкон']
    }
  ];

  const services = [
    { icon: 'Wifi', title: 'Бесплатный Wi-Fi', description: 'Высокоскоростной интернет' },
    { icon: 'Car', title: 'Парковка', description: 'Охраняемая парковка для гостей' },
    { icon: 'Utensils', title: 'Ресторан', description: 'Завтраки и изысканная кухня' },
    { icon: 'Dumbbell', title: 'Фитнес-центр', description: 'Современный тренажерный зал' },
    { icon: 'Waves', title: 'Бассейн', description: 'Крытый бассейн с подогревом' },
    { icon: 'Clock', title: '24/7 Стойка', description: 'Круглосуточная регистрация' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-sm shadow-md' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            IVAN HOTEL
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#rooms" className="hover:text-primary transition-colors">Номера</a>
            <a href="#services" className="hover:text-primary transition-colors">Услуги</a>
            <a href="#about" className="hover:text-primary transition-colors">О нас</a>
            <a href="#contacts" className="hover:text-primary transition-colors">Контакты</a>
          </nav>

          <Button asChild>
            <a href="#booking">
              <Icon name="Calendar" className="mr-2" size={16} />
              Забронировать
            </a>
          </Button>
        </div>
      </header>

      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url(https://cdn.poehali.dev/files/chad_c2d41f550e6946c781061ca671e0b4a8.png)',
            filter: 'brightness(0.6)'
          }}
        />
        
        <div className="relative z-10 text-center text-white space-y-6 px-4">
          <h1 className="text-5xl md:text-7xl font-bold">IVAN HOTEL</h1>
          <p className="text-xl md:text-2xl text-white/90">Ваш идеальный отдых в центре города</p>
          <Button size="lg" className="text-lg px-8" onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}>
            <Icon name="Calendar" className="mr-2" />
            Забронировать номер
          </Button>
        </div>
      </section>

      <section id="booking" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Забронировать номер</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Дата заезда</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <Icon name="Calendar" className="mr-2" size={16} />
                      {checkIn ? format(checkIn, 'dd MMMM yyyy', { locale: ru }) : 'Выберите дату'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={setCheckIn}
                      disabled={(date) => date < new Date()}
                      locale={ru}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Дата выезда</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <Icon name="Calendar" className="mr-2" size={16} />
                      {checkOut ? format(checkOut, 'dd MMMM yyyy', { locale: ru }) : 'Выберите дату'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkOut}
                      onSelect={setCheckOut}
                      disabled={(date) => !checkIn || date <= checkIn}
                      locale={ru}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-end">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={handleBooking}
                  disabled={!checkIn || !checkOut}
                >
                  <Icon name="Search" className="mr-2" />
                  Найти номера
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section id="rooms" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Наши номера</h2>
            <p className="text-muted-foreground text-lg">Выберите номер по вашему вкусу</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {roomCategories.map((room) => (
              <Card key={room.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div 
                  className="h-64 bg-cover bg-center"
                  style={{ backgroundImage: `url(${room.image})` }}
                />
                
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{room.name}</h3>
                    <p className="text-muted-foreground">{room.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {room.features.map((feature, idx) => (
                      <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <span className="text-3xl font-bold text-primary">{room.price} ₽</span>
                      <span className="text-muted-foreground">/ночь</span>
                    </div>
                    <Button onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}>
                      Выбрать
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Наши услуги</h2>
            <p className="text-muted-foreground text-lg">Мы позаботимся о вашем комфорте</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <Card key={idx} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name={service.icon as any} size={32} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">О нас</h2>
              <p className="text-lg text-muted-foreground">
                IVAN HOTEL — это современный отель в самом центре города, где элегантность встречается с комфортом. 
                Мы предлагаем нашим гостям незабываемый опыт проживания с первоклассным сервисом.
              </p>
              <p className="text-lg text-muted-foreground">
                Наш отель оснащен всем необходимым для комфортного отдыха и продуктивной работы. 
                Профессиональная команда готова помочь вам 24/7.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">50+</div>
                  <div className="text-sm text-muted-foreground">Номеров</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">1000+</div>
                  <div className="text-sm text-muted-foreground">Гостей</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">5★</div>
                  <div className="text-sm text-muted-foreground">Рейтинг</div>
                </div>
              </div>
            </div>
            
            <div className="relative h-96 rounded-lg overflow-hidden shadow-2xl">
              <img 
                src="https://cdn.poehali.dev/projects/e22df45d-2e7a-49eb-bbb7-4cd88aa61e87/files/14653dac-4fd7-4b10-bb48-19d947f3e3d8.jpg"
                alt="О нас"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="contacts" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Контакты</h2>
            <p className="text-muted-foreground text-lg">Свяжитесь с нами удобным способом</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="p-6 text-center">
              <Icon name="MapPin" size={32} className="mx-auto mb-4 text-primary" />
              <h3 className="font-bold mb-2">Адрес</h3>
              <p className="text-muted-foreground"></p>
            </Card>

            <Card className="p-6 text-center">
              <Icon name="Phone" size={32} className="mx-auto mb-4 text-primary" />
              <h3 className="font-bold mb-2">Телефон</h3>
              <p className="text-muted-foreground"></p>
            </Card>

            <Card className="p-6 text-center">
              <Icon name="Mail" size={32} className="mx-auto mb-4 text-primary" />
              <h3 className="font-bold mb-2">Email</h3>
              <p className="text-muted-foreground"></p>
            </Card>
          </div>
        </div>
      </section>

      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 IVAN HOTEL. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Hotel;