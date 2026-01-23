import { useState, useRef } from 'react';
import DraggablePoint from './DraggablePoint';

interface Room {
  id: number;
  room_number: string;
  floor_id: number;
  position_x: number;
  position_y: number;
  width?: number;
  height?: number;
  polygon?: Array<{x: number, y: number}>;
  category: string;
  price: number;
  status: string;
}

interface Floor {
  id: number;
  floor_number: number;
  plan_image_url: string | null;
  rooms: Room[];
}

interface FloorCanvasProps {
  currentFloorData: Floor;
  isDrawing: boolean;
  drawMode: 'polygon' | 'area';
  polygonPoints: Array<{x: number, y: number}>;
  editingRoomBorders: number | null;
  editPolygonPoints: Array<{x: number, y: number}>;
  selectedRoomId?: number | null;
  areaStart?: {x: number, y: number} | null;
  areaEnd?: {x: number, y: number} | null;
  scale: number;
  translateX: number;
  translateY: number;
  isDragging: boolean;
  imageDimensions: { width: number; height: number };
  onCanvasClick: (x: number, y: number) => void;
  onRoomClick: (room: Room, e: React.MouseEvent) => void;
  onEditPointDrag: (index: number, newX: number, newY: number) => void;
  onAddEditPoint: (afterIndex: number, x: number, y: number) => void;
  onDeleteEditPoint: (index: number) => void;
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>, scale?: number, translateX?: number, translateY?: number) => void;
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>, scale?: number, translateX?: number, translateY?: number) => void;
  onMouseUp?: () => void;
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  onMouseDownDrag: (e: React.MouseEvent) => void;
  onMouseMoveDrag: (e: React.MouseEvent) => void;
  onMouseUpDrag: (e?: React.MouseEvent) => void;
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const FloorCanvas = ({
  currentFloorData,
  isDrawing,
  drawMode,
  polygonPoints,
  editingRoomBorders,
  editPolygonPoints,
  selectedRoomId,
  areaStart = null,
  areaEnd = null,
  scale,
  translateX,
  translateY,
  isDragging,
  imageDimensions,
  onCanvasClick,
  onRoomClick,
  onEditPointDrag,
  onAddEditPoint,
  onDeleteEditPoint,
  onMouseMove,
  onMouseDown,
  onMouseUp,
  onWheel,
  onMouseDownDrag,
  onMouseMoveDrag,
  onMouseUpDrag,
  onImageLoad
}: FloorCanvasProps) => {
  const [hoveredRoomId, setHoveredRoomId] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <div
      className="relative border-2 border-dashed rounded-lg overflow-hidden"
      style={{ 
        minHeight: '600px', 
        cursor: isDragging 
          ? 'grabbing'
          : isDrawing 
            ? 'crosshair'
            : editingRoomBorders ? 'move' : scale > 1 && drawMode !== 'area' ? 'grab' : drawMode === 'area' ? 'crosshair' : 'default' 
      }}
      onWheel={onWheel}
    >
      <div
        style={{
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
          transformOrigin: 'top left',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
        onClick={editingRoomBorders ? undefined : (drawMode === 'area' ? undefined : (e) => {
          if (!imgRef.current) return;
          const rect = imgRef.current.getBoundingClientRect();
          const rawX = e.clientX - rect.left;
          const rawY = e.clientY - rect.top;
          const scaledX = rawX / scale;
          const scaledY = rawY / scale;
          onCanvasClick(scaledX, scaledY);
        })}
        onMouseMove={(e) => {
          if (drawMode === 'area' && onMouseMove) {
            onMouseMove(e, scale, translateX, translateY);
            return;
          }
          if (isDragging) {
            onMouseMoveDrag(e);
          }
        }}
        onMouseDown={(e) => {
          if (drawMode === 'area' && onMouseDown) {
            onMouseDown(e, scale, translateX, translateY);
            return;
          }
          if (!editingRoomBorders && scale > 1) {
            onMouseDownDrag(e);
          }
        }}
        onMouseUp={(e) => {
          if (drawMode === 'area' && onMouseUp) {
            onMouseUp();
            return;
          }
          if (isDragging) {
            onMouseUpDrag(e);
          }
        }}
        onMouseLeave={() => {
          if (isDragging) onMouseUpDrag();
        }}
      >
        <img
          ref={imgRef}
          src={currentFloorData.plan_image_url!}
          alt={`План ${currentFloorData.floor_number} этажа`}
          className="w-full h-auto pointer-events-none select-none"
          draggable="false"
          onLoad={onImageLoad}
        />
      
        {currentFloorData.rooms.map(room => {
          const color = room.status === 'available' ? '#22c55e' :
                       room.status === 'occupied' ? '#ef4444' : '#f59e0b';
          const isSelected = selectedRoomId === room.id;
          
          if (room.polygon && room.polygon.length > 0) {
            return null;
          }
          
          const isHovered = hoveredRoomId === room.id;
          
          return (
            <div
              key={room.id}
              className="absolute rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-all"
              style={{
                left: `${room.position_x}px`,
                top: `${room.position_y}px`,
                width: `${room.width || 60}px`,
                height: `${room.height || 40}px`,
                backgroundColor: color,
                color: 'white',
                opacity: isSelected ? 1 : isHovered ? 0.95 : 0.8,
                border: isSelected ? '3px solid white' : isHovered ? '2px solid white' : 'none',
                boxShadow: isSelected 
                  ? '0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.4)' 
                  : isHovered ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                zIndex: isSelected ? 10 : isHovered ? 5 : 1
              }}
              onClick={(e) => onRoomClick(room, e)}
              onMouseEnter={() => setHoveredRoomId(room.id)}
              onMouseLeave={() => setHoveredRoomId(null)}
              title={`${room.room_number} - ${room.category}`}
            >
              {room.room_number}
            </div>
          );
        })}
        
        <svg 
          className="absolute top-0 left-0" 
          width={imageDimensions.width}
          height={imageDimensions.height}
          style={{ pointerEvents: editingRoomBorders ? 'all' : 'none' }}
        >
          {currentFloorData.rooms.map(room => {
            const color = room.status === 'available' ? '#22c55e' :
                         room.status === 'occupied' ? '#ef4444' : '#f59e0b';
            const isSelected = selectedRoomId === room.id;
            const isHovered = hoveredRoomId === room.id;
            
            if (room.polygon && room.polygon.length > 0) {
              const points = room.polygon.map(p => `${p.x},${p.y}`).join(' ');
              const centerX = room.polygon.reduce((sum, p) => sum + p.x, 0) / room.polygon.length;
              const centerY = room.polygon.reduce((sum, p) => sum + p.y, 0) / room.polygon.length;
              
              return (
                <g 
                  key={room.id} 
                  style={{ pointerEvents: isDrawing ? 'none' : 'all', cursor: isDrawing ? 'default' : 'pointer' }} 
                  onClick={(e) => onRoomClick(room, e as any)}
                  onMouseEnter={() => !isDrawing && setHoveredRoomId(room.id)}
                  onMouseLeave={() => setHoveredRoomId(null)}
                >
                  <polygon
                    points={points}
                    fill={color}
                    fillOpacity={isSelected ? "0.7" : isHovered ? "0.55" : "0.4"}
                    stroke={color}
                    strokeWidth="2"
                    className="transition-all"
                  />
                  {isSelected && (
                    <>
                      <polygon
                        points={points}
                        fill="none"
                        stroke="white"
                        strokeWidth="5"
                        strokeDasharray="10,5"
                        style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.9))' }}
                      />
                      <polygon
                        points={points}
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        opacity="0.6"
                      />
                    </>
                  )}
                  {isHovered && !isSelected && (
                    <polygon
                      points={points}
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      opacity="0.7"
                      style={{ filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.5))' }}
                    />
                  )}
                  <text
                    x={centerX}
                    y={centerY}
                    fill="white"
                    fontSize={isSelected ? "15" : isHovered ? "13" : "12"}
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ 
                      pointerEvents: 'none', 
                      userSelect: 'none', 
                      filter: isSelected ? 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.9))' : isHovered ? 'drop-shadow(0 0 3px rgba(0, 0, 0, 0.7))' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {room.room_number}
                  </text>
                </g>
              );
            }
            
            return null;
          })}
          
          {drawMode === 'polygon' && polygonPoints.length > 0 && (
            <>
              <polyline
                points={polygonPoints.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              {polygonPoints.map((point, i) => (
                <circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#3b82f6"
                />
              ))}
            </>
          )}
          
          {drawMode === 'area' && areaStart && areaEnd && (
            <rect
              x={Math.min(areaStart.x, areaEnd.x)}
              y={Math.min(areaStart.y, areaEnd.y)}
              width={Math.abs(areaEnd.x - areaStart.x)}
              height={Math.abs(areaEnd.y - areaStart.y)}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,5"
              style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' }}
            />
          )}
          
          {editingRoomBorders && editPolygonPoints.length > 0 && (
            <>
              <polygon
                points={editPolygonPoints.map(p => `${p.x},${p.y}`).join(' ')}
                fill="#3b82f6"
                fillOpacity="0.2"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeDasharray="8,4"
              />
              
              {editPolygonPoints.map((point, i) => {
                const nextPoint = editPolygonPoints[(i + 1) % editPolygonPoints.length];
                const midX = (point.x + nextPoint.x) / 2;
                const midY = (point.y + nextPoint.y) / 2;
                
                return (
                  <g key={`edge-${i}`}>
                    <line
                      x1={point.x}
                      y1={point.y}
                      x2={nextPoint.x}
                      y2={nextPoint.y}
                      stroke="#3b82f6"
                      strokeWidth="2"
                    />
                    <circle
                      cx={midX}
                      cy={midY}
                      r="6"
                      fill="#10b981"
                      stroke="white"
                      strokeWidth="2"
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddEditPoint(i, midX, midY);
                      }}
                    />
                  </g>
                );
              })}
              
              {editPolygonPoints.map((point, i) => (
                <DraggablePoint
                  key={`point-${i}`}
                  x={point.x}
                  y={point.y}
                  index={i}
                  onDrag={onEditPointDrag}
                  onDelete={onDeleteEditPoint}
                  scale={scale}
                  translateX={translateX}
                  translateY={translateY}
                />
              ))}
            </>
          )}
        </svg>
      </div>
    </div>
  );
};

export default FloorCanvas;
