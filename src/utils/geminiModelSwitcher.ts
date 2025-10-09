// Gemini Model Switcher Utility
export const GEMINI_MODELS = {
  FLASH: 'gemini-2.5-flash',
  PRO: 'gemini-2.5-pro', 
  FLASH_LATEST: 'gemini-flash-latest',
  FLASH_LITE_LATEST: 'gemini-flash-lite-latest'
} as const;

export type GeminiModelKey = keyof typeof GEMINI_MODELS;

export const MODEL_CYCLE_ORDER: GeminiModelKey[] = [
  'FLASH',
  'PRO', 
  'FLASH_LATEST',
  'FLASH_LITE_LATEST'
];

export interface ModelInfo {
  key: GeminiModelKey;
  name: string;
  displayName: string;
  description: string;
}

export const MODEL_INFO: Record<GeminiModelKey, ModelInfo> = {
  FLASH: {
    key: 'FLASH',
    name: GEMINI_MODELS.FLASH,
    displayName: 'Gemini 2.5 Flash',
    description: 'Fast and efficient model for general tasks'
  },
  PRO: {
    key: 'PRO', 
    name: GEMINI_MODELS.PRO,
    displayName: 'Gemini 2.5 Pro',
    description: 'Advanced model for complex reasoning tasks'
  },
  FLASH_LATEST: {
    key: 'FLASH_LATEST',
    name: GEMINI_MODELS.FLASH_LATEST,
    displayName: 'Gemini Flash Latest',
    description: 'Latest flash model with newest capabilities'
  },
  FLASH_LITE_LATEST: {
    key: 'FLASH_LITE_LATEST',
    name: GEMINI_MODELS.FLASH_LITE_LATEST,
    displayName: 'Gemini Flash Lite Latest',
    description: 'Lightweight model for quick tasks'
  }
};

export class GeminiModelSwitcher {
  private static instance: GeminiModelSwitcher;
  private currentModelIndex: number = 0;
  private listeners: Set<(model: ModelInfo) => void> = new Set();

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): GeminiModelSwitcher {
    if (!GeminiModelSwitcher.instance) {
      GeminiModelSwitcher.instance = new GeminiModelSwitcher();
    }
    return GeminiModelSwitcher.instance;
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gemini_current_model_index');
      if (saved) {
        const index = parseInt(saved, 10);
        if (index >= 0 && index < MODEL_CYCLE_ORDER.length) {
          this.currentModelIndex = index;
        }
      }
    }
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_current_model_index', this.currentModelIndex.toString());
    }
  }

  getCurrentModel(): ModelInfo {
    const modelKey = MODEL_CYCLE_ORDER[this.currentModelIndex];
    return MODEL_INFO[modelKey];
  }

  getCurrentModelName(): string {
    return this.getCurrentModel().name;
  }

  getCurrentDisplayName(): string {
    return this.getCurrentModel().displayName;
  }

  switchToNextModel(): ModelInfo {
    this.currentModelIndex = (this.currentModelIndex + 1) % MODEL_CYCLE_ORDER.length;
    this.saveToStorage();
    
    const newModel = this.getCurrentModel();
    this.notifyListeners(newModel);
    
    return newModel;
  }

  subscribe(callback: (model: ModelInfo) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(model: ModelInfo): void {
    this.listeners.forEach(callback => callback(model));
  }
}

// Export singleton instance
export const geminiModelSwitcher = GeminiModelSwitcher.getInstance();

// Helper function to get current model for API calls
export const getCurrentGeminiModel = (): string => {
  return geminiModelSwitcher.getCurrentModelName();
};

// Notification utility
export const showModelSwitchNotification = (model: ModelInfo): void => {
  if (typeof window !== 'undefined') {
    // Create a custom notification element
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span class="text-sm font-medium">Switched to ${model.displayName}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
};