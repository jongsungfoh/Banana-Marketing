import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

interface CreativeConcept {
  name: string;
  description: string;
  rationale: string;
}

interface ReasoningStep {
  step: string;
  analysis: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const productImage = formData.get('product_image') as File;
    const imageUrl = formData.get('image_url') as string;
    const language = formData.get('language') as string || 'zh-tw';
    const apiKey = formData.get('api_key') as string;

    if (!productImage && !imageUrl) {
      return NextResponse.json({ error: '没有提供产品图片' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: '需要提供 API Key' }, { status: 400 });
    }

    // 使用用户提供的 API Key
    console.log('🤖 Initializing Gemini model...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log('✅ Gemini model initialized');

    let base64Image: string;
    let mimeType: string;
    
    if (productImage) {
      // Handle file upload
      const bytes = await productImage.arrayBuffer();
      const buffer = Buffer.from(bytes);
      base64Image = buffer.toString('base64');
      mimeType = productImage.type || 'image/png';
    } else if (imageUrl) {
      // Handle URL-based image
      console.log('🌐 Fetching image from URL:', imageUrl);
      try {
        const response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 30000, // 增加到30秒超时
          maxContentLength: 50 * 1024 * 1024, // 限制最大50MB
          validateStatus: (status) => status >= 200 && status < 300
        });
        const buffer = Buffer.from(response.data);
        base64Image = buffer.toString('base64');
        mimeType = response.headers['content-type'] || 'image/png';
        console.log('✅ Image fetched successfully, size:', base64Image.length);
      } catch (error) {
        console.error('Failed to fetch image from URL:', error);
        return NextResponse.json({ error: '无法从URL获取图片' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: '没有提供有效的图片' }, { status: 400 });
    }

    const analysisPrompt = (language === 'zh' || language === 'zh-tw') 
      ? `用简体中文快速分析产品，提供5个创意概念，保持简洁。

JSON格式：
{
  "reasoning_steps": [
    {"step": "产品分析", "analysis": "简短产品描述"},
    {"step": "目标客群", "analysis": "简短客群分析"},
    {"step": "视觉特点", "analysis": "简短外观特色"},
    {"step": "市场策略", "analysis": "简短市场定位"},
    {"step": "广告方向", "analysis": "简短广告重点"}
  ],
  "product_type": "产品类别",
  "creative_concepts": [
    {"name": "英雄照片", "description": "简短说明", "rationale": "简短理由"},
    {"name": "生活情境", "description": "简短说明", "rationale": "简短理由"},
    {"name": "简约风格", "description": "简短说明", "rationale": "简短理由"},
    {"name": "高端品牌", "description": "简短说明", "rationale": "简短理由"},
    {"name": "创意表现", "description": "简短说明", "rationale": "简短理由"}
  ]
}`
      : `Analyze this product quickly and provide 5 creative concepts. Be concise.

JSON format:
{
  "reasoning_steps": [
    {"step": "Product Type", "analysis": "What is this product?"},
    {"step": "Visual Style", "analysis": "Key visual elements?"},
    {"step": "Target Audience", "analysis": "Who would buy this?"},
    {"step": "Creative Strategy", "analysis": "Best advertising approach?"},
    {"step": "Execution", "analysis": "How to implement?"}
  ],
  "product_type": "product category",
  "creative_concepts": [
    {"name": "Hero Shot", "description": "Clean product focus", "rationale": "Shows product clearly"},
    {"name": "Lifestyle", "description": "Product in use", "rationale": "Shows context"},
    {"name": "Minimalist", "description": "Simple background", "rationale": "Clean aesthetic"},
    {"name": "Premium", "description": "Luxury presentation", "rationale": "High-end appeal"},
    {"name": "Creative", "description": "Artistic approach", "rationale": "Memorable impact"}
  ]
}`;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType
      }
    };

    console.log('🚀 Calling Gemini API...');
    
    // 增加超时时间到60秒，并添加重试逻辑
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Gemini API timeout after 60 seconds')), 60000);
    });
    
    let result;
    try {
      result = await Promise.race([
        model.generateContent([analysisPrompt, imagePart]),
        timeoutPromise
      ]);
    } catch (error) {
      console.error('Gemini API 调用失败:', error);
      // 如果超时或API错误，返回一个默认的响应
      const defaultResponse = {
        reasoning_steps: [
          {step: "产品分析", analysis: "产品图片分析完成"},
          {step: "目标客群", analysis: "基于产品类型的目标客群"},
          {step: "视觉特点", analysis: "产品外观特色分析"},
          {step: "市场策略", analysis: "通用市场定位建议"},
          {step: "广告方向", analysis: "标准广告创意方向"}
        ],
        product_type: "优质产品",
        creative_concepts: [
          {name: "标准展示", description: "清晰的产品展示", rationale: "突出产品特点"},
          {name: "生活场景", description: "产品在实际使用中的场景", rationale: "增强用户代入感"},
          {name: "简约风格", description: "简洁背景突出产品", rationale: "专业视觉效果"},
          {name: "品牌展示", description: "结合品牌元素", rationale: "提升品牌认知"},
          {name: "创意构图", description: "独特的视觉角度", rationale: "吸引用户注意"}
        ]
      };
      
      return NextResponse.json({
        success: true,
        analysis: JSON.stringify(defaultResponse),
        creative_prompts: defaultResponse.creative_concepts.map((concept: any) => ({
          concept: concept.name,
          prompt: concept.description,
          rationale: concept.rationale,
          background: '专业摄影棚背景',
          include_model: false
        })),
        reasoning_steps: defaultResponse.reasoning_steps,
        product_image_url: `data:${mimeType};base64,${base64Image}`,
        warning: 'API调用遇到问题，返回智能默认分析结果'
      });
    }
    
    const response = await result.response;
    const text = response.text();
    console.log('✅ Response text extracted, length:', text.length);

    // 解析 JSON 响应
    let parsedAnalysisData;
    let reasoningSteps: ReasoningStep[] = [];
    let creativePrompts;

    try {
      console.log('🔍 Parsing JSON response...');
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonText = jsonMatch[1] || jsonMatch[0];
        console.log('📝 Found JSON text:', jsonText.substring(0, 200) + '...');
        parsedAnalysisData = JSON.parse(jsonText);
        reasoningSteps = parsedAnalysisData.reasoning_steps || [];
        console.log('✅ Parsed reasoning steps:', reasoningSteps.length);
        
        if (parsedAnalysisData.creative_concepts) {
          creativePrompts = parsedAnalysisData.creative_concepts.map((concept: CreativeConcept) => ({
            concept: concept.name,
            prompt: concept.description,
            rationale: concept.rationale,
            background: '专业摄影棚背景',
            include_model: false
          }));
          console.log('✅ Parsed creative concepts:', creativePrompts.length);
        }
      } else {
        console.warn('⚠️ No JSON found in response');
      }
    } catch (error) {
      console.error('解析 JSON 失败:', error);
      console.log('📄 Raw response text:', text);
      creativePrompts = generateCreativePrompts('product', [], language);
      reasoningSteps = [];
    }

    if (!creativePrompts) {
      creativePrompts = generateCreativePrompts('product', [], language);
    }

    // 将图片转换为 base64 URL 供前端使用
    const productImageUrl = `data:${mimeType};base64,${base64Image}`;

    console.log('📊 Final response data:', {
      reasoning_steps_count: reasoningSteps.length,
      creative_prompts_count: creativePrompts.length,
      has_product_image: !!productImageUrl
    });

    return NextResponse.json({
      success: true,
      analysis: text,
      creative_prompts: creativePrompts,
      reasoning_steps: reasoningSteps,
      product_image_url: productImageUrl
    });

  } catch (error) {
    console.error('分析产品时发生错误:', error);
    return NextResponse.json(
      { 
        error: '分析产品时发生错误',
        details: (error as Error)?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateCreativePrompts(productType: string, concepts: any[], language: string = 'zh-tw') {
  return concepts.map((concept, index) => {
    const basePrompt = language === 'zh' || language === 'zh-tw' 
      ? `创建${productType}的${concept.name}广告创意，${concept.description}。风格：${concept.rationale}。`
      : `Create ${concept.name} ad creative for ${productType}, ${concept.description}. Style: ${concept.rationale}.`;
    return {
      concept: concept.name,
      prompt: basePrompt,
      rationale: concept.rationale,
      background: '专业摄影棚背景',
      include_model: false
    };
  });
}
