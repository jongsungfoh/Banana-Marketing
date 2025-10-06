'use client';

import React, { useState, useEffect } from 'react';
import { KeyIcon } from '@heroicons/react/24/outline';

export default function ApiKeyInput() {
  const [apiKey, setApiKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempKey, setTempKey] = useState('');

  useEffect(() => {
    // 从 localStorage 读取 API Key
    const savedKey = localStorage.getItem('gemini_api_key') || '';
    setApiKey(savedKey);
    setTempKey(savedKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', tempKey);
    setApiKey(tempKey);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempKey(apiKey);
    setIsEditing(false);
  };

  const maskApiKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  };

  return (
    <div className="flex items-center gap-2">
      {!isEditing ? (
        <>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            <KeyIcon className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700 font-mono">
              {apiKey ? maskApiKey(apiKey) : 'No API Key'}
            </span>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-2 text-sm font-medium text-banana-600 hover:text-banana-700 hover:bg-banana-50 rounded-lg transition-colors"
          >
            {apiKey ? '编辑' : '设置'}
          </button>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            placeholder="输入 Gemini API Key"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-banana-500 text-sm font-mono"
            style={{ width: '280px' }}
          />
          <button
            onClick={handleSave}
            className="px-3 py-2 bg-banana-500 text-white text-sm font-medium rounded-lg hover:bg-banana-600 transition-colors"
          >
            保存
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
}
