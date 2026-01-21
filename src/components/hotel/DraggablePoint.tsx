import { useRef } from 'react';

interface DraggablePointProps {
  x: number;
  y: number;
  index: number;
  onDrag: (index: number, x: number, y: number) => void;
  onDelete: (index: number) => void;
  scale?: number;
  translateX?: number;
  translateY?: number;
}

const DraggablePoint = ({ x, y, index, onDrag, onDelete, scale = 1, translateX = 0, translateY = 0 }: DraggablePointProps) => {
  const isDraggingRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent<SVGCircleElement>) => {
    e.stopPropagation();
    isDraggingRef.current = true;

    const svg = (e.target as SVGElement).ownerSVGElement;
    if (!svg) return;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const rect = svg.getBoundingClientRect();
      const rawX = moveEvent.clientX - rect.left;
      const rawY = moveEvent.clientY - rect.top;
      const newX = (rawX - translateX * scale) / scale;
      const newY = (rawY - translateY * scale) / scale;
      onDrag(index, newX, newY);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <circle
      cx={x}
      cy={y}
      r="8"
      fill="#3b82f6"
      stroke="white"
      strokeWidth="2"
      style={{ cursor: 'move' }}
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(index);
      }}
    />
  );
};

export default DraggablePoint;