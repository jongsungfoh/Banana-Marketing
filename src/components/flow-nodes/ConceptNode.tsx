'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import { hashCode, seededRandom } from '@/utils/handdrawnStyles';

interface ConceptNodeData {
  title: string;
  content: string;
  imageUrl?: string;
  concept?: string;
  status: 'idle' | 'generating' | 'completed' | 'error';
  isEditable?: boolean;
  autoEdit?: boolean;
  inputHandleColor?: string;
  parentGeneratedId?: string;
  parentGeneratedImageUrl?: string;
  parentProductId?: string;
  parentProductImageUrl?: string;
  onImageClick?: (imageUrl: string) => void;
  onEditClick?: (nodeId: string) => void;
  onGenerateClick?: (nodeId: string) => void;
  onDeleteClick?: (nodeId: string) => void;
  onContentUpdate?: (nodeId: string, newContent: string, newTitle?: string) => void;
  onTitleUpdate?: (nodeId: string, newTitle: string) => void;
}

interface ConceptNodeProps {
  data: ConceptNodeData;
  id: string;
}

// SVG 图标组件
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25a1.75 1.75 0 01.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM11.189 6.25L9.75 4.81l-6.286 6.287a.25.25 0 00-.064.108l-.558 1.953 1.953-.558a.249.249 0 00.108-.064l6.286-6.286z"/>
  </svg>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path d="M11 1.75V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.404 15h5.192c.9 0 1.655-.681 1.74-1.575l.66-6.6a.75.75 0 00-1.492-.15L10.844 13.5H5.156l-.66-6.825z"/>
  </svg>
);

const ConceptIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const CancelIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TitleEditIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

export default function ConceptNode({ data, id }: ConceptNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(data.content);
  const [hasAutoEditProcessed, setHasAutoEditProcessed] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(data.title);
  const titleRef = useRef<HTMLDivElement>(null);
  const MAX_TITLE_LENGTH = 25;
  
  const hash = hashCode(id + 'tag-rotation');
  const rotation = (seededRandom(hash) - 0.5) * 8;

  useEffect(() => {
    if (!isEditing) {
      setEditContent(data.content);
    }
  }, [data.content, isEditing]);

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

  useEffect(() => {
    if (data.autoEdit && !isEditing && !hasAutoEditProcessed) {
      setIsEditing(true);
      setHasAutoEditProcessed(true);
    }
  }, [data.autoEdit, isEditing, hasAutoEditProcessed]);

  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.textContent = editContent;
          contentRef.current.focus();
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(contentRef.current);
          range.collapse(false);
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }, 100);
    }
  }, [isEditing, editContent]);

  const handleSave = () => {
    const currentContent = contentRef.current?.textContent || editContent;
    data.onContentUpdate?.(id, currentContent.trim(), data.title);
    setEditContent(currentContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(data.content);
    if (contentRef.current) {
      contentRef.current.textContent = data.content || '';
    }
    setIsEditing(false);
  };

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="neu-card-green ink-box-green pushpin-node relative group"
      style={{ width: 300, height: 360 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: data.inputHandleColor || '#22c55e', width: 8, height: 8, top: -4 }}
      />
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#22c55e', width: 8, height: 8, bottom: -4 }}
      />
      
      <div className="flex justify-between items-center" style={{ padding: '20px 16px', height: '76px' }}>
        <div className="neu-tag-green" style={{ position: 'relative', top: 0, left: 0 }}>
          <div style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))' }}>
            <ConceptIcon />
          </div>
          CONCEPT
        </div>
        
        <div className="neu-toolbar-green" style={{ position: 'relative', top: 0, right: 0 }}>
          {isEditing ? (
            <>
              <button onClick={handleSave} className="neu-button-circle-green" title="Confirm">
                <div style={{ filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3))' }}>
                  <CheckIcon />
                </div>
              </button>
              <button onClick={handleCancel} className="neu-button-circle-green" title="Cancel">
                <div style={{ filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3))' }}>
                  <CancelIcon />
                </div>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="neu-button-circle-green" title="Edit">
                <div style={{ filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3))' }}>
                  <EditIcon />
                </div>
              </button>
              <button onClick={() => data.onGenerateClick?.(id)} className="neu-button-circle-green" title="Generate Creative">
                <div style={{ filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3))' }}>
                  <StarIcon />
                </div>
              </button>
              <button onClick={() => data.onDeleteClick?.(id)} className="neu-button-circle-green" title="Delete">
                <div style={{ filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3))' }}>
                  <DeleteIcon />
                </div>
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="neu-content-container" style={{ height: '200px', marginTop: '0', marginBottom: '16px', marginLeft: '16px', marginRight: '16px', borderRadius: '16px' }}>
        <div className="h-full overflow-y-auto" style={{ padding: '12px 12px 0 12px' }}>
          <div 
            ref={contentRef}
            className={`text-sm text-gray-700 leading-relaxed outline-none ${isEditing ? 'cursor-text' : 'cursor-default'}`}
            contentEditable={isEditing}
            suppressContentEditableWarning={true}
            onKeyDown={handleKeyDown}
            style={{
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              paddingBottom: '12px',
              minHeight: 'calc(100% - 12px)',
              border: 'none',
              background: 'transparent'
            }}
          >
            {!isEditing && (data.content || "点击编辑按钮来添加概念内容...")}
          </div>
        </div>
      </div>
      
      <div className="relative">
        {!isEditingTitle && (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 neu-edit-button-green opacity-0 group-hover:opacity-100 z-10"
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
      
      {data.status === 'generating' && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2">
          <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: data.inputHandleColor || '#36AE7C', borderColor: data.inputHandleColor || '#36AE7C' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#36AE7C', borderColor: '#36AE7C' }}
      />
    </motion.div>
  );
}
