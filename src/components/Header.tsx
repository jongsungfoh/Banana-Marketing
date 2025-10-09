'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LanguageIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { geminiModelSwitcher, showModelSwitchNotification } from '@/utils/geminiModelSwitcher'

interface HeaderProps {
  onBananaClick?: () => void;
  onLoadClick?: () => void;
  onAddProductClick?: () => void;
  onSaveClick?: () => void;
  onMergeImagesClick?: () => void;
  onPlatformSizeClick?: () => void;
  onShowQrModal?: () => void;
  onShowApiModal?: () => void;
  showMobileControls?: boolean;
}

export default function Header({ 
  onBananaClick,
  onLoadClick,
  onAddProductClick,
  onSaveClick,
  onMergeImagesClick,
  onPlatformSizeClick,
  showMobileControls = true
}: HeaderProps) {
  const [apiKey, setApiKey] = useState<string>('')
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<'en-us' | 'zh-cn'>('en-us')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [currentModel, setCurrentModel] = useState(geminiModelSwitcher.getCurrentModel())

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

      // Subscribe to model changes
      const unsubscribe = geminiModelSwitcher.subscribe((model) => {
        setCurrentModel(model);
      });

      // Listen for API Key modal events from toolbar
      const handleShowApiKeyModal = () => {
        setShowApiKey(true);
      };
      
      window.addEventListener('showApiKeyModal', handleShowApiKeyModal);
      
      return () => {
        window.removeEventListener('showApiKeyModal', handleShowApiKeyModal);
        unsubscribe();
      };
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

  // 模型切换
  const handleModelSwitch = () => {
    const newModel = geminiModelSwitcher.switchToNextModel();
    showModelSwitchNotification(newModel);
  }

  // 处理香蕉点击（结合KFC功能和模型切换）
  const handleBananaClickCombined = () => {
    // 调用原始的KFC功能
    if (onBananaClick) {
      onBananaClick();
    }
    // 同时切换模型
    handleModelSwitch();
  }

  const t = {
    'en-us': {
      apiKeyPlaceholder: 'Enter your Gemini API Key',
      showKey: 'Show',
      hideKey: 'Hide',
      touchNGoTitle: 'Touch N Go Payment',
      qrCodeInstruction: 'If you like it, you can leave a tip and share your thoughts.',
      closeButton: 'Close'
    },
    'zh-cn': {
      apiKeyPlaceholder: '输入您的 Gemini API Key',
      showKey: '显示',
      hideKey: '隐藏',
      touchNGoTitle: 'Touch N Go 支付',
      qrCodeInstruction: '如果你喜欢，可以打赏留言，留下你的心得。',
      closeButton: '关闭'
    }
  }

  return (
    <header className="glass sticky top-0 z-50 border-b border-white/20">
      <div className="w-full px-6">
        <div className="flex items-center justify-between h-16 max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 overflow-x-auto min-w-max scrollbar-hide">
          {/* Left Side - Logo */}
          <motion.div 
              className="flex items-center space-x-3 cursor-pointer min-w-max"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onClick={handleBananaClickCombined}
              title={`Current model: ${currentModel} (click to switch)`}
            >
              <div className="relative">
                <span className="text-3xl animate-float select-none">🍌</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-banana-400 to-banana-500 rounded-full animate-pulse"></div>
              </div>
              <div className="relative max-md:hidden">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold gradient-text">Banana Marketing</h1>
                </div>
                <p className="text-xs text-gray-500 opacity-30 mt-1">
                  Powered by The Pocket Company
                </p>
              </div>
            </motion.div>

          {/* Desktop Navigation - Always show desktop layout */}
          <div className="flex items-center gap-3 min-w-max">
            {/* Logo - Left side */}
            <motion.a
              href={currentLanguage === 'en-us' ? 'https://lushcloud.ai/request?lang=en' : 'https://lushcloud.ai/request?lang=zh'}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 shadow-lg border border-gray-200 p-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              title="Lush Cloud AI"
            >
              <img 
                src="/logo only bimi.svg" 
                alt="Lush Cloud AI" 
                className="w-full h-full object-contain rounded-lg"
              />
            </motion.a>

            {/* Touch N Go Button */}
            <motion.button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('showQrModal'));
                }
              }}
              className="flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 shadow-lg border border-gray-200 p-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Touch N Go Payment"
            >
              <img 
                src="/Touch_'n_Go_eWallet_logo.svg" 
                alt="Touch N Go" 
                className="w-full h-full object-contain rounded-lg"
              />
            </motion.button>
            
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
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-banana-500 focus:border-transparent w-48 sm:w-64 md:w-80 pr-16"
              />
              <button
                onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
              >
                {isApiKeyVisible ? t[currentLanguage].hideKey : t[currentLanguage].showKey}
              </button>

            </div>
          </div>

          {/* Mobile Hamburger Button - Hidden to force desktop mode */}
          <div className="hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu - Hidden to force desktop mode */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="hidden border-t border-gray-200 py-4"
            >
              <div className="flex flex-col space-y-3">
                {/* Mobile Control Buttons */}
                {showMobileControls && (
                  <div className="space-y-2 pb-3 border-b border-gray-100">
                    <button
                      onClick={() => {
                        handleModelSwitch()
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-all duration-200 font-medium shadow-lg"
                      title={`Current model: ${currentModel} (click to switch)`}
                    >
                      🍌 Banana Marketing
                    </button>
                    <button
                      onClick={() => {
                        onLoadClick?.()
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md transition-colors duration-200 text-left"
                    >
                      📁 {currentLanguage === 'en-us' ? 'Load' : '加载'}
                    </button>
                    <button
                      onClick={() => {
                        onAddProductClick?.()
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full px-3 py-2 text-sm bg-green-50 hover:bg-green-100 text-green-700 rounded-md transition-colors duration-200 text-left"
                    >
                      ➕ {currentLanguage === 'en-us' ? 'Add' : '添加'}
                    </button>
                    <button
                      onClick={() => {
                        onSaveClick?.()
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors duration-200 text-left"
                    >
                      💾 {currentLanguage === 'en-us' ? 'Save' : '保存'}
                    </button>
                    <button
                      onClick={() => {
                        onMergeImagesClick?.()
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full px-3 py-2 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md transition-colors duration-200 text-left"
                    >
                      🖼️ {currentLanguage === 'en-us' ? 'Merge' : '合并'}
                    </button>
                    <button
                      onClick={() => {
                        onPlatformSizeClick?.()
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full px-3 py-2 text-sm bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-md transition-colors duration-200 text-left"
                    >
                      📐 {currentLanguage === 'en-us' ? 'Platform & Size' : '平台与尺寸'}
                    </button>
                  </div>
                )}

                {/* Language Toggle */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    toggleLanguage()
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <LanguageIcon className="h-4 w-4" />
                  <span>{currentLanguage === 'en-us' ? '中文' : 'English'}</span>
                </motion.button>

                {/* API Key Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowApiKey(!showApiKey)
                    setIsMobileMenuOpen(false)
                  }}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors text-left"
                >
                  🔑 API Key
                </motion.button>

                {/* Touch N Go Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('showQrModal'));
                    }
                    setIsMobileMenuOpen(false)
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-md hover:from-blue-600 hover:to-purple-700 transition-colors"
                >
                  Touch N Go
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


    </header>
  )
}