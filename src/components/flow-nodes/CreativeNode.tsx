'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import { hashCode, seededRandom } from '@/utils/handdrawnStyles';

// Helper function to calculate aspect ratio padding percentage
const getAspectRatioPadding = (ratio: string): string => {
  const [width, height] = ratio.split(':').map(Number);
  return `${(height / width) * 100}%`;
};

interface CreativeNodeData {
  title: string;
  content: string;
  imageUrl?: string;
  status: 'idle' | 'generating' | 'completed' | 'error';
  justCompleted?: boolean;
  platform?: string;
  size?: string;
  onImageClick?: (imageUrl: string) => void;
  onDeleteClick?: (nodeId: string) => void;
  onAddConcept?: () => void;
  onTitleUpdate?: (nodeId: string, newTitle: string) => void;
}

interface CreativeNodeProps {
  data: CreativeNodeData;
  id: string;
}

// SVG 图标组件
const AddIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1a.75.75 0 01.75.75V7H14a.75.75 0 010 1.5H8.75v5.25a.75.75 0 01-1.5 0V8.5H1.75a.75.75 0 010-1.5h5.5V1.75A.75.75 0 018 1z"/>
  </svg>
);

const MagnifyingGlassIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path d="M11 1.75V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.404 15h5.192c.9 0 1.655-.681 1.74-1.575l.66-6.6a.75.75 0 00-1.492-.15L10.844 13.5H5.156l-.66-6.825z"/>
  </svg>
);

const CreativeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z" />
  </svg>
);

const ImageIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

const TitleEditIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

export default function CreativeNode({ data, id }: CreativeNodeProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(data.title);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const MAX_TITLE_LENGTH = 25;
  const hash = hashCode(id + 'tag-rotation');
  const rotation = (seededRandom(hash) - 0.5) * 8;

  useEffect(() => {
    if (!isEditingTitle) {
      setEditTitle(data.title);
    }
  }, [data.title, isEditingTitle]);

  useEffect(() => {
    if (isEditingTitle) {
      setTimeout(() => {
        if (titleRef.current) {
          titleRef.current.textContent = editTitle;
          titleRef.current.focus();
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(titleRef.current);
          range.collapse(false);
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }, 100);
    }
  }, [isEditingTitle, editTitle]);

  const handleTitleSave = () => {
    const newTitle = editTitle.trim();
    data.onTitleUpdate?.(id, newTitle);
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditTitle(data.title);
    if (titleRef.current) {
      titleRef.current.textContent = data.title;
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleTitleCancel();
    } else if (e.key.length === 1) {
      const currentLength = editTitle.length;
      if (currentLength >= MAX_TITLE_LENGTH) {
        e.preventDefault();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`neu-card-blue ink-box-blue pushpin-node relative group${data.justCompleted ? ' creative-node-completed' : ''}`}
      style={{ width: 300, height: 360 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: 'var(--neu-blue)', width: 8, height: 8, top: -4 }}
      />
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: 'var(--neu-blue)', width: 8, height: 8, bottom: -4 }}
      />
      
      <div className="flex justify-between items-center" style={{ padding: '20px 16px', height: '76px' }}>
        <div className="neu-tag-blue" style={{ position: 'relative', top: 0, left: 0 }}>
          <div style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))' }}>
            <CreativeIcon />
          </div>
          CREATIVE
        </div>
        
        {/* Ratio Info */}
        {data.size && (
          <div className="text-xs text-gray-600 bg-white/80 rounded-lg px-2 py-1 shadow-sm">
            <div className="font-semibold">{data.size}</div>
          </div>
        )}
        
        <div className="neu-toolbar-blue" style={{ position: 'relative', top: 0, right: 0 }}>
          <button onClick={() => data.onAddConcept?.()} className="neu-button-circle-blue" title="Add Concept">
            <div style={{ filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3))' }}>
              <AddIcon />
            </div>
          </button>
          {data.imageUrl && (
            <button onClick={() => data.onImageClick?.(data.imageUrl!)} className="neu-button-circle-blue" title="View Image">
              <div style={{ filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3))' }}>
                <MagnifyingGlassIcon />
              </div>
            </button>
          )}
          <button onClick={() => data.onDeleteClick?.(id)} className="neu-button-circle-blue" title="Delete">
            <div style={{ filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3))' }}>
              <DeleteIcon />
            </div>
          </button>
        </div>
      </div>
      
      {data.justCompleted && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
      
      <div className="neu-image-container rounded-lg" style={{ 
        marginTop: '0', 
        marginBottom: '16px', 
        marginLeft: '16px', 
        marginRight: '16px', 
        borderRadius: '16px',
        aspectRatio: imageDimensions ? `${imageDimensions.width} / ${imageDimensions.height}` : 'auto'
      }}>
        {data.status === 'generating' ? (
          <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </div>
        ) : data.imageUrl ? (
          <div className="relative w-full rounded-lg overflow-hidden">
            <img
              ref={imgRef}
              src={data.imageUrl}
              alt={data.title}
              className="w-full h-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
              onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                if (img.naturalWidth && img.naturalHeight) {
                  setImageDimensions({
                    width: img.naturalWidth,
                    height: img.naturalHeight
                  });
                }
              }}
              onClick={() => {
                // 创建带水印的图片用于预览
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                  canvas.width = img.width;
                  canvas.height = img.height;
                  
                  // 绘制原图
                  ctx?.drawImage(img, 0, 0);
                  
                  if (ctx) {
                    // 图片预览（无水印）
                    
                    // 转换为 data URL 并预览
                    const watermarkedImage = canvas.toDataURL('image/jpeg', 0.95);
                    data.onImageClick?.(watermarkedImage);
                  }
                };
                
                img.onerror = () => {
                  // 如果加载失败，使用原图
                  data.onImageClick?.(data.imageUrl!);
                };
                
                img.src = data.imageUrl!;
              }}
            />
            

            
            {/* 下载按钮 */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // 创建带水印的图片并下载
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  const img = new Image();
                  
                  img.crossOrigin = 'anonymous';
                  img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // 绘制原图
                    ctx?.drawImage(img, 0, 0);
                    
                    if (ctx) {
                      // 下载图片（无水印）
                      canvas.toBlob((blob) => {
                        if (blob) {
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `${data.title.replace(/\s+/g, '_')}_creative.jpg`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(url);
                        }
                      }, 'image/jpeg', 0.95);
                    }
                  };
                  
                  img.src = data.imageUrl!;
                }}
                className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                title="Download"
              >
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-2 text-blue-400">
                <ImageIcon />
              </div>
              <div className="text-sm text-gray-600">Creative Image</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="relative">
        {!isEditingTitle && (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 neu-edit-button-blue opacity-0 group-hover:opacity-100 z-10"
            title="Edit Title"
          >
            <div style={{ filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2))' }}>
              <TitleEditIcon />
            </div>
          </button>
        )}
        
        <div 
          ref={titleRef}
          className={`neu-title outline-none ${isEditingTitle ? 'cursor-text' : 'cursor-default'}`}
          contentEditable={isEditingTitle}
          suppressContentEditableWarning={true}
          onInput={(e) => {
            if (isEditingTitle) {
              const newContent = e.currentTarget.textContent || '';
              if (newContent.length <= MAX_TITLE_LENGTH) {
                setEditTitle(newContent);
              } else {
                const truncated = newContent.substring(0, MAX_TITLE_LENGTH);
                setEditTitle(truncated);
                e.currentTarget.textContent = truncated;
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(e.currentTarget);
                range.collapse(false);
                if (selection) {
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
              }
            }
          }}
          onKeyDown={handleTitleKeyDown}
          onBlur={() => {
            if (isEditingTitle) {
              handleTitleSave();
            }
          }}
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {data.title}
        </div>
      </div>
      
      {data.status === 'error' && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        </div>
      )}
      
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#187498', borderColor: '#187498' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#187498', borderColor: '#187498' }}
      />
    </motion.div>
  );
}
