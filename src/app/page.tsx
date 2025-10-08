'use client';

import { useState, useEffect, Suspense } from 'react';
import AdCreativeCanvasReactFlow from '@/components/AdCreativeCanvasReactFlow';
import Header from '@/components/Header';
import { useSearchParams } from 'next/navigation';

function HomeContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');
  const [apiKey, setApiKey] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en-us' | 'zh-cn'>('en-us');
  const [bananaClickCount, setBananaClickCount] = useState(0);
  const [showKnowledgeGraphButton, setShowKnowledgeGraphButton] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedApiKey = localStorage.getItem('gemini_api_key');
      if (savedApiKey) {
        setApiKey(savedApiKey);
      } else {
        setShowApiKeyInput(true);
      }
      
      // Set up modal event listeners
      const handleShowQrModal = () => setShowQrModal(true);
      const handleShowApiInfoModal = () => setShowApiModal(true);
      const handleShowApiKeyForm = () => setShowApiKeyForm(true);
      
      // Listen for API key changes from Header component
      const handleApiKeyChange = (event: CustomEvent) => {
        const newApiKey = event.detail;
        setApiKey(newApiKey);
        if (!newApiKey) {
          // If API key is cleared, show the form overlay
          setShowApiKeyForm(true);
        }
      };
      
      window.addEventListener('showQrModal', handleShowQrModal);
      window.addEventListener('showApiInfoModal', handleShowApiInfoModal);
      window.addEventListener('showApiKeyForm', handleShowApiKeyForm);
      window.addEventListener('apiKeyChange', handleApiKeyChange as EventListener);
      
      // Get initial language
      const savedLanguage = localStorage.getItem('language') as 'en-us' | 'zh-cn' | null;
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
      }
      
      // Listen for language changes
      const handleLanguageChange = (event: CustomEvent) => {
        setCurrentLanguage(event.detail);
      };
      
      window.addEventListener('languageChange', handleLanguageChange as EventListener);
      
      return () => {
        window.removeEventListener('showQrModal', handleShowQrModal);
        window.removeEventListener('showApiInfoModal', handleShowApiInfoModal);
        window.removeEventListener('showApiKeyForm', handleShowApiKeyForm);
        window.removeEventListener('apiKeyChange', handleApiKeyChange as EventListener);
        window.removeEventListener('languageChange', handleLanguageChange as EventListener);
      };
    }
  }, []);

  const handleApiKeySave = (key: string) => {
    setApiKey(key);
    setShowApiKeyInput(false);
  };

  // Handle banana click for KFC knowledge graph
  const handleBananaClick = () => {
    const newCount = bananaClickCount + 1;
    setBananaClickCount(newCount);
    
    if (newCount >= 5) {
      setShowKnowledgeGraphButton(true);
      setBananaClickCount(0);
    }
  };

  const t = {
    'en-us': {
      touchNGoTitle: 'Touch N Go Payment',
      qrCodeInstruction: 'If you like it, you can leave a tip and share your thoughts.',
      closeButton: 'Close',
      apiInfoTitle: 'API Information',
      apiInfoInstruction: 'Please use your Gemini API key to enable AI features. You can get the API key from Google AI Studio or log in directly at ai.dev',
      apiInfoClose: 'Close',
      apiKeyRequired: 'API Key Required',
      apiKeyDescription: 'Please enter your Gemini API key to start using AI features. You can get your API key from Google AI Studio.',
      enterApiKey: 'Enter API Key',
      startUsing: 'Start Using',
      learnMoreAboutApiKey: 'Learn More About API Key',
      pleaseEnterApiKeyInHeader: 'Please enter your Gemini API key in the header to enable AI features',
      dontHaveApiKey: "Don't have an API key?",
      getOneHere: 'Get one here',
      loading: 'Loading...'
    },
    'zh-cn': {
      touchNGoTitle: 'Touch N Go 支付',
      qrCodeInstruction: '如果你喜欢，可以打赏留言，留下你的心得。',
      closeButton: '关闭',
      apiInfoTitle: 'API 信息',
      apiInfoInstruction: '请使用您的 Gemini API 密钥来启用 AI 功能。您可以从 Google AI Studio 获取 API 密钥或直接登录 ai.dev',
      apiInfoClose: '关闭',
      apiKeyRequired: '需要 API 密钥',
      apiKeyDescription: '请输入您的 Gemini API 密钥以开始使用 AI 功能。您可以从 Google AI Studio 获取 API 密钥。',
      enterApiKey: '输入 API 密钥',
      startUsing: '开始使用',
      learnMoreAboutApiKey: '了解更多关于 API 密钥',
      pleaseEnterApiKeyInHeader: '请在顶部输入您的 Gemini API 密钥以启用 AI 功能',
      dontHaveApiKey: '没有 API 密钥？',
      getOneHere: '点击这里获取',
      loading: '加载中...'
    }
  };

  if (showApiKeyInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome!</h1>
              <p className="text-gray-600 mb-6">
                Ready to create amazing image creatives with AI?
              </p>
            </div>
            <button
              onClick={() => {
                setShowApiKeyInput(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Let's start
            </button>
            <p className="text-sm text-gray-500 mt-4 text-center">
              {t[currentLanguage].dontHaveApiKey} <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{t[currentLanguage].getOneHere}</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Header 
        onBananaClick={handleBananaClick}
        onShowQrModal={() => setShowQrModal(true)}
        onShowApiModal={() => setShowApiModal(true)}
      />
      

      
      {/* API Key Form Overlay - Top layer above upload field */}
      {showApiKeyForm && !apiKey && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center border border-gray-200 relative">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter Your API Key</h2>
              <p className="text-gray-600 mb-6">
                Please enter your Gemini API key to start creating amazing image creatives with AI.
              </p>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter your Gemini API key"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    localStorage.setItem('gemini_api_key', e.currentTarget.value.trim());
                    window.location.reload();
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Enter your Gemini API key"]') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    localStorage.setItem('gemini_api_key', input.value.trim());
                    window.location.reload();
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Creating
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4 text-center">
              {t[currentLanguage].dontHaveApiKey} <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{t[currentLanguage].getOneHere}</a>
            </p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative">
        
        {/* API Info Button - moved from header to main content area */}
        {!apiKey && (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setShowApiModal(true)}
              className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              title="API Information"
            >
              !
            </button>
          </div>
        )}
        
        <AdCreativeCanvasReactFlow 
          projectId={projectId} 
          showKnowledgeGraphButton={showKnowledgeGraphButton}
        />
      </div>
      
      {/* Touch N Go QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-4 shadow-2xl max-w-md mx-4 my-8">
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
          </div>
        </div>
      )}
      
      {/* API Information Modal */}
      {showApiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-4 shadow-2xl max-w-md mx-4 my-8">
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
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-2 px-4 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
              >
                {t[currentLanguage].apiInfoClose}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-600">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
