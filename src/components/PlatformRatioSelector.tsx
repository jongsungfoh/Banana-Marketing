'use client';

import { useState, useMemo } from 'react';
import { PLATFORM_PRESETS, PlatformPreset, getAvailablePlatforms, getRatiosByPlatform, getPlatformPresets } from '@/utils/platformPresets';

interface PlatformRatioSelectorProps {
  onPresetSelect: (preset: PlatformPreset) => void;
  currentPreset?: PlatformPreset;
}

export default function PlatformRatioSelector({ onPresetSelect, currentPreset }: PlatformRatioSelectorProps) {
  const [selectedRatio, setSelectedRatio] = useState<string>('1:1');
  const [isOpen, setIsOpen] = useState(false);

  const allRatios = useMemo(() => {
    const presets = getPlatformPresets();
    const ratioSet = new Set<string>();
    presets.forEach(preset => ratioSet.add(preset.ratio));
    return Array.from(ratioSet).sort();
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

  const availablePresets = useMemo(() => {
    if (!selectedRatio) return [];
    return getPlatformPresets().filter(preset => preset.ratio === selectedRatio);
  }, [selectedRatio]);

  const ratioCategoriesList = [
    { name: 'Landscape', ratios: ratioCategories.landscape },
    { name: 'Square',    ratios: ratioCategories.square },
    { name: 'Portrait',  ratios: ratioCategories.portrait },
    { name: 'Flexible',  ratios: ratioCategories.flexible }
  ];



  const handleRatioChange = (ratio: string) => {
    setSelectedRatio(ratio);
  };

  const handlePresetSelect = (preset: PlatformPreset) => {
    onPresetSelect(preset);
    setIsOpen(false);
    setSelectedRatio(preset.ratio);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm min-w-0 max-w-sm"
      >
        <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex-shrink-0" />
        <div className="min-w-0 flex-1 text-left">
          <div className="text-sm font-medium text-gray-700 truncate">
            {selectedRatio || 'Ratio'}
          </div>
        </div>
        <svg className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          <div className="p-3">
            {/* 比例选择 */}
            <div className="space-y-2">
              {ratioCategoriesList.map((category) => (
                category.ratios.length > 0 && (
                  <div key={category.name}>
                    <div className="text-xs font-medium text-gray-600 mb-1">{category.name}</div>
                    <div className="flex flex-wrap gap-1">
                      {category.ratios.map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => handleRatioChange(ratio)}
                          className={`px-2 py-1 text-xs rounded-md transition-colors min-w-0 ${
                            selectedRatio === ratio
                              ? 'bg-green-100 text-green-700 border border-green-300'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span className="block truncate">{ratio}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}