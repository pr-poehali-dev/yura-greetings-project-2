import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Booking {
  id: number;
  room_id: number;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  check_in: string;
  check_out: string;
  total_price: number;
  status: string;
  room_number?: string;
  category?: string;
  floor_number?: number;
}

interface BookingsListProps {
  bookings: Booking[];
  loading: boolean;
  onRefresh: () => void;
}

const BookingsList = ({ bookings, loading, onRefresh }: BookingsListProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Бронирования</h2>
        <Button onClick={onRefresh} disabled={loading}>
          <Icon name="RefreshCw" size={16} className="mr-2" />
          Обновить
        </Button>
      </div>

      {bookings.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Нет активных бронирований</p>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <Card key={booking.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon name="User" size={16} />
                    <span className="font-semibold">{booking.guest_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Mail" size={14} />
                    {booking.guest_email}
                  </div>
                  {booking.guest_phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Phone" size={14} />
                      {booking.guest_phone}
                    </div>
                  )}
                </div>
                <div className="text-right space-y-1">
                  <div className="font-semibold">
                    Номер {booking.room_number} ({booking.floor_number} этаж)
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {booking.category}
                  </div>
                  <div className="text-sm font-medium">
                    {booking.total_price} ₽
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-muted-foreground">Заезд:</span>{' '}
                    <span className="font-medium">{new Date(booking.check_in).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Выезд:</span>{' '}
                    <span className="font-medium">{new Date(booking.check_out).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status === 'confirmed' ? 'Подтверждено' :
                     booking.status === 'pending' ? 'Ожидает' : booking.status}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};

export default BookingsList;
