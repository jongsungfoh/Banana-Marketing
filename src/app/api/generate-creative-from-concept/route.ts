import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt_data, 
      product_image_path, 
      generated_image_path,
      size = '1:1',
      language = 'zh',
      api_key 
    } = body;

    if (!api_key) {
      return NextResponse.json({ error: '需要提供 API Key' }, { status: 400 });
    }

    if (!prompt_data?.prompt) {
      return NextResponse.json({ error: '缺少提示詞' }, { status: 400 });
    }

    // 使用用户提供的 API Key
    const genAI = new GoogleGenerativeAI(api_key);
    
    // 使用 Gemini 2.5 Flash Image Preview 进行圖片生成
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-image-preview"
    });

    const { concept, prompt } = prompt_data;

    // 载入圖片的通用函数（从 base64 URL）
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

    // 载入产品圖片（如果有）
    const productImagePart = await loadImagePart(product_image_path, 'product');
    
    // 载入生成圖片（如果有）
    const generatedImagePart = await loadImagePart(generated_image_path, 'generated');

    // 建立圖片生成提示詞
    const fullPrompt = `Create a professional advertising image: ${prompt}
High-resolution, studio-lit product photograph with professional lighting setup.
Ultra-realistic commercial photography style with sharp focus and clean composition.
Product prominently displayed with attention to detail and visual impact.
${size === '1:1' ? 'Square format' : size === '16:9' ? 'Landscape format' : size === '9:16' ? 'Portrait format' : 'Format: ' + size}`;

    console.log('🎨 Generating image with prompt:', fullPrompt);

    // 準備内容
    const content: any[] = [];
    
    // 按順序添加圖片
    if (productImagePart) {
      content.push(productImagePart);
    }
    
    if (generatedImagePart) {
      content.push(generatedImagePart);
    }
    
    // 最后添加文字提示詞
    content.push({ text: fullPrompt });

    // 生成圖片
    const result = await model.generateContent(content);
    
    // 处理响应
    const response = await result.response;
    
    // 檢查回应
    if (!response || !response.candidates || response.candidates.length === 0) {
      console.error('❌ API 沒有返回有效的回应');
      return NextResponse.json({ 
        error: 'API 沒有返回有效的回应',
        details: 'No candidates in response'
      }, { status: 500 });
    }

    const candidate = response.candidates[0];
    const candidateAny = candidate as any;
    const parts = candidate.content?.parts || candidateAny.parts || [];

    console.log('🔍 回应結構:', {
      candidates: response.candidates.length,
      parts: parts.length,
      partsTypes: parts.map((part: any) => {
        if (part.text) return 'text';
        if (part.inlineData) return 'image';
        return 'unknown';
      })
    });

    // 尋找圖片回应
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

    console.log('✅ 成功生成圖片');
    
    return NextResponse.json({
      success: true,
      image_url: `data:${imageMimeType};base64,${imageBytes}`,
      concept: concept,
      prompt: prompt
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
