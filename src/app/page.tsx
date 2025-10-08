'use client';

import { useState, useEffect, Suspense } from 'react';
import AdCreativeCanvasReactFlow from '@/components/AdCreativeCanvasReactFlow';
import Header from '@/components/Header';
import { useSearchParams } from 'next/navigation';

function HomeContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedApiKey = localStorage.getItem('gemini_api_key');
      if (savedApiKey) {
        setApiKey(savedApiKey);
      } else {
        setShowApiKeyInput(true);
      }
    }
  }, []);

  const handleApiKeySave = (key: string) => {
    setApiKey(key);
    setShowApiKeyInput(false);
  };

  if (showApiKeyInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Banana Marketing</h1>
              <p className="text-gray-600">Please enter your Gemini API key to get started</p>
            </div>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Enter your Gemini API key..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleApiKeySave((e.target as HTMLInputElement).value);
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  if (input.value.trim()) {
                    handleApiKeySave(input.value.trim());
                  }
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Get Started
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Don't have an API key? <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Get one here</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <AdCreativeCanvasReactFlow 
        projectId={projectId} 
        showKnowledgeGraphButton={true}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
