'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import { hashCode, seededRandom } from '@/utils/handdrawnStyles';

interface ProductNodeData {
  title: string;
  content: string;
  imageUrl?: string;
  status: 'idle' | 'generating' | 'completed' | 'error';
  onImageClick?: (imageUrl: string) => void;
  onAddConcept?: () => void;
  onDeleteClick?: (nodeId: string) => void;
  onTitleUpdate?: (nodeId: string, newTitle: string) => void;
}

interface ProductNodeProps {
  data: ProductNodeData;
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

const ProductIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

const ImageIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

const EditIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

export default function ProductNode({ data, id }: ProductNodeProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(data.title);
  const titleRef = useRef<HTMLDivElement>(null);
  
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

  const handleSave = () => {
    const newTitle = editTitle.trim();
    data.onTitleUpdate?.(id, newTitle);
    setIsEditingTitle(false);
  };

  const handleCancel = () => {
    setEditTitle(data.title);
    if (titleRef.current) {
      titleRef.current.textContent = data.title;
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
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
      className="neu-card ink-box-yellow pushpin-node relative group"
      style={{ width: 300, height: 360 }}
    >
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ 
          background: 'var(--neu-yellow)', 
          width: 8, 
          height: 8,
          bottom: -4
        }}
      />
      
      <div className="flex justify-between items-center" style={{ padding: '20px 16px', height: '76px' }}>
        <div className="neu-tag-yellow" style={{ position: 'relative', top: 0, left: 0 }}>
          <div style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))' }}>
            <ProductIcon />
          </div>
          PRODUCT
        </div>
        
        <div className="neu-toolbar" style={{ position: 'relative', top: 0, right: 0 }}>
          <button onClick={() => data.onAddConcept?.()} className="neu-button-circle" title="Add Concept">
            <div style={{ filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3))' }}>
              <AddIcon />
            </div>
          </button>
          {data.imageUrl && (
            <button onClick={() => data.onImageClick?.(data.imageUrl!)} className="neu-button-circle" title="View Image">
              <div style={{ filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3))' }}>
                <MagnifyingGlassIcon />
              </div>
            </button>
          )}
          <button onClick={() => data.onDeleteClick?.(id)} className="neu-button-circle" title="Delete">
            <div style={{ filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3))' }}>
              <DeleteIcon />
            </div>
          </button>
        </div>
      </div>
      
      <div className="neu-image-container rounded-lg" style={{ height: '200px', marginTop: '0', marginBottom: '16px', marginLeft: '16px', marginRight: '16px', borderRadius: '16px' }}>
        {data.imageUrl ? (
          <img
            src={data.imageUrl}
            alt={data.title}
            className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity rounded-lg"
            onClick={() => data.onImageClick?.(data.imageUrl!)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-2 text-yellow-400">
                <ImageIcon />
              </div>
              <div className="text-sm text-gray-600">Product Image</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="relative">
        {!isEditingTitle && (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 neu-edit-button opacity-0 group-hover:opacity-100 z-10"
            title="Edit Title"
          >
            <div style={{ filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2))' }}>
              <EditIcon />
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
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (isEditingTitle) {
              handleSave();
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
      
      {data.status === 'generating' && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2">
          <div className="w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#F4A261', borderColor: '#F4A261' }}
      />
    </motion.div>
  );
}
