import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Room } from './types';

interface RoomOverlayProps {
  room: Room;
  onEdit: (room: Room) => void;
  onBoundsEdit: (room: Room) => void;
  onDelete: (roomId: string) => void;
}

export default function RoomOverlay({ room, onEdit, onBoundsEdit, onDelete }: RoomOverlayProps) {
  return (
    <div
      className="absolute group cursor-pointer"
      style={{
        left: `${room.position.x}%`,
        top: `${room.position.y}%`,
        width: `${room.position.width}%`,
        height: `${room.position.height}%`
      }}
      onClick={(e) => {
        e.stopPropagation();
        onEdit(room);
      }}
    >
      {room.polygon ? (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <polygon
            points={room.polygon.map(p => 
              `${((p.x - room.position.x) / room.position.width) * 100},${((p.y - room.position.y) / room.position.height) * 100}`
            ).join(' ')}
            className="fill-primary/30 stroke-primary stroke-[2]"
          />
        </svg>
      ) : (
        <div className="w-full h-full bg-primary/30 border-2 border-primary rounded-lg" />
      )}
      
      <div className="absolute inset-0 flex items-center justify-center hover:bg-primary/10 transition-colors">
        <span className="text-lg font-bold text-white drop-shadow-lg">
          {room.number}
        </span>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 pointer-events-auto">
        <Button
          size="icon"
          variant="default"
          className="h-8 w-8 shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(room);
          }}
        >
          <Icon name="Edit" size={16} />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            onBoundsEdit(room);
          }}
        >
          <Icon name="Move" size={16} />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          className="h-8 w-8 shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(room.id);
          }}
        >
          <Icon name="Trash2" size={16} />
        </Button>
      </div>
    </div>
  );
}
