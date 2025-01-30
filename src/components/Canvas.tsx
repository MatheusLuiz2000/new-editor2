// components/Canvas.jsx
import { useDroppable } from '@dnd-kit/core';
import { PageComponent, DeviceType, ComponentProps } from '../types';
import { DroppableArea } from './DroppableArea';

interface CanvasProps {
  components: PageComponent[];
  selectedComponent: string | null;
  onSelectComponent: (id: string | null) => void;
  onDropPositionChange: (position: DropPosition) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  currentDevice: DeviceType;
  onUpdateProps: (id: string, props: Partial<ComponentProps>) => void;
}

function Canvas({
  components,
  selectedComponent,
  onSelectComponent,
  onDropPositionChange,
  onDuplicate,
  onDelete,
  currentDevice,
  onUpdateProps,
}: CanvasProps) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: 'canvas',
  });

  const isDraggingNew = active?.id.toString().startsWith('tool-');

  return (
    <div
      ref={setNodeRef}
      className="flex-1 p-4 bg-gray-100 overflow-auto"
    >
      <DroppableArea
        components={components}
        selectedComponent={selectedComponent}
        onSelectComponent={onSelectComponent}
        onDropPositionChange={onDropPositionChange}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onUpdateProps={onUpdateProps}
      />
      {isDraggingNew && components.length === 0 && isOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-gray-400 text-lg">
            Drop here to add component
          </div>
        </div>
      )}
    </div>
  );
}

export default Canvas;
