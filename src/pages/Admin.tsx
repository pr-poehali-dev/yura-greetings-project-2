import { useState, useEffect } from 'react';
import AdminPanel from '@/components/AdminPanel';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const auth = localStorage.getItem('admin-authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Пароль: admin123 (можно изменить)
    if (password === 'admin123') {
      localStorage.setItem('admin-authenticated', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Неверный пароль');
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="Lock" size={32} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Вход в админ-панель</h2>
            <p className="text-muted-foreground text-sm">
              Введите пароль для доступа к панели управления
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={error ? 'border-destructive' : ''}
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <Icon name="AlertCircle" size={14} />
                  {error}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full">
              <Icon name="LogIn" className="mr-2" size={16} />
              Войти
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return <AdminPanel />;
};

export default Admin;
