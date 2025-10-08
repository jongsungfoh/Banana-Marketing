'use client';

import { Suspense, useState, useEffect } from 'react';
import Header from '@/components/Header';
import AdCreativeCanvasReactFlow from '@/components/AdCreativeCanvasReactFlow';
import { motion } from 'framer-motion';

function EditorContent() {
  const [showQrModal, setShowQrModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en-us' | 'zh-cn'>('en-us');

  // 监听QR码弹窗事件
  useEffect(() => {
    const handleShowQrModal = () => setShowQrModal(true);
    const handleShowApiInfoModal = () => setShowApiModal(true);
    
    window.addEventListener('showQrModal', handleShowQrModal);
    window.addEventListener('showApiInfoModal', handleShowApiInfoModal);
    
    // 监听语言变化
    const handleLanguageChange = (e: CustomEvent) => {
      setCurrentLanguage(e.detail);
    };
    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    
    // 获取初始语言
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as 'en-us' | 'zh-cn' | null;
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
      }
    }
    
    return () => {
      window.removeEventListener('showQrModal', handleShowQrModal);
      window.removeEventListener('showApiInfoModal', handleShowApiInfoModal);
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);

  const t = {
    'en-us': {
      touchNGoTitle: 'Touch N Go Payment',
      qrCodeInstruction: 'If you like it, you can leave a tip and share your thoughts.',
      closeButton: 'Close',
      apiInfoTitle: 'API Information',
      apiInfoInstruction: 'Please use your Gemini API key to enable AI features. You can get the API key from Google AI Studio or log in directly at ai.dev.',
      apiInfoClose: 'Close'
    },
    'zh-cn': {
      touchNGoTitle: 'Touch N Go 支付',
      qrCodeInstruction: '如果你喜欢，可以打赏留言，留下你的心得。',
      closeButton: '关闭',
      apiInfoTitle: 'API 信息',
      apiInfoInstruction: '请使用您的Gemini API密钥来启用AI功能。您可以在Google AI Studio或直接登录ai.dev获取API密钥。',
      apiInfoClose: '关闭'
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--neu-bg)' }}>
      <Header />
      
      {/* Full Width Canvas */}
      <section className="h-[calc(100vh-64px)]">
        <AdCreativeCanvasReactFlow />
      </section>

      {/* Touch N Go QR Code Modal - 现在在主内容区域 */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <motion.div
            className="bg-white rounded-xl p-4 shadow-2xl max-w-md mx-4 my-8"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">{t[currentLanguage].touchNGoTitle}</h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold transition-colors duration-200"
              >
                ×
              </button>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 mb-3 flex items-center justify-center">
                {/* QR Code Image */}
                <img 
                  src="/QR.jpg" 
                  alt="Touch N Go QR Code" 
                  className="w-40 h-40 object-contain rounded-lg shadow-lg border-2 border-blue-200"
                />
              </div>
              
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {t[currentLanguage].qrCodeInstruction}
              </p>
              
              <button
                onClick={() => setShowQrModal(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
              >
                {t[currentLanguage].closeButton}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* API Information Modal */}
      {showApiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <motion.div
            className="bg-white rounded-xl p-4 shadow-2xl max-w-md mx-4 my-8"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">{t[currentLanguage].apiInfoTitle}</h3>
              <button
                onClick={() => setShowApiModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold transition-colors duration-200"
              >
                ×
              </button>
            </div>
            
            <div className="text-center">
              <div className="rounded-lg p-2 mb-3">
                {/* API Image */}
                <img 
                  src="/api.jpg" 
                  alt="API Information" 
                  className="w-full h-auto object-contain rounded border border-gray-200"
                />
              </div>
              
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {t[currentLanguage].apiInfoInstruction}
              </p>
              
              <button
                onClick={() => setShowApiModal(false)}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium text-sm"
              >
                {t[currentLanguage].apiInfoClose}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}

function EditorLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--neu-bg)' }}>
      <div className="text-center">
        <div className="w-4 h-4 bg-banana-500 rounded-full mx-auto mb-4 animate-pulse"></div>
        <p className="text-gray-600">载入编辑器...</p>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<EditorLoading />}>
      <EditorContent />
    </Suspense>
  );
}
