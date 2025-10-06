// 平台类型
export type Platform = 'instagram' | 'facebook' | 'google' | 'linkedin';

// 圖片比例
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:5';

// 圖片生成状态
export type ImageStatus = 'generating' | 'completed' | 'failed';

// 圖片生成的提示詞资讯
export interface ImagePrompt {
  concept: string;
  description: string;
  enhanced: string;
  rationale: string;
}

// 生成圖片介面
export interface GeneratedImage {
  imageId: string;
  fileName: string;
  fileUrl: string;
  prompt: ImagePrompt;
  status: ImageStatus;
  error?: string;
}
