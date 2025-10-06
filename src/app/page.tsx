'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // 立即重定向到编辑器
    router.replace('/editor');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--neu-bg)' }}>
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🍌</div>
        <p className="text-gray-600">载入编辑器...</p>
      </div>
    </div>
  );
}
