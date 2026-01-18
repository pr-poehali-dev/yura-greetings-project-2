import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPanel() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const storedPassword = localStorage.getItem('admin-password') || 'admin123';

    if (currentPassword !== storedPassword) {
      setError('Неверный текущий пароль');
      return;
    }

    if (newPassword.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    localStorage.setItem('admin-password', newPassword);
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    toast({
      title: 'Пароль изменен',
      description: 'Новый пароль сохранен успешно',
    });
  };

  return (
    <div className="max-w-2xl">
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="Key" size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Изменение пароля</h2>
              <p className="text-sm text-muted-foreground">
                Обновите пароль для доступа к административной панели
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Текущий пароль</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Введите текущий пароль"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Новый пароль</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Минимум 6 символов"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Подтвердите новый пароль</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите новый пароль"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
              <Icon name="AlertCircle" size={16} />
              {error}
            </div>
          )}

          <Button type="submit" className="w-full">
            <Icon name="Check" className="mr-2" size={16} />
            Сохранить новый пароль
          </Button>
        </form>

        <div className="pt-4 border-t space-y-3">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Icon name="Info" size={16} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Рекомендации по безопасности:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Используйте не менее 8 символов</li>
                <li>Комбинируйте буквы, цифры и символы</li>
                <li>Не используйте простые пароли типа "123456"</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
