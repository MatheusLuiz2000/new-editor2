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
import { useState, useEffect } from 'react';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import Toolbox from './components/Toolbox';
import Canvas from './components/Canvas';
import { PageComponent, ComponentType, ComponentProps } from './types';
import { RenderComponent } from './components/RenderComponent';
import { useHistory } from './hooks/useHistory';
import { DevicePreview, DeviceType } from './components/DevicePreview';

// Add this type at the top with other imports
type DropPosition = {
  id: string;
  position: 'top' | 'bottom';
} | null;

function App() {
  const {
    state: components,
    setState: setComponents,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<PageComponent[]>([]);

  console.log("oi", {
    state: components,
    setState: setComponents,
    undo,
    redo,
    canUndo,
    canRedo,
    components
  })

  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [lastOverId, setLastOverId] = useState<string | null>(null);
  const [currentDropPosition, setCurrentDropPosition] = useState<DropPosition>(null);
  const [currentDevice, setCurrentDevice] = useState<DeviceType>('desktop');

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

  // Add keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          // Cmd/Ctrl + Shift + Z = Redo
          if (canRedo) {
            e.preventDefault();
            redo();
          }
        } else {
          // Cmd/Ctrl + Z = Undo
          if (canUndo) {
            e.preventDefault();
            undo();
          }
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        // Cmd/Ctrl + Y = Redo (alternative)
        if (canRedo) {
          e.preventDefault();
          redo();
        }
      }

      if (selectedComponent) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          handleDelete(selectedComponent);
        } else if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
          e.preventDefault();
          handleDuplicate(selectedComponent);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponent, canUndo, canRedo, undo, redo]);

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

      setComponents((prev) => {
        if (overId === 'canvas') {
          return [...prev, newComponent];
        }

        // Find the target component
        const overComponent = prev.find(c => c.id === overId);
        if (!overComponent) return prev;

        // If it's a container and we're not at a specific drop position, nest inside
        if (overComponent.type === 'container' && !currentDropPosition) {
          return prev.map(item => {
            if (item.id === overId) {
              return {
                ...item,
                children: [...(item.children || []), newComponent],
              };
            }
            return item;
          });
        }

        // Otherwise, handle top/bottom insertion
        const overIndex = prev.findIndex(c => c.id === overId);
        if (overIndex === -1) return prev;

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

  const handleDuplicate = (id: string) => {
    setComponents((prev) => {
      const componentToDuplicate = prev.find(c => c.id === id);
      if (!componentToDuplicate) return prev;

      const duplicatedComponent: PageComponent = {
        ...componentToDuplicate,
        id: `component-${Date.now()}`,
        children: componentToDuplicate.children ? [...componentToDuplicate.children] : [],
      };

      const index = prev.findIndex(c => c.id === id);
      const newComponents = [...prev];
      newComponents.splice(index + 1, 0, duplicatedComponent);
      return newComponents;
    });
  };

  const handleDelete = (id: string) => {
    setComponents((prev) => prev.filter(c => c.id !== id));
    setSelectedComponent(null);
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
        <div className="flex-1 flex flex-col">
          {/* Add toolbar with undo/redo buttons */}
          <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={undo}
                disabled={!canUndo}
                className={`
                  p-2 rounded hover:bg-gray-100 
                  ${!canUndo ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                title="Undo (Ctrl+Z)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className={`
                  p-2 rounded hover:bg-gray-100
                  ${!canRedo ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                title="Redo (Ctrl+Shift+Z)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
              </button>
            </div>
            <DevicePreview
              currentDevice={currentDevice}
              onDeviceChange={setCurrentDevice}
            />
          </div>
          
          {/* Canvas container with improved transitions */}
          <div className="flex-1 bg-gray-100 overflow-hidden">
            <div className={`
              h-full w-full
              flex items-start justify-center
              transition-all duration-300 ease-in-out
              ${currentDevice === 'desktop' ? 'p-0' : 'p-4'}
            `}>
              <div 
                className={`
                  bg-white
                  shadow-lg
                  overflow-auto
                  h-full
                  origin-top
                  transition-[width,margin] duration-300 ease-in-out
                  ${currentDevice === 'desktop' ? 'w-full m-0' : ''}
                  ${currentDevice === 'tablet' ? 'w-[768px]' : ''}
                  ${currentDevice === 'mobile' ? 'w-[375px]' : ''}
                `}
                style={{
                  maxWidth: '100%',
                  minHeight: currentDevice === 'desktop' ? '100%' : 'auto'
                }}
              >
                <SortableContext items={components.map(c => c.id)}>
                  <Canvas
                    components={components}
                    selectedComponent={selectedComponent}
                    onSelectComponent={setSelectedComponent}
                    onDropPositionChange={setCurrentDropPosition}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                    currentDevice={currentDevice}
                  />
                </SortableContext>
              </div>
            </div>
          </div>
        </div>
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
