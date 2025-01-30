import React, { useState, useEffect, useRef } from 'react';
import { PageComponent, DeviceType, ResponsiveValue, ComponentProps } from '../types';
import { TextComponent } from './TextComponent';

interface RenderComponentProps {
  component: PageComponent;
  isSelected?: boolean;
  canNest?: boolean;
  isDirectlyOver?: boolean;
  showInvalidDropIndicator?: boolean;
  isDragging?: boolean;
  currentDevice: DeviceType;
  onUpdateProps: (id: string, props: Partial<ComponentProps>) => void;
}

export function RenderComponent({ 
  component, 
  isSelected, 
  showInvalidDropIndicator,
  currentDevice,
  onUpdateProps,
  ...props
}: RenderComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);

  // Focus and select text when editing starts
  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      editRef.current.textContent = component.props.text;
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(editRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing, component.props.text]);

  const handleSave = () => {
    if (!editRef.current) return;
    
    const newText = editRef.current.textContent || '';
    if (newText.trim() !== component.props.text) {
      onUpdateProps(component.id, { text: newText.trim() });
    }
    setIsEditing(false);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (component.type === 'heading' || component.type === 'paragraph') {
      setIsEditing(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      if (editRef.current) {
        editRef.current.textContent = component.props.text;
      }
    }
  };

  const renderEditableComponent = (
    baseClassName: string,
    text: string
  ) => {
    if (isEditing) {
      return (
        <div
          ref={editRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={`
            ${baseClassName}
            outline-none
            border-b-2 
            border-blue-500 
            focus:border-blue-600
            px-1
            min-w-[50px]
            whitespace-pre-wrap
          `}
        >
          {text}
        </div>
      );
    }

    const Component = component.type === 'heading' ? 'h2' : 'p';
    return (
      <Component
        onDoubleClick={handleDoubleClick}
        className={`
          ${baseClassName}
          ${isSelected ? 'hover:bg-blue-50 rounded px-1' : ''}
          ${showInvalidDropIndicator ? 'text-red-500' : ''}
        `}
      >
        {text}
      </Component>
    );
  };

  const getResponsiveValue = <T,>(values: ResponsiveValue<T>): T => {
    if (currentDevice === 'mobile' && values.mobile !== undefined) {
      return values.mobile;
    }
    if (currentDevice === 'tablet' && values.tablet !== undefined) {
      return values.tablet;
    }
    return values.desktop;
  };

  const getResponsiveStyles = () => {
    if (!component.style) return {};
    
    const styles: Record<string, string> = {};
    Object.entries(component.style).forEach(([property, value]) => {
      if (value) {
        styles[property] = getResponsiveValue(value);
      }
    });
    return styles;
  };

  switch (component.type) {
    case 'container':
      return null;
    case 'heading':
      return (
        <TextComponent
          id={component.id}
          text={component.props.text}
          type="heading"
          isSelected={isSelected}
          showInvalidDropIndicator={showInvalidDropIndicator}
          onUpdateProps={onUpdateProps}
        />
      );
    case 'paragraph':
      return (
        <TextComponent
          id={component.id}
          text={component.props.text}
          type="paragraph"
          isSelected={isSelected}
          showInvalidDropIndicator={showInvalidDropIndicator}
          onUpdateProps={onUpdateProps}
        />
      );
    case 'image':
      return (
        <div className="bg-gray-200 w-full h-32 flex items-center justify-center">
          Image Placeholder
        </div>
      );
    case 'button':
      return (
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          {component.props.text}
        </button>
      );
    default:
      return null;
  }
} 
