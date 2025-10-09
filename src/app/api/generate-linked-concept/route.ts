import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { mergeImages } from '@/utils/imageMerge';
import { getCurrentGeminiModel } from '@/utils/getCurrentGeminiModel';

async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  try {
    console.log(`📸 Fetching image:`, imageUrl?.substring(0, 100) + '...');
    
    // Handle base64 data URLs directly
    if (imageUrl.startsWith('data:')) {
      console.log(`✅ Image is already base64 data URL, length:`, imageUrl.length);
      return imageUrl;
    }

    // Fetch image from URL
    console.log(`🌐 Fetching image from URL...`);
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`❌ Failed to fetch image: ${response.status}`, response.statusText);
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    
    // Determine MIME type
    const contentType = response.headers.get('content-type') || 'image/png';
    const dataUrl = `data:${contentType};base64,${base64}`;
    
    console.log(`✅ Image fetched successfully, converted to base64 data URL, length:`, dataUrl.length);
    return dataUrl;
  } catch (error) {
    console.error('❌ Error fetching image:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products, language, api_key } = body;

    console.log('🔄 Generate Linked Concept Request:', {
      productCount: products?.length,
      language,
      hasApiKey: !!api_key
    });

    // Validate required fields
    if (!products || !Array.isArray(products) || products.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'At least 2 products are required'
      }, { status: 400 });
    }

    if (!api_key) {
      return NextResponse.json({
        success: false,
        error: 'API key is required'
      }, { status: 400 });
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(api_key);
    const currentModel = getCurrentGeminiModel();
    const model = genAI.getGenerativeModel({ model: currentModel.name });
    console.log(`✅ Gemini model initialized: ${currentModel}`);

    // Fetch and convert all product images to base64, then merge them
    console.log('📸 Fetching and merging product images...');
    console.log('📋 Products data:', products.map((p, i) => ({
      index: i + 1,
      title: p.title,
      hasImageUrl: !!p.imageUrl,
      imageUrlType: p.imageUrl?.startsWith('data:') ? 'base64' : p.imageUrl?.startsWith('http') ? 'url' : 'unknown'
    })));
    
    let mergedImage;
    let mergedImageUrl; // Declare outside try block
    
    try {
      // Fetch all product images
      const imagePromises = products.map(async (product, index) => {
        console.log(`🖼️ Fetching product ${index + 1} image:`, product.imageUrl?.substring(0, 50) + '...');
        return await fetchImageAsBase64(product.imageUrl);
      });
      
      const productImageUrls = await Promise.all(imagePromises);
      console.log(`✅ Successfully fetched ${productImageUrls.length} product images`);
      
      // Merge images into a single composite image
      console.log('🔄 Merging images...');
      console.log('📋 Image URLs to merge:', productImageUrls.map((url, i) => ({
        index: i + 1,
        urlType: url?.startsWith('data:') ? 'base64' : 'url',
        urlLength: url?.length || 0
      })));
      mergedImageUrl = await mergeImages(productImageUrls, 'horizontal', 20, 1200, 800);
      console.log('✅ Images merged successfully');
      console.log('📸 Merged image URL length:', mergedImageUrl?.length || 0);
      console.log('📸 Merged image URL type:', mergedImageUrl?.startsWith('data:') ? 'base64' : 'url');
      
      // Convert merged image to the format expected by Gemini
      let imageData, mimeType;
      if (mergedImageUrl.startsWith('data:')) {
        const parts = mergedImageUrl.split(',');
        imageData = parts[1];
        const mimeMatch = parts[0].match(/data:([^;]+)/);
        mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
      } else {
        imageData = mergedImageUrl;
        mimeType = 'image/png';
      }
      
      if (!imageData || imageData.trim() === '') {
        throw new Error('Merged image data is empty');
      }
      
      mergedImage = {
        inlineData: {
          data: imageData,
          mimeType: mimeType
        }
      };
      
      console.log('📸 Merged image details:', {
        hasData: !!imageData,
        dataLength: imageData.length,
        mimeType: mimeType
      });
      
    } catch (error) {
      console.error('❌ Error processing images:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to process product images',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 400 });
    }

    // Create a comprehensive prompt for generating a linked concept
    const productTitles = products.map(p => p.title).join(', ');
    const productList = products.map((p, index) => `${index + 1}. ${p.title}`).join('\n');

    console.log(`📝 Creating prompt for merged image containing ${products.length} products:`, productTitles);

    const prompt = language === 'zh-cn' 
      ? `这是一个包含${products.length}个产品的合并图片，请仔细分析这张图片中的所有产品，并基于它们的视觉特点和功能，生成一个综合的营销概念，将这些产品的特点有机结合：\n\n产品列表：\n${productList}\n\n请基于图片中所有产品的视觉特征（颜色、形状、风格、材质、相互关系等）来生成概念，确保概念能体现所有产品的共同特点和独特价值。\n\n请提供：\n1. 综合概念标题（简洁有力，20字以内）\n2. 详细描述（100-200字，说明如何将这些产品有机结合，基于它们的视觉特点）\n3. 核心卖点（3-5个关键词，体现产品组合的独特价值）\n\n输出格式：\n标题：[概念标题]\n描述：[详细描述]\n卖点：[关键词1, 关键词2, 关键词3]`
      : `This is a merged image containing ${products.length} products. Please carefully analyze all products in this image and based on their visual characteristics and functions, generate a comprehensive marketing concept that organically combines the features of these products:\n\nProduct List:\n${productList}\n\nPlease generate the concept based on the visual characteristics (colors, shapes, styles, materials, relationships, etc.) of ALL products in the image, ensuring the concept reflects the common features and unique value of all products.\n\nPlease provide:\n1. A comprehensive concept title (concise and powerful, under 20 words)\n2. Detailed description (100-200 words, explaining how to organically combine these products based on their visual characteristics)\n3. Core selling points (3-5 keywords that reflect the unique value of the product combination)\n\nOutput format:\nTitle: [Concept Title]\nDescription: [Detailed Description]\nSelling Points: [keyword1, keyword2, keyword3]`;

    // Generate content using Gemini with the merged image
    console.log(`🎨 Sending merged image (${mergedImage.inlineData.mimeType}, ${mergedImage.inlineData.data.length} chars) to Gemini...`);
    
    const result = await model.generateContent([
      prompt,
      mergedImage
    ]);
    
    console.log('✅ Gemini API call completed with merged image');
    const response = await result.response;
    const generatedText = response.text();
    
    console.log('📝 Generated text length:', generatedText.length);
    console.log('✅ Linked concept generated from merged image, text length:', generatedText.length);
    
    console.log('✅ Linked Concept Generated:', generatedText);

    // Parse the generated text
    const lines = generatedText.split('\n').filter(line => line.trim());
    let title = 'Linked Concept';
    let description = 'Combined concept for multiple products';
    let sellingPoints: string[] = [];

    lines.forEach(line => {
      const cleanLine = line.trim();
      if (cleanLine.startsWith('Title:') || cleanLine.startsWith('标题：')) {
        title = cleanLine.replace(/^Title:|^标题：/, '').trim();
      } else if (cleanLine.startsWith('Description:') || cleanLine.startsWith('描述：')) {
        description = cleanLine.replace(/^Description:|^描述：/, '').trim();
      } else if (cleanLine.startsWith('Selling Points:') || cleanLine.startsWith('卖点：')) {
        const pointsText = cleanLine.replace(/^Selling Points:|^卖点：/, '').trim();
        sellingPoints = pointsText.split(/[,，]/).map(point => point.trim()).filter(point => point);
      }
    });

    // Fallback parsing if format doesn't match
    if (title === 'Linked Concept' && generatedText.length > 10) {
      const sentences = generatedText.split(/[.!。]/).filter(s => s.trim().length > 5);
      if (sentences.length > 0) {
        title = sentences[0].trim().substring(0, 50);
        description = generatedText;
      }
    }

    const resultData = {
      success: true,
      concept: {
        title,
        description,
        sellingPoints,
        products: products.map(p => ({ id: p.id, title: p.title }))
      },
      mergedImage: mergedImageUrl, // Return the merged image URL for display
      analyzedImages: products.length,
      mergedImageInfo: {
        productsMerged: products.length,
        layout: 'horizontal',
        spacing: 20,
        maxDimensions: '1200x800',
        mergedImageSize: mergedImage.inlineData.data.length
      },
      debugInfo: {
        totalProducts: products.length,
        successfullyAnalyzed: 1,
        productTitles: products.map(p => p.title),
        promptSnippet: prompt.substring(0, 100) + '...'
      }
    };

    console.log('📤 Response:', resultData);
    console.log('🎉 SUCCESS: Analyzed merged image containing', products.length, 'products');
    return NextResponse.json(resultData);

  } catch (error) {
    console.error('❌ Generate Linked Concept Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: errorMessage
    }, { status: 500 });
  }
}
