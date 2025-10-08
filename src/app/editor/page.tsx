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
