// components/Toolbox.jsx
import { useDraggable } from '@dnd-kit/core';
import { ComponentType } from '../types';

const AVAILABLE_COMPONENTS: { type: ComponentType; label: string }[] = [
  { type: 'container', label: 'Container' },
  { type: 'heading', label: 'Heading' },
  { type: 'paragraph', label: 'Paragraph' },
  { type: 'image', label: 'Image' },
  { type: 'button', label: 'Button' },
];

function Toolbox() {
  return (
    <div className="w-64 bg-amber-900 border-r p-4">
      <h2 className="text-lg font-semibold mb-4 text-white">Components</h2>
      <div className="space-y-2">
        {AVAILABLE_COMPONENTS.map((component) => (
          <DraggableItem
            key={component.type}
            type={component.type}
            label={component.label}
          />
        ))}
      </div>
    </div>
  );
}

interface DraggableItemProps {
  type: ComponentType;
  label: string;
}

function DraggableItem({ type, label }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `tool-${type}`,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        p-3 
        bg-blue-800 
        text-white 
        border 
        rounded 
        cursor-move 
        hover:bg-blue-700
        ${isDragging ? 'opacity-100' : ''}
      `}
    >
      {label}
    </div>
  );
}

export default Toolbox;
