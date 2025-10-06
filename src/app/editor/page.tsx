'use client';

import { Suspense } from 'react';
import Header from '@/components/Header';
import AdCreativeCanvasReactFlow from '@/components/AdCreativeCanvasReactFlow';

function EditorContent() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--neu-bg)' }}>
      <Header />
      
      {/* Full Width Canvas */}
      <section className="h-[calc(100vh-64px)]">
        <AdCreativeCanvasReactFlow />
      </section>
    </main>
  );
}

function EditorLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--neu-bg)' }}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-banana-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
