'use client';

import { useState, useMemo, useEffect } from 'react';
import { PLATFORM_PRESETS } from '@/utils/platformPresets';

interface PlatformRatioSelectorProps {
  onRatioSelect: (ratio: string, dimensions: {width: number, height: number}) => void;
  currentRatio?: string;
}

export default function PlatformRatioSelector({ onRatioSelect, currentRatio }: PlatformRatioSelectorProps) {
  console.log('🎨 PLATFORMRATIOSELECTOR COMPONENT MOUNTED!');
  console.log('🎨 Props received:', { onRatioSelect, currentRatio });
  
  const [selectedRatio, setSelectedRatio] = useState<string>(currentRatio || '1:1');
  const [isOpen, setIsOpen] = useState(false);

  // Update selected ratio when currentRatio changes
  useEffect(() => {
    console.log('🎨 PlatformRatioSelector: currentRatio changed:', currentRatio);
    console.log('🎨 PlatformRatioSelector: selectedRatio before update:', selectedRatio);
    // Only update if currentRatio is different than currently selected
    if (currentRatio && currentRatio !== selectedRatio) {
      setSelectedRatio(currentRatio);
      console.log('🎨 PlatformRatioSelector: Updated selectedRatio to:', currentRatio);
    }
  }, [currentRatio, selectedRatio]);

  const allRatios = useMemo(() => {
    const uniqueRatios = Array.from(new Set(PLATFORM_PRESETS.map(preset => preset.ratio)));
    return uniqueRatios.sort();
  }, []);

  const ratioCategories = useMemo(() => {
    const categories = {
      landscape: [] as string[],
      square: [] as string[],
      portrait: [] as string[],
      flexible: [] as string[]
    };
    
    allRatios.forEach(ratio => {
      const [width, height] = ratio.split(':').map(Number);
      if (width === height) {
        categories.square.push(ratio);
      } else if (width > height) {
        categories.landscape.push(ratio);
      } else {
        categories.portrait.push(ratio);
      }
    });
    
    return categories;
  }, [allRatios]);

  // Remove platform presets filtering since we only use ratios now
  const availablePresets = useMemo(() => {
    return [];
  }, []);

  const ratioCategoriesList = [
    { name: 'Landscape', ratios: ratioCategories.landscape },
    { name: 'Square',    ratios: ratioCategories.square },
    { name: 'Portrait',  ratios: ratioCategories.portrait },
    { name: 'Flexible',  ratios: ratioCategories.flexible }
  ];



  const handleRatioSelect = (ratio: string) => {
    console.log('🎯 PlatformRatioSelector: handleRatioSelect called with ratio:', ratio);
    setSelectedRatio(ratio);
    
    // Parse ratio to get width and height
    const [widthStr, heightStr] = ratio.split(':');
    const widthRatio = parseInt(widthStr);
    const heightRatio = parseInt(heightStr);
    
    // Calculate dimensions based on ratio (use 1080 as base height for portrait, 1080 as base width for landscape)
    let width: number;
    let height: number;
    
    if (widthRatio === heightRatio) {
      // Square format
      width = 1080;
      height = 1080;
    } else if (widthRatio > heightRatio) {
      // Landscape format - base width on 1080
      width = 1080;
      height = Math.round((1080 * heightRatio) / widthRatio);
    } else {
      // Portrait format - base height on 1080
      height = 1080;
      width = Math.round((1080 * widthRatio) / heightRatio);
    }
    
    console.log('🎯 PlatformRatioSelector: calling onRatioSelect with ratio and dimensions:', ratio, {width, height});
    console.log('🎯 PlatformRatioSelector: onRatioSelect function:', onRatioSelect);
    onRatioSelect(ratio, {width, height});
  };



  // Close modal when clicking outside or pressing Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (isOpen && !target.closest('.ratio-modal') && !target.closest('.ratio-selector-button')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    console.log('🎯 PlatformRatioSelector RENDERING with currentRatio:', currentRatio);
    console.log('🎯 PlatformRatioSelector onRatioSelect prop:', onRatioSelect);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-gray-700">Format:</div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ratio-selector-button"
        >
          <span className="text-sm">
            {selectedRatio || 'Select Ratio'}
          </span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ratio-modal">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Select Ratio</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Select Ratio</h3>
                <div className="grid grid-cols-2 gap-2">
                  {allRatios.map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => handleRatioSelect(ratio)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedRatio === ratio
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium">{ratio}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {ratio === '1:1' && 'Square'}
                        {ratio === '4:5' && 'Portrait'}
                        {ratio === '9:16' && 'Story'}
                        {ratio === '16:9' && 'Landscape'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}