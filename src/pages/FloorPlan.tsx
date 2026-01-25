import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const FloorPlan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const checkInStr = searchParams.get('checkIn');
  const checkOutStr = searchParams.get('checkOut');
  const categoryFilter = searchParams.get('category');

  const handleRedirectToAdmin = () => {
    navigate(`/admin/rooms?checkIn=${checkInStr}&checkOut=${checkOutStr}${categoryFilter ? `&category=${categoryFilter}` : ''}`);
  };

  if (!checkInStr || !checkOutStr) {
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
          <h1 className="text-xl font-bold">IVAN HOTEL</h1>
          <div className="w-24" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="p-12 text-center max-w-2xl mx-auto">
          <Icon name="Map" size={64} className="mx-auto mb-6 text-primary" />
          <h2 className="text-3xl font-bold mb-4">Выбор номера на плане</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Для удобства выбора номера на интерактивном плане этажа, перейдите в режим администратора
          </p>
          <Button size="lg" onClick={handleRedirectToAdmin}>
            <Icon name="LayoutDashboard" className="mr-2" size={20} />
            Перейти к выбору номера
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default FloorPlan;