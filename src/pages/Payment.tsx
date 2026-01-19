import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const checkInStr = searchParams.get('checkIn');
  const checkOutStr = searchParams.get('checkOut');
  const roomId = searchParams.get('room');
  const price = searchParams.get('price');
  
  const checkIn = checkInStr ? new Date(checkInStr) : null;
  const checkOut = checkOutStr ? new Date(checkOutStr) : null;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });
  
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, '');
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    setFormData(prev => ({ ...prev, cardNumber: value }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setFormData(prev => ({ ...prev, cardExpiry: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsProcessing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Оплата успешна!",
      description: "Ваше бронирование подтверждено. Детали отправлены на email.",
    });
    
    setTimeout(() => {
      navigate('/hotel');
    }, 2000);
  };

  if (!checkIn || !checkOut || !roomId || !price) {
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Оплата бронирования</h2>
            <p className="text-muted-foreground">Введите данные для завершения бронирования</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Icon name="User" size={20} className="text-primary" />
                    Контактные данные
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Полное имя</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="Иван Иванов"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="ivan@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Телефон</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+7 (999) 123-45-67"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Icon name="CreditCard" size={20} className="text-primary" />
                    Данные карты
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Номер карты</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardExpiry">Срок действия</Label>
                        <Input
                          id="cardExpiry"
                          name="cardExpiry"
                          placeholder="MM/YY"
                          value={formData.cardExpiry}
                          onChange={handleExpiryChange}
                          maxLength={5}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardCvv">CVV</Label>
                        <Input
                          id="cardCvv"
                          name="cardCvv"
                          type="password"
                          placeholder="123"
                          value={formData.cardCvv}
                          onChange={handleInputChange}
                          maxLength={3}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Обработка...
                    </>
                  ) : (
                    <>
                      <Icon name="Lock" className="mr-2" />
                      Оплатить {Number(price).toLocaleString()} ₽
                    </>
                  )}
                </Button>
              </form>
            </div>

            <div className="space-y-4">
              <Card className="p-6 sticky top-24">
                <h3 className="text-lg font-bold mb-4">Детали бронирования</h3>
                
                <div className="space-y-4">
                  <div className="pb-4 border-b">
                    <div className="text-sm text-muted-foreground mb-1">Номер</div>
                    <div className="font-medium">№ {roomId}</div>
                  </div>

                  <div className="pb-4 border-b">
                    <div className="text-sm text-muted-foreground mb-2">Даты проживания</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Icon name="Calendar" size={14} />
                        <span>{format(checkIn, 'dd MMM yyyy', { locale: ru })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="ArrowRight" size={14} />
                        <span>{format(checkOut, 'dd MMM yyyy', { locale: ru })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-sm text-muted-foreground mb-1">Итого</div>
                    <div className="text-2xl font-bold text-primary">
                      {Number(price).toLocaleString()} ₽
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-muted/50">
                <div className="flex gap-3">
                  <Icon name="Shield" size={20} className="text-primary flex-shrink-0 mt-1" />
                  <div className="text-sm text-muted-foreground">
                    Ваши данные защищены с помощью 256-битного шифрования SSL
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

export default Payment;
