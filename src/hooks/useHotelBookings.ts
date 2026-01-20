import { useState } from 'react';
import * as hotelApi from '@/lib/hotelApi';

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

export const useHotelBookings = (toast: any) => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const loadBookings = async () => {
    try {
      const bookingsData = await hotelApi.getBookings();
      setBookings(bookingsData);
    } catch (error) {
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить бронирования",
        variant: "destructive"
      });
      console.error('Error loading bookings:', error);
    }
  };

  return {
    bookings,
    loadBookings
  };
};
