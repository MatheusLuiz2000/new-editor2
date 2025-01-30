import React from 'react';
import { PageComponent } from '../types';

interface RenderComponentProps {
  component: PageComponent;
  isSelected?: boolean;
  canNest?: boolean;
  isDirectlyOver?: boolean;
  showInvalidDropIndicator?: boolean;
  isDragging?: boolean;
}

export function RenderComponent({ 
  component, 
  isSelected, 
  showInvalidDropIndicator 
}: RenderComponentProps) {
  switch (component.type) {
    case 'container':
      return null; // Container is just a wrapper now, no title or text needed
    case 'heading':
      return (
        <h2 className={`
          text-2xl 
          font-bold 
          text-yellow-600 
          ${showInvalidDropIndicator ? 'text-red-500' : ''}
        `}>
          {component.props.text}
        </h2>
      );
    case 'paragraph':
      return (
        <p className="text-gray-600">
          {component.props.text}
        </p>
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
