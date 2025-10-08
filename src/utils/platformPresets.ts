// 平台预设配置
export interface PlatformPreset {
  platform: 'instagram' | 'facebook' | 'google' | 'linkedin' | 'others' | 'custom';
  name: string;
  ratio: '1:1' | '16:9' | '9:16' | '4:5' | '21:9' | '4:3' | '3:2' | '5:4' | '3:4' | '2:3';
  width: number;
  height: number;
  description: string;
}

export const PLATFORM_PRESETS: PlatformPreset[] = [
  // Instagram 预设
  {
    platform: 'instagram',
    name: 'Instagram Post',
    ratio: '1:1',
    width: 1080,
    height: 1080,
    description: 'Instagram 正方形帖子'
  },
  {
    platform: 'instagram',
    name: 'Instagram Story',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    description: 'Instagram 故事'
  },
  {
    platform: 'instagram',
    name: 'Instagram Reel',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    description: 'Instagram Reels'
  },
  {
    platform: 'instagram',
    name: 'Instagram Portrait',
    ratio: '4:5',
    width: 1080,
    height: 1350,
    description: 'Instagram 竖版帖子'
  },
  
  // Facebook 预设
  {
    platform: 'facebook',
    name: 'Facebook Post',
    ratio: '1:1',
    width: 1200,
    height: 1200,
    description: 'Facebook 正方形帖子'
  },
  {
    platform: 'facebook',
    name: 'Facebook Cover',
    ratio: '16:9',
    width: 1640,
    height: 859,
    description: 'Facebook 封面照片'
  },
  {
    platform: 'facebook',
    name: 'Facebook Story',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    description: 'Facebook 故事'
  },
  
  // Google 预设
  {
    platform: 'google',
    name: 'Google Display',
    ratio: '16:9',
    width: 1200,
    height: 628,
    description: 'Google 展示广告'
  },
  {
    platform: 'google',
    name: 'Google Square',
    ratio: '1:1',
    width: 1200,
    height: 1200,
    description: 'Google 正方形广告'
  },
  {
    platform: 'google',
    name: 'Google Vertical',
    ratio: '4:5',
    width: 1200,
    height: 1500,
    description: 'Google 竖版广告'
  },
  
  // LinkedIn 预设
  {
    platform: 'linkedin',
    name: 'LinkedIn Post',
    ratio: '1:1',
    width: 1200,
    height: 1200,
    description: 'LinkedIn 帖子'
  },
  {
    platform: 'linkedin',
    name: 'LinkedIn Cover',
    ratio: '16:9',
    width: 1584,
    height: 396,
    description: 'LinkedIn 封面照片'
  },
  {
    platform: 'linkedin',
    name: 'LinkedIn Article',
    ratio: '16:9',
    width: 1200,
    height: 644,
    description: 'LinkedIn 文章封面'
  },

  // Others - Additional aspect ratios
  {
    platform: 'others',
    name: 'Ultra Wide (21:9)',
    ratio: '21:9',
    width: 2520,
    height: 1080,
    description: 'Ultra wide landscape format'
  },
  {
    platform: 'others',
    name: 'Classic TV (4:3)',
    ratio: '4:3',
    width: 1440,
    height: 1080,
    description: 'Classic television format'
  },
  {
    platform: 'others',
    name: 'Photo (3:2)',
    ratio: '3:2',
    width: 1800,
    height: 1200,
    description: 'Standard photo format'
  },
  {
    platform: 'others',
    name: 'Portrait Wide (5:4)',
    ratio: '5:4',
    width: 1350,
    height: 1080,
    description: 'Wide portrait format'
  },
  {
    platform: 'others',
    name: 'Square (1:1)',
    ratio: '1:1',
    width: 1200,
    height: 1200,
    description: 'Perfect square format'
  },
  {
    platform: 'others',
    name: 'Mobile Portrait (9:16)',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    description: 'Mobile portrait format'
  },
  {
    platform: 'others',
    name: 'Portrait Classic (3:4)',
    ratio: '3:4',
    width: 1080,
    height: 1440,
    description: 'Classic portrait format'
  },
  {
    platform: 'others',
    name: 'Portrait Tall (2:3)',
    ratio: '2:3',
    width: 1080,
    height: 1620,
    description: 'Tall portrait format'
  },
  {
    platform: 'others',
    name: 'Flexible Wide (5:4)',
    ratio: '5:4',
    width: 1500,
    height: 1200,
    description: 'Flexible wide format'
  },
  {
    platform: 'others',
    name: 'Flexible Tall (4:5)',
    ratio: '4:5',
    width: 1200,
    height: 1500,
    description: 'Flexible tall format'
  }
];

// 根据平台和比例获取预设
export function getPlatformPresets(platform?: string, ratio?: string): PlatformPreset[] {
  if (!platform && !ratio) {
    return PLATFORM_PRESETS;
  }
  
  return PLATFORM_PRESETS.filter(preset => {
    if (platform && preset.platform !== platform) return false;
    if (ratio && preset.ratio !== ratio) return false;
    return true;
  });
}

// 根据名称获取预设
export function getPresetByName(name: string): PlatformPreset | undefined {
  return PLATFORM_PRESETS.find(preset => preset.name === name);
}

// 获取所有可用平台
export function getAvailablePlatforms(): string[] {
  return Array.from(new Set(PLATFORM_PRESETS.map(preset => preset.platform)));
}

// 获取指定平台的所有比例
export function getRatiosByPlatform(platform: string): string[] {
  const ratios = PLATFORM_PRESETS
    .filter(preset => preset.platform === platform)
    .map(preset => preset.ratio);
  return Array.from(new Set(ratios));
}

// 计算比例值
export function calculateRatioValue(ratio: string): number {
  const [width, height] = ratio.split(':').map(Number);
  return width / height;
}

// 根据目标尺寸计算缩放比例
export function calculateScale(
  originalWidth: number,
  originalHeight: number,
  targetWidth: number,
  targetHeight: number
): number {
  const widthScale = targetWidth / originalWidth;
  const heightScale = targetHeight / originalHeight;
  return Math.min(widthScale, heightScale);
}