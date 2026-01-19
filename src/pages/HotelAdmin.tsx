import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const HotelAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    login: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (credentials.login === 'admin' && credentials.password === 'ivan2024') {
      localStorage.setItem('hotel_admin_auth', 'true');
      toast({
        title: "Вход выполнен",
        description: "Добро пожаловать в панель управления",
      });
      navigate('/hotel/dashboard');
    } else {
      toast({
        title: "Ошибка входа",
        description: "Неверный логин или пароль",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="Hotel" size={40} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">IVAN HOTEL</h1>
          <p className="text-muted-foreground">Панель администратора</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Логин</label>
            <div className="relative">
              <Icon name="User" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={credentials.login}
                onChange={(e) => setCredentials({ ...credentials, login: e.target.value })}
                className="pl-10"
                placeholder="Введите логин"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Пароль</label>
            <div className="relative">
              <Icon name="Lock" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="pl-10"
                placeholder="Введите пароль"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Вход...
              </>
            ) : (
              <>
                <Icon name="LogIn" size={18} className="mr-2" />
                Войти
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t text-center">
          <Button variant="ghost" onClick={() => navigate('/hotel')} className="text-sm">
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Вернуться на сайт отеля
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default HotelAdmin;
