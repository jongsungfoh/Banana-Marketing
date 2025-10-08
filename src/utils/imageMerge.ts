/**
 * Utility functions for merging multiple images into a single composite image
 * Uses Sharp for server-side image processing
 */

import sharp from 'sharp';

/**
 * Convert base64 or URL to Sharp image buffer
 */
async function loadImageToBuffer(imageUrl: string): Promise<Buffer> {
  try {
    if (imageUrl.startsWith('data:')) {
      // Handle base64 data URL
      const base64Data = imageUrl.split(',')[1];
      return Buffer.from(base64Data, 'base64');
    } else if (imageUrl.startsWith('http')) {
      // Handle HTTP URL - fetch the image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } else {
      // Assume it's already base64 without data URL prefix
      return Buffer.from(imageUrl, 'base64');
    }
  } catch (error) {
    console.error('Error loading image:', error);
    throw new Error(`Failed to load image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Merge multiple images into a single composite image (simplified version)
 * Merges images left-to-right regardless of size differences
 * @param imageUrls Array of image URLs (can be base64 or regular URLs)
 * @param spacing Space between images in pixels
 * @param maxWidth Maximum width of the final image (0 = no limit)
 * @param maxHeight Maximum height of the final image (0 = no limit)
 * @returns Base64 string of the merged image
 */
export async function mergeImages(
  imageUrls: string[],
  layout: 'horizontal' | 'vertical' | 'grid' = 'horizontal',
  spacing: number = 20,
  maxWidth: number = 0, // 0 = no limit
  maxHeight: number = 0  // 0 = no limit
): Promise<string> {
  if (imageUrls.length === 0) {
    throw new Error('No images provided for merging');
  }

  if (imageUrls.length === 1) {
    return imageUrls[0]; // Return single image as-is
  }

  try {
    console.log(`🔄 Merging ${imageUrls.length} images...`);
    
    // Load all images into Sharp with detailed logging
  const imageBuffers = await Promise.all(
    imageUrls.map(async (url, index) => {
      console.log(`📸 Loading image ${index + 1}:`, url?.substring(0, 50) + '...');
      try {
        const buffer = await loadImageToBuffer(url);
        console.log(`✅ Image ${index + 1} loaded successfully, buffer size:`, buffer.length);
        return sharp(buffer);
      } catch (error) {
        console.error(`❌ Failed to load image ${index + 1}:`, error);
        throw error;
      }
    })
  );

    // Get metadata for all images
    const metadata = await Promise.all(
      imageBuffers.map(async (img, index) => {
        try {
          const meta = await img.metadata();
          console.log(`📊 Image ${index + 1} metadata:`, { width: meta.width, height: meta.height, format: meta.format });
          return meta;
        } catch (error) {
          console.error(`❌ Failed to get metadata for image ${index + 1}:`, error);
          throw error;
        }
      })
    );

    const images = imageBuffers.map((img, index) => ({
      sharp: img,
      width: metadata[index].width || 0,
      height: metadata[index].height || 0
    }));

    console.log('📋 All images loaded and processed:', images.map(img => ({ width: img.width, height: img.height })));

    // For horizontal layout: place images side by side, aligned to top
    if (layout === 'horizontal') {
      // Calculate total width and max height
      const totalWidth = images.reduce((sum, img) => sum + img.width, 0) + spacing * (images.length - 1);
      const maxImageHeight = Math.max(...images.map(img => img.height));
      
      // Apply scaling only if max dimensions are specified
      let scale = 1;
      if (maxWidth > 0 && totalWidth > maxWidth) {
        scale = maxWidth / totalWidth;
      }
      if (maxHeight > 0 && maxImageHeight > maxHeight) {
        scale = Math.min(scale, maxHeight / maxImageHeight);
      }
      
      const canvasWidth = Math.floor(totalWidth * scale);
      const canvasHeight = Math.floor(maxImageHeight * scale);
      
      // Create background with solid white color
      let composite = sharp({
        create: {
          width: canvasWidth,
          height: canvasHeight,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      }).png();
      
      console.log(`🎨 Created canvas: ${canvasWidth}x${canvasHeight} with white background`);

      // Place images side by side, aligned to top
      let currentX = 0;
      const compositeOperations = [];
      
      console.log(`🖼️ Processing ${images.length} images for horizontal merge:`);
      
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const scaledWidth = Math.floor(img.width * scale);
        const scaledHeight = Math.floor(img.height * scale);
        
        console.log(`🖼️ Image ${i + 1}: original ${img.width}x${img.height}, scaled ${scaledWidth}x${scaledHeight}, position: left=${currentX}, top=0`);
        
        // Resize the image and ensure it's in a compatible format
        const resizedBuffer = await img.sharp
          .resize(scaledWidth, scaledHeight, { fit: 'fill' })
          .png() // Convert to PNG to ensure proper compositing
          .toBuffer();
        
        // Add to composite operations array with blend mode to ensure visibility
        compositeOperations.push({
          input: resizedBuffer,
          top: 0, // Align to top
          left: currentX
        });
        
        console.log(`✅ Image ${i + 1} added to composite at position left=${currentX}`);
        currentX += scaledWidth + spacing;
      }
      
      console.log(`📊 Total composite operations: ${compositeOperations.length}`);
      
      // Apply all composite operations at once
      composite = composite.composite(compositeOperations);
      
      // Get final merged image metadata to verify it contains all images
      const finalMetadata = await composite.metadata();
      console.log(`✅ Merged image created: ${finalMetadata.width}x${finalMetadata.height}, format: ${finalMetadata.format}`);
      console.log(`📊 Expected total width: ${canvasWidth}, actual width: ${finalMetadata.width}`);
      console.log(`📊 Expected total height: ${canvasHeight}, actual height: ${finalMetadata.height}`);
      
      // Convert to base64
      const buffer = await composite.toBuffer();
      const base64Result = `data:image/png;base64,${buffer.toString('base64')}`;
      console.log(`📸 Merged image base64 length: ${base64Result.length}`);
      
      return base64Result;
    }
    
    // For other layouts, use the original implementation
    return mergeImagesOriginal(imageUrls, layout, spacing, maxWidth || 1200, maxHeight || 800);
  } catch (error) {
    console.error('Error merging images:', error);
    throw new Error(`Failed to merge images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Original implementation for non-horizontal layouts
 */
async function mergeImagesOriginal(
  imageUrls: string[],
  layout: 'vertical' | 'grid',
  spacing: number,
  maxWidth: number,
  maxHeight: number
): Promise<string> {
  // Load all images into Sharp
  const imageBuffers = await Promise.all(
    imageUrls.map(async (url) => {
      const buffer = await loadImageToBuffer(url);
      return sharp(buffer);
    })
  );

  // Get metadata for all images
  const metadata = await Promise.all(
    imageBuffers.map(img => img.metadata())
  );

  const images = imageBuffers.map((img, index) => ({
    sharp: img,
    width: metadata[index].width || 0,
    height: metadata[index].height || 0
  }));

  let composite: sharp.Sharp;
  let canvasWidth: number;
  let canvasHeight: number;

  switch (layout) {
    case 'vertical':
      const maxImageWidth = Math.max(...images.map(img => img.width));
      const totalHeight = images.reduce((sum, img) => sum + img.height, 0) + spacing * (images.length - 1);
      
      // Scale down if too tall
      const verticalScale = Math.min(1, maxHeight / totalHeight);
      canvasWidth = Math.min(maxImageWidth * verticalScale, maxWidth);
      canvasHeight = Math.min(totalHeight * verticalScale, maxHeight);
      
      composite = sharp({
        create: {
          width: canvasWidth,
          height: canvasHeight,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      }).png();

      let currentY = 0;
      
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const scaledWidth = Math.floor(img.width * verticalScale);
        const scaledHeight = Math.floor(img.height * verticalScale);
        const x = Math.floor((canvasWidth - scaledWidth) / 2);
        
        const resizedBuffer = await img.sharp
          .resize(scaledWidth, scaledHeight)
          .toBuffer();
        
        composite = composite.composite([{
          input: resizedBuffer,
          top: Math.floor(currentY),
          left: x
        }]);
        
        currentY += scaledHeight + spacing * verticalScale;
      }
      break;

    case 'grid':
      const cols = Math.ceil(Math.sqrt(images.length));
      const rows = Math.ceil(images.length / cols);
      
      const maxColWidth = Math.max(...images.map(img => img.width));
      const maxRowHeight = Math.max(...images.map(img => img.height));
      
      canvasWidth = Math.min(cols * maxColWidth + (cols - 1) * spacing, maxWidth);
      canvasHeight = Math.min(rows * maxRowHeight + (rows - 1) * spacing, maxHeight);
      
      const gridScale = Math.min(
        (canvasWidth - (cols - 1) * spacing) / (cols * maxColWidth),
        (canvasHeight - (rows - 1) * spacing) / (rows * maxRowHeight)
      );
      
      composite = sharp({
        create: {
          width: canvasWidth,
          height: canvasHeight,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      }).png();

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const col = i % cols;
        const row = Math.floor(i / cols);
        
        const scaledWidth = Math.floor(img.width * gridScale);
        const scaledHeight = Math.floor(img.height * gridScale);
        
        const x = col * (Math.floor(maxColWidth * gridScale) + spacing);
        const y = row * (Math.floor(maxRowHeight * gridScale) + spacing);
        
        const resizedBuffer = await img.sharp
          .resize(scaledWidth, scaledHeight)
          .toBuffer();
        
        composite = composite.composite([{
          input: resizedBuffer,
          top: y,
          left: x
        }]);
      }
      break;
  }

  const buffer = await composite.toBuffer();
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

/**
 * Create a simple side-by-side image merge (fallback method)
 */
export async function mergeImagesSimple(imageUrls: string[]): Promise<string> {
  return mergeImages(imageUrls, 'horizontal', 10, 0, 0); // No size limits
}