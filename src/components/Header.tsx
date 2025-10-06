'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LanguageIcon } from '@heroicons/react/24/outline'

export default function Header() {
  const [apiKey, setApiKey] = useState<string>('')
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<'en-us' | 'zh-cn'>('en-us')

  // 从 localStorage 读取 API Key
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedApiKey = localStorage.getItem('gemini_api_key');
      if (savedApiKey) {
        setApiKey(savedApiKey);
      }
      
      const savedLanguage = localStorage.getItem('language') as 'en-us' | 'zh-cn' | null;
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
      }
    }
  }, []);

  // 保存 API Key 到 localStorage
  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_api_key', value);
      window.dispatchEvent(new CustomEvent('apiKeyChange', { detail: value }));
    }
  };

  // 语言切换
  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en-us' ? 'zh-cn' : 'en-us';
    setCurrentLanguage(newLanguage);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLanguage);
      window.dispatchEvent(new CustomEvent('languageChange', { detail: newLanguage }));
    }
  }

  const t = {
    'en-us': {
      apiKeyPlaceholder: 'Enter your Gemini API Key',
      showKey: 'Show',
      hideKey: 'Hide'
    },
    'zh-cn': {
      apiKeyPlaceholder: '输入您的 Gemini API Key',
      showKey: '显示',
      hideKey: '隐藏'
    }
  }

  return (
    <header className="glass sticky top-0 z-50 border-b border-white/20">
      <div className="w-full px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <span className="text-3xl animate-float">🍌</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-banana-400 to-banana-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold gradient-text">Banana Marketing</h1>
              </div>
      
            </div>
          </motion.div>

          {/* Right Side - Language, API Key Input */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle Button */}
            <motion.button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:text-banana-600 hover:bg-banana-50 rounded-lg transition-all duration-200"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="切换语言 / Switch Language"
            >
              <LanguageIcon className="h-4 w-4" />
              <span className="font-medium">
                {currentLanguage === 'en-us' ? 'EN' : '中'}
              </span>
            </motion.button>

            {/* API Key Input */}
            <div className="relative">
              <input
                type={isApiKeyVisible ? "text" : "password"}
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder={t[currentLanguage].apiKeyPlaceholder}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-banana-500 focus:border-transparent w-80 pr-16"
              />
              <button
                onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
              >
                {isApiKeyVisible ? t[currentLanguage].hideKey : t[currentLanguage].showKey}
              </button>
            </div>


          </div>
        </div>
      </div>
    </header>
  )
}
