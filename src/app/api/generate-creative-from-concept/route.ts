import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt_data, 
      product_image_path, 
      generated_image_path,
      size = '1:1',
      platform = 'instagram',
      preset,
      language = 'zh',
      api_key 
    } = body;

    if (!api_key) {
      return NextResponse.json({ error: '需要提供 API Key' }, { status: 400 });
    }

    if (!prompt_data?.prompt) {
      return NextResponse.json({ error: '缺少提示词' }, { status: 400 });
    }

    // 使用新 SDK 生成图片
    const ai = new GoogleGenAI({ apiKey: api_key });

    const { concept, prompt } = prompt_data;

    // 载入图片的通用函数（从 base64 URL）
    const loadImagePart = async (imagePath: string, imageType: string) => {
      if (!imagePath) return null;
      
      try {
        // 如果是 base64 data URL
        if (imagePath.startsWith('data:')) {
          const base64Data = imagePath.split(',')[1];
          const mimeType = imagePath.match(/data:([^;]+);/)?.[1] || 'image/png';
          
          return {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          };
        }
        
        return null;
      } catch (error) {
        console.error(`Failed to load ${imageType} image`, error);
        return null;
      }
    };

    // 载入产品图片（如果有）
    const productImagePart = await loadImagePart(product_image_path, 'product');
    
    // 载入生成图片（如果有）
    const generatedImagePart = await loadImagePart(generated_image_path, 'generated');

    // 建立图片生成提示词，包含平台和预设信息
    const platformInfo = preset ? `${preset.name} (${platform})` : `${platform} (${size})`;
    const formatInfo = size === '1:1' ? 'Square format' : 
                      size === '16:9' ? 'Landscape format' : 
                      size === '9:16' ? 'Portrait format' : 
                      size === '4:5' ? 'Portrait 4:5 format' : `Format: ${size}`;
    
    const fullPrompt = `Create a professional advertising image for ${platformInfo}: ${prompt}
High-resolution, studio-lit product photograph with professional lighting setup.
Ultra-realistic commercial photography style with sharp focus and clean composition.
Product prominently displayed with attention to detail and visual impact.
${formatInfo}. 
Aspect ratio: ${size} (important: maintain this exact aspect ratio).
Optimized for ${platform} platform specifications and best practices.`;

    console.log('🎨 Generating image with prompt:', fullPrompt);
    console.log('📐 Aspect ratio configuration:', size);

    // 准备内容
    const content: any[] = [];
    
    // 按顺序添加图片
    if (productImagePart) {
      content.push(productImagePart);
    }
    
    if (generatedImagePart) {
      content.push(generatedImagePart);
    }
    
    // 最后添加文字提示词
    content.push({ text: fullPrompt });

    // 生成图片 - 使用新 SDK 语法
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: content,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: size
        }
      }
    });
    
    // 处理响应 - 新 SDK 结构
    if (!result.candidates || result.candidates.length === 0) {
      console.error('❌ API 没有返回有效的回应');
      return NextResponse.json({ 
        error: 'API 没有返回有效的回应',
        details: 'No candidates in response'
      }, { status: 500 });
    }

    const candidate = result.candidates[0];
    const parts = candidate.content?.parts || [];

    console.log('🔍 回应结构:', {
      candidates: result.candidates.length,
      parts: parts.length,
      partsTypes: parts.map((part: any) => {
        if (part.text) return 'text';
        if (part.inlineData) return 'image';
        return 'unknown';
      })
    });

    // 寻找图片回应
    const imagePart = parts.find((part: any) => part.inlineData);
    
    if (!imagePart || !imagePart.inlineData || !imagePart.inlineData.data) {
      // 寻找文字回应作为错误信息
      const textParts = parts.filter((part: any) => part.text);
      const responseText = textParts.length > 0 ? textParts.map((part: any) => part.text).join(' ') : '没有生成图片';
      console.error('❌ 没有生成图片，AI回应:', responseText);
      return NextResponse.json(
        { error: '没有生成图片',
        details: responseText
      }, { status: 500 });
    }

    const imageBytes = imagePart.inlineData.data;
    const imageMimeType = imagePart.inlineData.mimeType || 'image/png';

    console.log('✅ 成功生成图片');
    
    return NextResponse.json({
      success: true,
      image_url: `data:${imageMimeType};base64,${imageBytes}`,
      concept: concept,
      prompt: prompt,
      platform: platform,
      size: size,
      preset: preset
    });

  } catch (error) {
    console.error('生成圖片时发生错误:', error);
    return NextResponse.json(
      { 
        error: '生成圖片时发生错误',
        details: (error as Error)?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
