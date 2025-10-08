'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageMergeButtonProps {
  currentLanguage: string;
  onMergeComplete?: (mergedImageUrl: string) => void;
  onAddProduct?: (mergedImageUrl: string, fileName: string) => void;
}

export default function ImageMergeButton({ currentLanguage, onMergeComplete, onAddProduct }: ImageMergeButtonProps) {
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedImageUrl, setMergedImageUrl] = useState<string>('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      addImages(files);
    }
  };

  const addImages = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const newImages = [...selectedImages, ...imageFiles];
    setSelectedImages(newImages);

    // Create previews for new images
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      // Reorder images
      const newImages = [...selectedImages];
      const draggedImage = newImages[draggedIndex];
      newImages.splice(draggedIndex, 1);
      newImages.splice(targetIndex, 0, draggedImage);
      setSelectedImages(newImages);

      const newPreviews = [...imagePreviews];
      const draggedPreview = newPreviews[draggedIndex];
      newPreviews.splice(draggedIndex, 1);
      newPreviews.splice(targetIndex, 0, draggedPreview);
      setImagePreviews(newPreviews);

      setDraggedIndex(targetIndex);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const mergeImages = async () => {
    if (selectedImages.length < 2) {
      alert(currentLanguage === 'zh-cn' ? '请至少选择2张图片' : 'Please select at least 2 images');
      return;
    }

    setIsMerging(true);

    try {
      // Convert images to base64
      const base64Images = await Promise.all(
        imagePreviews.map(async (preview) => {
          return preview;
        })
      );

      // Call merge API
      const response = await fetch('/api/merge-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: base64Images,
          layout: 'horizontal',
          spacing: 20,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to merge images');
      }

      const data = await response.json();
      setMergedImageUrl(data.mergedImageUrl);
      onMergeComplete?.(data.mergedImageUrl);
    } catch (error) {
      console.error('Error merging images:', error);
      alert(currentLanguage === 'zh-cn' ? '合并图片失败' : 'Failed to merge images');
    } finally {
      setIsMerging(false);
    }
  };

  const downloadMergedImage = () => {
    if (!mergedImageUrl) return;

    const link = document.createElement('a');
    link.href = mergedImageUrl;
    link.download = `merged-images-${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addMergedImageAsProduct = () => {
    console.log('🛍️ Add Product button clicked');
    console.log('📸 Merged image URL exists:', !!mergedImageUrl);
    console.log('🔧 onAddProduct function available:', !!onAddProduct);
    
    if (!mergedImageUrl) {
      console.log('❌ No merged image URL found');
      return;
    }
    
    if (!onAddProduct) {
      console.log('❌ onAddProduct function not provided');
      alert('Product upload function not available. Please try again.');
      return;
    }
    
    const fileName = `merged-product-${new Date().toISOString().slice(0, 10)}.png`;
    console.log('🚀 Calling onAddProduct with:', { fileName, urlLength: mergedImageUrl.length });
    
    try {
      onAddProduct(mergedImageUrl, fileName);
      console.log('✅ onAddProduct called successfully');
      setShowMergeModal(false); // Close modal after adding as product
    } catch (error) {
      console.error('❌ Error calling onAddProduct:', error);
      alert('Failed to add product. Please try again.');
    }
  };

  const resetMerge = () => {
    setSelectedImages([]);
    setImagePreviews([]);
    setMergedImageUrl('');
  };

  return (
    <>
      {/* Merge Button */}
      <div className="neu-button-container">
        <div className="neu-button-label">
          {currentLanguage === 'zh-cn' ? '合并图片' : 'Merge Images'}
        </div>
        <button
          onClick={() => setShowMergeModal(true)}
          className="neu-button"
          title={currentLanguage === 'zh-cn' ? '合并多张图片' : 'Merge multiple images'}
        >
          <div className="neu-button-outer">
            <div className="neu-button-inner">
              <svg className="neu-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* Merge Modal */}
      <AnimatePresence>
        {showMergeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={() => setShowMergeModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-8 w-[800px] max-w-[90vw] shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <svg className="h-16 w-16 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {currentLanguage === 'zh-cn' ? '合并图片' : 'Merge Images'}
                </h3>
                <p className="text-gray-600">
                  {currentLanguage === 'zh-cn' 
                    ? '上传多张图片并将它们合并成一张图片' 
                    : 'Upload multiple images and merge them into a single image'
                  }
                </p>
              </div>

              {/* Upload Area */}
              {!mergedImageUrl && (
                <div
                  className="border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl p-8 mb-6 cursor-pointer transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-600 mb-2">
                    {currentLanguage === 'zh-cn' 
                      ? '拖放图片到此处或点击上传' 
                      : 'Drag & drop images here or click to upload'
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    {currentLanguage === 'zh-cn' 
                      ? '支援 JPG, PNG，最大 10MB' 
                      : 'Supports JPG, PNG • Max 10MB'
                    }
                  </p>
                </div>
              )}

              {/* Image Previews */}
              {imagePreviews.length > 0 && !mergedImageUrl && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    {currentLanguage === 'zh-cn' ? '图片预览' : 'Image Previews'}
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative group cursor-move"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragEnd={handleDragEnd}
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Merged Image Result */}
              {mergedImageUrl && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    {currentLanguage === 'zh-cn' ? '合并结果' : 'Merged Result'}
                  </h4>
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <img
                      src={mergedImageUrl}
                      alt="Merged result"
                      className="w-full max-h-96 object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowMergeModal(false)}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {currentLanguage === 'zh-cn' ? '关闭' : 'Close'}
                </button>
                
                {selectedImages.length > 0 && !mergedImageUrl && (
                  <button
                    onClick={mergeImages}
                    disabled={isMerging || selectedImages.length < 2}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isMerging ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {currentLanguage === 'zh-cn' ? '合并中...' : 'Merging...'}
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {currentLanguage === 'zh-cn' ? '合并图片' : 'Merge Images'}
                      </>
                    )}
                  </button>
                )}

                {mergedImageUrl && (
                  <button
                    onClick={downloadMergedImage}
                    className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {currentLanguage === 'zh-cn' ? '下载图片' : 'Download Image'}
                  </button>
                )}

                {mergedImageUrl && (
                  <button
                    onClick={addMergedImageAsProduct}
                    className="px-6 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {currentLanguage === 'zh-cn' ? '添加产品' : 'Add Product'}
                  </button>
                )}

                {mergedImageUrl && (
                  <button
                    onClick={resetMerge}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {currentLanguage === 'zh-cn' ? '重新开始' : 'Start Over'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
}