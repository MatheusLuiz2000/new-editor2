import React, { useState, useEffect, useRef } from 'react';
import { ComponentProps } from '../types';

interface TextComponentProps {
  id: string;
  text: string;
  type: 'heading' | 'paragraph';
  isSelected?: boolean;
  showInvalidDropIndicator?: boolean;
  onUpdateProps: (id: string, props: Partial<ComponentProps>) => void;
}

export function TextComponent({
  id,
  text,
  type,
  isSelected,
  showInvalidDropIndicator,
  onUpdateProps,
}: TextComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  console.log("isEditing", isEditing)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isEditing &&
        wrapperRef.current && 
        !wrapperRef.current.contains(event.target as Node)
      ) {
        handleSave();
      }
    }

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      editRef.current.textContent = text;
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(editRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing, text]);

  const handleSave = () => {
    if (!editRef.current) return;

    console.log("save")
    
    const newText = editRef.current.textContent || '';
    if (newText.trim() !== text) {
      onUpdateProps(id, { text: newText.trim() });
    }
    
    if (editRef.current) {
      editRef.current.blur();
      window.getSelection()?.removeAllRanges();
    }

    console.log("here")
    
    setIsEditing(false);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("SET10")
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      if (editRef.current) {
        editRef.current.textContent = text;
        editRef.current.blur();
        window.getSelection()?.removeAllRanges();
      }
      setIsEditing(false);
    }
  };

  const baseClassName = type === 'heading' 
    ? 'text-2xl font-bold text-yellow-600'
    : 'text-gray-600';

  const Component = type === 'heading' ? 'h2' : 'p';
  return (
    <div ref={wrapperRef} className="relative">
      {isEditing ? (
        <div
          ref={editRef}
          contentEditable
          suppressContentEditableWarning
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
      ) : (
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
      )}
    </div>
  );
} 
