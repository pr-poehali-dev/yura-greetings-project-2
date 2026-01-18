export interface Room {
  id: string;
  number: string;
  type: string;
  area: number;
  rooms: number;
  capacity: number;
  price: number;
  available: boolean;
  position: { x: number; y: number; width: number; height: number };
  views: string[];
  amenities: string[];
  bedTypes?: string[];
  polygon?: { x: number; y: number }[];
}

export interface Floor {
  id: string;
  number: string;
  planImage: string;
  rooms: Room[];
}
