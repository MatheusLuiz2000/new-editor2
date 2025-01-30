import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { PageComponent, ComponentProps } from '../types';
import { RenderComponent } from './RenderComponent';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ComponentActions } from './ComponentActions';

interface DroppableAreaProps {
  components: PageComponent[];
  selectedComponent: string | null;
  onSelectComponent: (id: string | null) => void;
  level?: number;
  parentId?: string;
  onDropPositionChange: (position: DropPosition) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateProps: (id: string, props: Partial<ComponentProps>) => void;
}

export function DroppableArea({
  components,
  selectedComponent,
  onSelectComponent,
  level = 0,
  parentId,
  onDropPositionChange,
  onDuplicate,
  onDelete,
  onUpdateProps,
}: DroppableAreaProps) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: parentId || 'canvas',
  });

  const maxNestingLevel = 3;
  const canNest = level < maxNestingLevel;
  const isDraggingNew = active?.id.toString().startsWith('tool-');

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[50px]
        ${level > 0 ? 'ml-4' : ''}
        ${!canNest ? 'cursor-no-drop' : ''}
        relative
        touch-none
      `}
    >
      {/* Initial drop zone */}
      {isDraggingNew && (
        <div 
          className="h-2 -mt-1 group"
          data-droppable="true"
        >
          <div className="h-1 group-hover:bg-blue-500 rounded transition-colors" />
        </div>
      )}

      <SortableContext
        items={components.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        {components.map((component, index) => (
          <React.Fragment key={component.id}>
            <SortableComponent
              component={component}
              isSelected={component.id === selectedComponent}
              onSelect={() => onSelectComponent(component.id)}
              level={level}
              canNest={canNest}
              isDraggingNew={isDraggingNew}
              onDropPositionChange={onDropPositionChange}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onUpdateProps={onUpdateProps}
            >
              {component.type === 'container' && canNest && (
                <DroppableArea
                  components={component.children || []}
                  selectedComponent={selectedComponent}
                  onSelectComponent={onSelectComponent}
                  level={level + 1}
                  parentId={component.id}
                  onDropPositionChange={onDropPositionChange}
                  onDuplicate={onDuplicate}
                  onDelete={onDelete}
                  onUpdateProps={onUpdateProps}
                />
              )}
            </SortableComponent>
            
            {/* Drop zone between components */}
            {isDraggingNew && (
              <div 
                className="h-2 group"
                data-droppable="true"
              >
                <div className="h-1 group-hover:bg-blue-500 rounded transition-colors" />
              </div>
            )}
          </React.Fragment>
        ))}
      </SortableContext>
    </div>
  );
}

interface SortableComponentProps {
  component: PageComponent;
  isSelected: boolean;
  onSelect: () => void;
  level: number;
  canNest: boolean;
  isDraggingNew: boolean;
  children?: React.ReactNode;
  onDropPositionChange: (position: DropPosition) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateProps: (id: string, props: Partial<ComponentProps>) => void;
}

function SortableComponent({
  component,
  isSelected,
  onSelect,
  level,
  canNest,
  isDraggingNew,
  children,
  onDropPositionChange,
  onDuplicate,
  onDelete,
  onUpdateProps,
}: SortableComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    over,
  } = useSortable({
    id: component.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isContainer = component.type === 'container';
  const isDirectlyOver = over?.id === component.id;

  // Get mouse position relative to the component to determine top/bottom indicator
  const [dropPosition, setDropPosition] = React.useState<'top' | 'bottom' | null>(null);

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDraggingNew || !isDirectlyOver) {
      setDropPosition(null);
      onDropPositionChange(null);
      return;
    }

    const element = document.getElementById(component.id);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const isTopHalf = relativeY < rect.height / 2;
    const newPosition = isTopHalf ? 'top' : 'bottom';
    
    setDropPosition(newPosition);
    onDropPositionChange({ id: component.id, position: newPosition });
  }, [isDraggingNew, isDirectlyOver, component.id, onDropPositionChange]);

  React.useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Show container highlight when hovering over container without a specific drop position
  const showContainerHighlight = isDraggingNew && isDirectlyOver && isContainer && !dropPosition;
  // Show invalid state when trying to nest in a non-container
  const showInvalidDropIndicator = isDraggingNew && isDirectlyOver && !isContainer;

  return (
    <div className="relative mb-2">
      <div
        id={component.id}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`
          ${isContainer ? 'bg-white rounded-lg p-4 border border-gray-200' : ''}
          ${isDragging ? 'opacity-75' : 'opacity-100'}
          ${isSelected ? 'ring-2 ring-blue-500' : ''}
          ${showContainerHighlight ? 'ring-2 ring-blue-400' : ''}
          ${showInvalidDropIndicator ? 'ring-2 ring-red-400' : ''}
          relative
          w-full
          transition-all
          duration-150
          cursor-move
          rounded-lg
          ${!isContainer && 'p-2'}
          select-none
          group
        `}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {isSelected && (
          <ComponentActions
            onDuplicate={() => onDuplicate(component.id)}
            onDelete={() => onDelete(component.id)}
          />
        )}
        {/* Top drop indicator */}
        {isDraggingNew && isDirectlyOver && dropPosition === 'top' && (
          <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
        )}

        <RenderComponent
          component={component}
          isSelected={isSelected}
          canNest={canNest && isContainer}
          isDirectlyOver={isDirectlyOver}
          showInvalidDropIndicator={showInvalidDropIndicator}
          onUpdateProps={onUpdateProps}
        />
        {children}

        {/* Bottom drop indicator */}
        {isDraggingNew && isDirectlyOver && dropPosition === 'bottom' && (
          <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
        )}
      </div>
    </div>
  );
} 
