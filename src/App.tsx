import { 
  DndContext, 
  DragEndEvent, 
  DragOverEvent,
  DragOverlay, 
  DragStartEvent, 
  MouseSensor, 
  TouchSensor, 
  useSensor, 
  useSensors,
  closestCenter,
  pointerWithin,
  CollisionDetection,
  rectIntersection,
} from '@dnd-kit/core';
import { useState } from 'react';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import Toolbox from './components/Toolbox';
import Canvas from './components/Canvas';
import { PageComponent, ComponentType, ComponentProps } from './types';
import { RenderComponent } from './components/RenderComponent';

// Add this type at the top with other imports
type DropPosition = {
  id: string;
  position: 'top' | 'bottom';
} | null;

function App() {
  const [components, setComponents] = useState<PageComponent[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [lastOverId, setLastOverId] = useState<string | null>(null);
  const [currentDropPosition, setCurrentDropPosition] = useState<DropPosition>(null);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 8,
    },
  });
  
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 100,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
    setLastOverId(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Only allow dropping in containers or canvas
    if (overId !== 'canvas') {
      const overComponent = components.find(c => c.id === overId);
      if (!overComponent || overComponent.type !== 'container') {
        return;
      }
    }

    setLastOverId(overId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setCurrentDropPosition(null);
      return;
    }

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Handle new component from toolbox
    if (activeId.startsWith('tool-')) {
      const type = activeId.replace('tool-', '');
      const newComponent: PageComponent = {
        id: `component-${Date.now()}`,
        type: type as ComponentType,
        props: getDefaultProps(type as ComponentType),
        children: [],
      };

      setComponents(prev => {
        if (overId === 'canvas') {
          return [...prev, newComponent];
        }

        const overIndex = prev.findIndex(c => c.id === overId);
        if (overIndex === -1) return prev;

        // Use the currentDropPosition to determine where to insert
        const insertIndex = currentDropPosition?.position === 'bottom' 
          ? overIndex + 1 
          : overIndex;

        const newComponents = [...prev];
        newComponents.splice(insertIndex, 0, newComponent);
        return newComponents;
      });
    } else {
      // Handle reordering existing components
      if (activeId !== overId) {
        setComponents(prev => {
          const oldIndex = prev.findIndex(c => c.id === activeId);
          const newIndex = prev.findIndex(c => c.id === overId);

          if (oldIndex !== -1 && newIndex !== -1) {
            return arrayMove(prev, oldIndex, newIndex);
          }
          return prev;
        });
      }
    }

    setActiveId(null);
    setCurrentDropPosition(null);
  };

  const collisionDetectionStrategy: CollisionDetection = (args) => {
    // Use closest center for all cases
    return closestCenter(args);
  };

  const getDragOverlay = () => {
    if (!activeId) return null;

    // Simple block overlay for any dragged component
    return (
      <div className="
        w-full 
        h-12 
        bg-blue-100 
        border-2 
        border-blue-300 
        rounded-lg 
        opacity-50 
        pointer-events-none
        flex 
        items-center 
        justify-center
        text-blue-500
        font-medium
      ">
        <span>Drop to place component</span>
      </div>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen">
        <Toolbox />
        <SortableContext items={components.map(c => c.id)}>
          <Canvas
            components={components}
            selectedComponent={selectedComponent}
            onSelectComponent={setSelectedComponent}
            onDropPositionChange={setCurrentDropPosition}
          />
        </SortableContext>
        <DragOverlay dropAnimation={null}>
          {getDragOverlay()}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

function getDefaultProps(type: ComponentType): ComponentProps {
  switch (type) {
    case 'container':
      return { id: '', title: 'Container' };
    case 'heading':
      return { id: '', text: 'New Heading', level: 2 };
    case 'paragraph':
      return { id: '', text: 'New paragraph text' };
    case 'image':
      return { id: '', src: 'https://via.placeholder.com/300x200', alt: 'Placeholder' };
    case 'button':
      return { id: '', text: 'Click me', variant: 'primary' };
  }
}

export default App;
