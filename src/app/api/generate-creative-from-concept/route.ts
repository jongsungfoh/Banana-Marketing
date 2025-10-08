import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers });
  }

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
      return NextResponse.json({ error: '需要提供 API Key' }, { status: 400, headers });
    }

    if (!prompt_data?.prompt) {
      return NextResponse.json({ error: '缺少提示词' }, { status: 400, headers });
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

    // 创建空白参考图像（解决aspect ratio bug的workaround）
    const createBlankCanvas = (aspectRatio: string) => {
      // 创建透明PNG作为参考
      const canvasSizes: Record<string, { width: number; height: number }> = {
        '1:1': { width: 512, height: 512 },
        '16:9': { width: 512, height: 288 },
        '21:9': { width: 512, height: 219 },
        '9:16': { width: 288, height: 512 },
        '4:5': { width: 400, height: 500 }
      };
      
      const size = canvasSizes[aspectRatio] || { width: 512, height: 512 };
      
      // 创建透明PNG的base64（1x1像素透明PNG）
      // 这是一个hack：我们创建一个非常小的透明图像，但告诉AI它应该具有目标宽高比
      const transparentPixel = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      return {
        inlineData: {
          data: transparentPixel,
          mimeType: 'image/png'
        }
      };
    };

    // 载入产品图片（如果有）
    const productImagePart = await loadImagePart(product_image_path, 'product');
    
    // 载入生成图片（如果有）
    const generatedImagePart = await loadImagePart(generated_image_path, 'generated');
    
    // 创建空白参考画布（workaround for Google API aspect ratio bug）
    const blankCanvas = createBlankCanvas(size);

    // 建立图片生成提示词，包含平台和预设信息
    const platformInfo = preset ? `${preset.name} (${platform})` : `${platform} (${size})`;
    
    // More explicit format descriptions
    let formatInfo = '';
    let aspectRatioInstruction = '';
    let dimensions = '';
    
    switch (size) {
      case '1:1':
        formatInfo = 'Square format (1:1 ratio)';
        aspectRatioInstruction = 'Create a perfectly square image with equal width and height.';
        dimensions = '1024x1024 pixels';
        break;
      case '16:9':
        formatInfo = 'Widescreen landscape format (16:9 ratio)';
        aspectRatioInstruction = 'Create a wide landscape image that is significantly wider than tall.';
        dimensions = '1920x1080 pixels';
        break;
      case '21:9':
        formatInfo = 'Ultra-wide cinematic format (21:9 ratio)';
        aspectRatioInstruction = 'Create an ultra-wide cinematic image that is very wide and panoramic.';
        dimensions = '2520x1080 pixels';
        break;
      case '9:16':
        formatInfo = 'Portrait format (9:16 ratio)';
        aspectRatioInstruction = 'Create a tall portrait image that is significantly taller than wide.';
        dimensions = '1080x1920 pixels';
        break;
      case '4:5':
        formatInfo = 'Portrait 4:5 format';
        aspectRatioInstruction = 'Create a portrait image that is taller than wide, but not extremely so.';
        dimensions = '1080x1350 pixels';
        break;
      default:
        formatInfo = `Custom format: ${size}`;
        aspectRatioInstruction = `Create an image with ${size} aspect ratio.`;
        dimensions = 'custom dimensions';
    }
    
    const fullPrompt = `Create a professional advertising image for ${platformInfo}: ${prompt}

ABSOLUTELY CRITICAL REQUIREMENT: ${aspectRatioInstruction} The image MUST have exactly ${size} aspect ratio (${dimensions}).
This is the MOST IMPORTANT requirement - failure to generate the correct aspect ratio will result in rejection.
The overall composition should clearly demonstrate the ${formatInfo} proportions.

MANDATORY TECHNICAL SPECIFICATIONS:
- The final image dimensions must be exactly ${dimensions}
- The composition must clearly show ${size} proportions
- Do not crop or letterbox the image
- Fill the entire frame with the content
- Ensure the aspect ratio is visually obvious in the final result
- Use the provided reference image as a template for the exact aspect ratio
- Match the width-to-height ratio of the reference image exactly
- The image should be ${dimensions.split('x')[0]} pixels wide and ${dimensions.split('x')[1]} pixels tall

VERIFICATION CHECKLIST:
Before generating, confirm: Is this image ${dimensions} pixels? 
After generating, verify: Does this image have exactly ${size} proportions?

High-resolution, studio-lit product photograph with professional lighting setup.
Ultra-realistic commercial photography style with sharp focus and clean composition.
Product prominently displayed with attention to detail and visual impact.
${formatInfo} format for optimal ${platform} platform display.
Optimized for ${platform} platform specifications and best practices.`;

    console.log('🎨 Generating image with prompt:', fullPrompt);
    console.log('📐 Aspect ratio configuration:', size);
    console.log('🔍 Request data received:', { size, platform, preset });
    console.log('🔍 Full request body size value:', body.size);

    // Prepare content - match Google documentation structure
    const content: any[] = [];
    
    // Add the main prompt first (like in Google docs example)
    content.push({ text: fullPrompt });
    
    // Add blank canvas reference first to establish aspect ratio
    content.push(blankCanvas);
    
    // Then add other images if they exist
    if (productImagePart) {
      content.push(productImagePart);
    }
    
    if (generatedImagePart) {
      content.push(generatedImagePart);
    }

    // 生成图片 - 使用新 SDK 语法
    console.log('🤖 Calling Google AI with config:', { aspect_ratio: size });
    console.log('🤖 Content structure:', {
      promptLength: fullPrompt.length,
      hasBlankCanvas: true,
      hasProductImage: !!productImagePart,
      hasGeneratedImage: !!generatedImagePart,
      contentItems: content.length
    });
    
    // Use the correct model that supports aspect_ratio parameter according to Google docs
    const imageConfig: any = {
      aspect_ratio: size
    };
    
    // Use gemini-2.5-flash-image as per Google documentation - this is the correct model
    const modelToUse = 'gemini-2.5-flash-image';
    console.log('🤖 Using gemini-2.5-flash-image with aspect_ratio parameter as per Google docs');
    
    const result = await ai.models.generateContent({
      model: modelToUse,
      contents: content,
      config: {
        responseModalities: ['IMAGE'], // Only request image, not text
        imageConfig: imageConfig
      }
    });
    console.log('✅ Google AI response received:', result ? 'success' : 'failed');
    
    // 处理响应 - 新 SDK 结构
    if (!result.candidates || result.candidates.length === 0) {
      console.error('❌ API 没有返回有效的回应');
      return NextResponse.json({ 
        error: 'API 没有返回有效的回应',
        details: 'No candidates in response'
      }, { status: 500, headers });
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
      }, { status: 500, headers });
    }

    const imageBytes = imagePart.inlineData.data;
    const imageMimeType = imagePart.inlineData.mimeType || 'image/png';

    // Validate aspect ratio of generated image
    try {
      // Convert base64 to buffer for processing
      const imageBuffer = Buffer.from(imageBytes, 'base64');
      
      // Use Sharp to get image metadata
      const sharp = require('sharp');
      const metadata = await sharp(imageBuffer).metadata();
      
      if (metadata.width && metadata.height) {
        const actualAspectRatio = metadata.width / metadata.height;
        
        // Calculate expected aspect ratio from size parameter
        const [widthRatio, heightRatio] = size.split(':').map(Number);
        const expectedAspectRatio = widthRatio / heightRatio;
        
        // Allow small tolerance for rounding (5% difference)
        const tolerance = 0.05;
        const ratioDifference = Math.abs(actualAspectRatio - expectedAspectRatio) / expectedAspectRatio;
        
        console.log('📐 Aspect ratio validation:', {
          requested: size,
          expectedRatio: expectedAspectRatio,
          actualRatio: actualAspectRatio,
          actualDimensions: `${metadata.width}x${metadata.height}`,
          ratioDifference: `${(ratioDifference * 100).toFixed(1)}%`,
          withinTolerance: ratioDifference <= tolerance
        });
        
        // If aspect ratio doesn't match, try to fix it
        if (ratioDifference > tolerance) {
          console.log('🔄 Aspect ratio mismatch detected, attempting to fix...');
          
          // Calculate target dimensions based on the expected aspect ratio
          let targetWidth = metadata.width;
          let targetHeight = metadata.height;
          
          // Adjust dimensions to match expected aspect ratio
          if (actualAspectRatio > expectedAspectRatio) {
            // Image is too wide, crop width
            targetWidth = Math.round(metadata.height * expectedAspectRatio);
          } else {
            // Image is too tall, crop height
            targetHeight = Math.round(metadata.width / expectedAspectRatio);
          }
          
          // Crop the image to the correct aspect ratio
          const correctedBuffer = await sharp(imageBuffer)
            .resize(targetWidth, targetHeight, {
              fit: 'cover',
              position: 'center'
            })
            .toBuffer();
          
          // Convert back to base64
          const correctedBase64 = correctedBuffer.toString('base64');
          
          console.log('✅ Aspect ratio corrected:', {
            original: `${metadata.width}x${metadata.height}`,
            corrected: `${targetWidth}x${targetHeight}`,
            finalRatio: `${(targetWidth/targetHeight).toFixed(3)}:1`
          });
          
          return NextResponse.json({
            success: true,
            image_url: `data:${imageMimeType};base64,${correctedBase64}`,
            concept: concept,
            prompt: prompt,
            platform: platform,
            size: size,
            preset: preset,
            aspect_ratio_validated: true,
            original_dimensions: `${metadata.width}x${metadata.height}`,
            corrected_dimensions: `${targetWidth}x${targetHeight}`
          }, { headers });
        }
      }
    } catch (validationError) {
      console.error('❌ Aspect ratio validation failed:', validationError);
      // Continue with original image if validation fails
    }

    console.log('✅ 成功生成图片');
    
    return NextResponse.json({
      success: true,
      image_url: `data:${imageMimeType};base64,${imageBytes}`,
      concept: concept,
      prompt: prompt,
      platform: platform,
      size: size,
      preset: preset
    }, { headers });

  } catch (error) {
    console.error('生成圖片时发生错误:', error);
    return NextResponse.json(
      { 
        error: '生成圖片时发生错误',
        details: (error as Error)?.message || 'Unknown error'
      },
      { status: 500, headers }
    );
  }
}
