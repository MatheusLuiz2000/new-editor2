import React from 'react';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface DevicePreviewProps {
  currentDevice: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
}

export function DevicePreview({ currentDevice, onDeviceChange }: DevicePreviewProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b">
      <button
        onClick={() => onDeviceChange('desktop')}
        className={`p-2 rounded transition-colors ${
          currentDevice === 'desktop' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
        }`}
        title="Desktop view (1024px+)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>
      <button
        onClick={() => onDeviceChange('tablet')}
        className={`p-2 rounded transition-colors ${
          currentDevice === 'tablet' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
        }`}
        title="Tablet view (768px)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </button>
      <button
        onClick={() => onDeviceChange('mobile')}
        className={`p-2 rounded transition-colors ${
          currentDevice === 'mobile' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
        }`}
        title="Mobile view (375px)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  );
} 
