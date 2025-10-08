/**
 * API endpoint for merging multiple images
 * Handles image merging requests from the frontend
 */

import { NextRequest, NextResponse } from 'next/server';
import { mergeImages } from '@/utils/imageMerge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { images, layout = 'horizontal', spacing = 20 } = body;

    // Validate input
    if (!images || !Array.isArray(images) || images.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'At least 2 images are required for merging'
      }, { status: 400 });
    }

    console.log(`🔄 Merging ${images.length} images via API...`);
    console.log('📋 Merge parameters:', { layout, spacing });

    // Merge images using the existing utility function with larger dimensions
    const mergedImageUrl = await mergeImages(images, layout, spacing, 2400, 1600);
    
    console.log('✅ Images merged successfully via API');
    console.log('📸 Merged image URL length:', mergedImageUrl?.length || 0);

    return NextResponse.json({
      success: true,
      mergedImageUrl,
      mergedImageInfo: {
        imagesMerged: images.length,
        layout,
        spacing,
        maxDimensions: '2400x1600',
        mergedImageSize: mergedImageUrl.length
      }
    });

  } catch (error) {
    console.error('❌ Image merge API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to merge images';
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: errorMessage
    }, { status: 500 });
  }
}