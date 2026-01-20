const API_URL = 'https://functions.poehali.dev/96beb1b0-38c2-439f-89b6-c4d4eb2e5584';
const UPLOAD_URL = 'https://functions.poehali.dev/ee36d3e2-3eef-4676-bd45-15b1dfa794e2';

interface Floor {
  id: number;
  floor_number: number;
  plan_image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Room {
  id: number;
  floor_id: number;
  room_number: string;
  category: string;
  price: number;
  position_x: number;
  position_y: number;
  status: string;
  created_at: string;
  updated_at: string;
}

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
  created_at: string;
  updated_at: string;
  room_number?: string;
  category?: string;
  floor_number?: number;
}

export async function getFloors(): Promise<Floor[]> {
  const response = await fetch(API_URL, {
    headers: { 'X-Path': 'floors' }
  });
  return response.json();
}

export async function createFloor(floorNumber: number, imageUrl: string): Promise<Floor> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Path': 'floors'
    },
    body: JSON.stringify({
      floor_number: floorNumber,
      plan_image_url: imageUrl
    })
  });
  return response.json();
}

export async function deleteFloor(floorId: number): Promise<void> {
  await fetch(API_URL, {
    method: 'DELETE',
    headers: {
      'X-Path': 'floors',
      'X-Floor-Id': floorId.toString()
    }
  });
}

export async function uploadImage(file: string, filename: string): Promise<string> {
  const response = await fetch(UPLOAD_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ file, filename })
  });
  const data = await response.json();
  return data.url;
}

export async function updateFloorImage(floorId: number, imageUrl: string): Promise<Floor> {
  const response = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Path': 'floors'
    },
    body: JSON.stringify({
      id: floorId,
      plan_image_url: imageUrl
    })
  });
  return response.json();
}

export async function getRooms(floorId?: number): Promise<Room[]> {
  const headers: Record<string, string> = { 'X-Path': 'rooms' };
  if (floorId) {
    headers['X-Floor-Id'] = floorId.toString();
  }
  const response = await fetch(API_URL, { headers });
  return response.json();
}

export async function createRoom(room: {
  floor_id: number;
  room_number: string;
  category: string;
  price: number;
  position_x: number;
  position_y: number;
  status?: string;
}): Promise<Room> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Path': 'rooms'
    },
    body: JSON.stringify(room)
  });
  return response.json();
}

export async function updateRoom(room: {
  id: number;
  room_number: string;
  category: string;
  price: number;
  position_x: number;
  position_y: number;
  status: string;
}): Promise<Room> {
  const response = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Path': 'rooms'
    },
    body: JSON.stringify(room)
  });
  return response.json();
}

export async function deleteRoom(roomId: number): Promise<void> {
  await fetch(API_URL, {
    method: 'DELETE',
    headers: {
      'X-Path': 'rooms',
      'X-Room-Id': roomId.toString()
    }
  });
}

export async function getBookings(): Promise<Booking[]> {
  const response = await fetch(API_URL, {
    headers: { 'X-Path': 'bookings' }
  });
  return response.json();
}

export async function createBooking(booking: {
  room_id: number;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  check_in: string;
  check_out: string;
  total_price: number;
  status?: string;
}): Promise<Booking> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Path': 'bookings'
    },
    body: JSON.stringify(booking)
  });
  return response.json();
}