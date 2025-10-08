'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { KFCKnowledgeGraph } from '@/components/KnowledgeGraph';
import type { GraphNode, NodeInsight } from '@/components/KnowledgeGraph';
import { PhotoIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
  ReactFlowInstance,
  NodeTypes,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Import custom node components
import ProductNode from './flow-nodes/ProductNode';
import ConceptNode from './flow-nodes/ConceptNode';
import CreativeNode from './flow-nodes/CreativeNode';
import OfficialVersionModal from './OfficialVersionModal';
import ImageMergeButton from './ImageMergeButton';

// Define node types outside component to prevent re-creation
const nodeTypes: NodeTypes = {
  product: ProductNode,
  concept: ConceptNode,
  creative: CreativeNode,
};

// Interface definitions
interface AdCreativeCanvasProps {
  projectId?: string | null;
}

interface AnalysisStep {
  step: string;
  analysis: string;
}

interface ProductAnalysis {
  summary: string;
  creative_prompts: {
    concept: string;
    prompt: string;
    rationale: string;
    background?: string;
    include_model?: boolean;
  }[];
  reasoning_steps: AnalysisStep[];
}

function AdCreativeCanvasReactFlow({ projectId: initialProjectId = null }: AdCreativeCanvasProps) {
  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  // Debug: Expose React Flow instance to window for debugging
  useEffect(() => {
    if (reactFlowInstance && typeof window !== 'undefined') {
      (window as any).reactFlowInstance = reactFlowInstance;
    }
  }, [reactFlowInstance]);

  // Debug: Track edges changes
  useEffect(() => {
    console.log('🔗 Edges state changed:', {
      edgesLength: edges.length,
      edges: edges.map(e => `${e.source} -> ${e.target}`)
    });
  }, [edges]);
  
  // Component states
  const [projectId, setProjectId] = useState<string | null>(initialProjectId);
  const [projectName, setProjectName] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [isSavingCanvas, setIsSavingCanvas] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en-us' | 'zh-cn'>('en-us');
  const [projectNotFound, setProjectNotFound] = useState(false);
  
  // Combine Mode state
  const [combineMode, setCombineMode] = useState(false);
  
  // Knowledge Graph state
  const [showKnowledgeGraph, setShowKnowledgeGraph] = useState(false);

  // Debug: Track combine mode changes
  useEffect(() => {
    console.log('🔄 Combine Mode changed:', combineMode ? 'ON' : 'OFF');
  }, [combineMode]);
  
  // Use ref to always access latest nodes and edges state
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);
  
  // Upload and analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [reasoningSteps, setReasoningSteps] = useState<AnalysisStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  
  // Image preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [productImagePath, setProductImagePath] = useState<string>('');
  
  // Add Product functionality
  const [showProductUpload, setShowProductUpload] = useState(false);
  const [isUploadingProduct, setIsUploadingProduct] = useState(false);
  
  // Official Version Modal
  const [showOfficialModal, setShowOfficialModal] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const productUploadRef = useRef<HTMLInputElement>(null);
  const canvasLoadRef = useRef<HTMLInputElement>(null);
  const analysisScrollRef = useRef<HTMLDivElement>(null);

  // 从 localStorage 读取语言设定
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as 'en-us' | 'zh-cn' | null;
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
      }
    }
  }, []);

  // 监听语言变化
  useEffect(() => {
    const handleLanguageChange = () => {
      if (typeof window !== 'undefined') {
        const savedLanguage = localStorage.getItem('language') as 'en-us' | 'zh-cn' | null;
        if (savedLanguage) {
          setCurrentLanguage(savedLanguage);
        }
      }
    };

    window.addEventListener('storage', handleLanguageChange);
    window.addEventListener('languageChange', handleLanguageChange);

    return () => {
      window.removeEventListener('storage', handleLanguageChange);
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, []);

  // 翻译对象
  const t = {
    'en-us': {
      uploadProduct: 'Upload Your Product',
      dragDropText: 'Drag & drop your product image here, or click to select a file.',
      aiCreativeStrategist: 'AI Creative Strategist',
      fileSupport: 'Supports JPG, PNG only • Max 10MB',
      dropImageHere: 'Drop your product image here...',
      save: 'Save',
      saving: 'Saving...',
      analyzing: 'Analyzing',
      generationFailed: 'Generation failed',
      projectLoadFailed: 'Project load failed',
      analysisFailed: 'Analysis failed',
      loadingProject: 'Loading project...',
      projectNotFound: 'Project Not Found',
      projectNotFoundMessage: 'The requested project does not exist or you do not have permission to access it.',
      backToCampaigns: 'Back to Campaigns',
      apiKeyRequired: 'API Key Required',
      pleaseEnterApiKey: 'Please enter your Gemini API Key in the header'
    },
    'zh-cn': {
      uploadProduct: '上传产品图片',
      dragDropText: '拖拽或点击选择文件',
      aiCreativeStrategist: 'AI 创意策略师',
      fileSupport: '支持 JPG, PNG，最大 10MB',
      dropImageHere: '在这里放置您的产品图片...',
      save: '保存',
      saving: '保存中...',
      analyzing: '分析中',
      generationFailed: '生成失败',
      projectLoadFailed: '项目加载失败',
      analysisFailed: '分析失败',
      loadingProject: '加载项目中...',
      projectNotFound: '找不到项目',
      projectNotFoundMessage: '请求的项目不存在或您没有访问权限。',
      backToCampaigns: '返回活动',
      apiKeyRequired: '需要 API 密钥',
      pleaseEnterApiKey: '请在右上角输入您的 Gemini API 密钥'
    }
  };

  // Get API Key from localStorage
  const getApiKey = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gemini_api_key') || '';
    }
    return '';
  }, []);

  // Stable event handler references - defined first
  const stableHandleImageClick = useCallback((imageUrl: string) => {
    setPreviewImage(imageUrl);
  }, []);

  const stableHandleEditClick = useCallback((nodeId: string) => {
    // TODO: Implement edit functionality
    console.log('Edit clicked for node:', nodeId);
  }, []);

  const stableHandleDeleteClick = useCallback((nodeId: string) => {
    console.log('🚨 DELETE FUNCTION CALLED! NodeId:', nodeId);
    
    // Use ref to get latest state
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;
    
    console.log('🔗 Current edges state (from ref):', currentEdges);
    console.log('🔗 Edges length (from ref):', currentEdges.length);
    
    // Find the node to get its title for the confirmation message
    const nodeToDelete = currentNodes.find(node => node.id === nodeId);
    const nodeTitle = nodeToDelete?.data?.title || 'this node';
    const nodeType = nodeToDelete?.type === 'concept' ? 'concept' : 
                     nodeToDelete?.type === 'creative' ? 'creative image' : 
                     nodeToDelete?.type === 'product' ? 'product image' : 'node';
    
    // Check if there are any nodes connected from this node (downstream connections)
    const downstreamEdges = currentEdges.filter(edge => edge.source === nodeId);
    const hasDownstreamConnections = downstreamEdges.length > 0;
    
    console.log('🗑️ Delete Check Details:');
    console.log('  - Node to delete:', nodeId, nodeTitle);
    console.log('  - All edges:', currentEdges.map(e => `${e.source} -> ${e.target}`));
    console.log('  - Downstream edges (from this node):', downstreamEdges.map(e => `${e.source} -> ${e.target}`));
    console.log('  - Has downstream connections:', hasDownstreamConnections);
    console.log('  - Should block deletion:', hasDownstreamConnections);
    
    if (hasDownstreamConnections) {
      alert(`Cannot delete the ${nodeType} "${nodeTitle}" because it has connected nodes below it. Please delete the connected nodes first.`);
      return;
    }
    
    const confirmDelete = confirm(`Are you sure you want to delete the ${nodeType} "${nodeTitle}"? This action cannot be undone.`);
    
    if (!confirmDelete) return;
    
    // Remove the node and its edges from the canvas
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setEdges(prev => prev.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const stableHandleContentUpdate = useCallback((nodeId: string, newContent: string, newTitle?: string) => {
    // Debug: Print content update
    console.log('📝 Concept Content Updated:', {
      nodeId,
      newContent,
      newTitle,
      timestamp: new Date().toLocaleTimeString()
    });
    
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? {
        ...node,
        data: {
          ...node.data,
          content: newContent,
          autoEdit: false, // Clear autoEdit flag after save
          ...(newTitle && { title: newTitle, concept: newTitle })
        }
      } : node
    ));
  }, [setNodes]);

  const stableHandleTitleUpdate = useCallback((nodeId: string, newTitle: string) => {
    // Debug: Print title update
    console.log('🏷️ Node Title Updated:', {
      nodeId,
      newTitle,
      timestamp: new Date().toLocaleTimeString()
    });
    
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? {
        ...node,
        data: {
          ...node.data,
          title: newTitle,
          // For concept nodes, also update the concept field
          ...(node.type === 'concept' && { concept: newTitle })
        }
      } : node
    ));
  }, [setNodes]);

  // 图片生成
  const executeGenerateImage = useCallback(async (conceptId: string) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.error('API Key required');
      return;
    }

    const currentNodes = nodesRef.current;
    const conceptNode = currentNodes.find((n: Node) => n.id === conceptId);
    
    if (!conceptNode) return;

    // 更新概念节点状态为 generating
    setNodes(prev => prev.map(node => 
      node.id === conceptId 
        ? { ...node, data: { ...node.data, status: 'generating' } }
        : node
    ));

    // 创建新的 creative 节点
    const creativeNodeId = `creative-${Date.now()}`;
    const newNode: Node = {
      id: creativeNodeId,
      type: 'creative',
      position: {
        x: conceptNode.position.x,
        y: conceptNode.position.y + 450,
      },
      data: {
        title: `${conceptNode.data.concept} Creative`,
        content: conceptNode.data.content,
        status: 'generating',
        concept: conceptNode.data.concept,
        parentConceptId: conceptNode.id, // ✅ 设置父 Concept ID，用于追溯产品来源
        onImageClick: stableHandleImageClick,
        onDeleteClick: stableHandleDeleteClick,
        onAddConcept: () => handleAddConceptFromCreative(creativeNodeId),
        onTitleUpdate: stableHandleTitleUpdate,
      }
    };

    setNodes(prev => [...prev, newNode]);

    // 创建连接线
    const newEdge: Edge = {
      id: `edge-${conceptId}-${creativeNodeId}`,
      source: conceptId,
      target: creativeNodeId,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#36AE7C', strokeWidth: 2 },
    };

    setEdges(prev => [...prev, newEdge]);

    try {
      // 产品图片：优先使用 parentProductImageUrl，否则使用第一个产品节点
      let productImagePath = '';
      if (conceptNode.data.parentProductImageUrl) {
        // 如果 Concept 有记录特定 Product，使用该 Product 的图片
        productImagePath = conceptNode.data.parentProductImageUrl;
      } else {
        // 否则使用第一个产品节点（向后兼容）
        const productNode = currentNodes.find((n: Node) => n.type === 'product');
        productImagePath = productNode?.data?.imageUrl || '';
      }
      
      // 取得 parent Generated Node 的图片路径（如果存在）
      const parentGeneratedImagePath = conceptNode.data.parentGeneratedImageUrl || '';
      
      // 构建prompt，如果是知识图谱节点则加入无文字指示
      let finalPrompt = conceptNode.data.content;
      if (conceptNode.data.fromKnowledgeGraph) {
        finalPrompt += `\n\nImportant: The generated image content must not contain any text (including Chinese, English or other languages), please only use visual elements, images, symbols, no text content.`;
      }

      const requestData = {
        prompt_data: {
          concept: conceptNode.data.concept || conceptNode.data.title,
          prompt: finalPrompt
        },
        product_image_path: productImagePath, // 智能选择的产品图片
        generated_image_path: parentGeneratedImagePath, // 包含 parent Generated 图片（如果存在）
        size: '1:1',
        language: currentLanguage === 'zh-cn' ? 'zh' : 'en',
        api_key: apiKey
      };
      
      // Debug: Print the prompt being sent
      console.log('🎨 Generating image with data:', {
        concept: requestData.prompt_data.concept,
        prompt: requestData.prompt_data.prompt.substring(0, 100) + '...',
        hasProductImage: !!productImagePath,
        hasGeneratedImage: !!parentGeneratedImagePath,
        productImageSource: conceptNode.data.parentProductImageUrl ? 'parentProductImageUrl' : 'first product node'
      });

      const response = await fetch('/api/generate-creative-from-concept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success && data.image_url) {
        // 更新 creative 节点
        setNodes(prev => prev.map(node => 
          node.id === creativeNodeId 
            ? { 
                ...node, 
                data: { 
                  ...node.data, 
                  imageUrl: data.image_url,
                  status: 'completed',
                  justCompleted: true
                } 
              }
            : node
        ));

        // 更新概念节点状态
        setNodes(prev => prev.map(node => 
          node.id === conceptId 
            ? { ...node, data: { ...node.data, status: 'completed' } }
            : node
        ));

        console.log('Image generated successfully');

        // 移除 justCompleted 标记
        setTimeout(() => {
          setNodes(prev => prev.map(node => 
            node.id === creativeNodeId 
              ? { ...node, data: { ...node.data, justCompleted: false } }
              : node
          ));
        }, 3000);
      } else {
        throw new Error(data.error || '生成失败');
      }
    } catch (error) {
      console.error('生成图片失败:', error);
      console.error('Generation failed');

      // 更新状态为错误
      setNodes(prev => prev.map(node => {
        if (node.id === creativeNodeId) {
          return { ...node, data: { ...node.data, status: 'error' } };
        }
        if (node.id === conceptId) {
          return { ...node, data: { ...node.data, status: 'idle' } };
        }
        return node;
      }));
    }
  }, [currentLanguage, getApiKey, stableHandleImageClick, stableHandleDeleteClick, stableHandleTitleUpdate]);

  // Generate image function that calls executeGenerateImage
  const stableHandleGenerateImage = useCallback((conceptId: string) => {
    // 直接生成图片，跳过确认modal
    console.log('🎨 Generating image directly without confirmation modal');
    executeGenerateImage(conceptId);
  }, [executeGenerateImage]);

  // 从 Creative 节点新增概念
  const handleAddConceptFromCreative = useCallback((creativeId: string) => {
    const creativeNode = nodesRef.current.find(n => n.id === creativeId);
    if (!creativeNode) return;

    const newConceptId = `concept-${Date.now()}`;

    const newConceptNode: Node = {
      id: newConceptId,
      type: 'concept',
      position: {
        x: creativeNode.position.x,
        y: creativeNode.position.y + 450,
      },
      data: {
        title: 'New Concept',
        content: 'Enter concept description...',
        concept: 'New Concept',
        status: 'completed',
        autoEdit: true,
        inputHandleColor: '#187498',
        parentGeneratedId: creativeId,
        parentGeneratedImageUrl: creativeNode.data.imageUrl,
        // 追溯原始 Product 图片
        parentProductImageUrl: (() => {
          // 追溯这个 Creative Node 来源于哪个 Product
        // 1. 首先找到这个 Creative Node 的父 Concept
        const currentNodes = nodesRef.current;
        const parentConceptId = creativeNode.data.parentConceptId;
        
        if (parentConceptId) {
          const parentConcept = currentNodes.find((n: Node) => n.id === parentConceptId);
          if (parentConcept?.data?.parentProductImageUrl) {
            // 使用父 Concept 追踪的特定产品图片
            return parentConcept.data.parentProductImageUrl;
          }
        }
        // 2. 回退逻辑：如果找不到特定产品，使用第一个产品节点
        const productNode = currentNodes.find((n: Node) => n.type === 'product');
        return productNode?.data?.imageUrl || '';
        })(),
        onImageClick: stableHandleImageClick,
        onEditClick: stableHandleEditClick,
        onGenerateClick: stableHandleGenerateImage,
        onDeleteClick: stableHandleDeleteClick,
        onContentUpdate: stableHandleContentUpdate,
        onTitleUpdate: stableHandleTitleUpdate,
      }
    };

    setNodes(prev => [...prev, newConceptNode]);

    const newEdge: Edge = {
      id: `edge-${creativeId}-${newConceptId}`,
      source: creativeId,
      target: newConceptId,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#187498', strokeWidth: 2 },
    };

    setEdges(prev => [...prev, newEdge]);
  }, [stableHandleImageClick, stableHandleEditClick, stableHandleGenerateImage, stableHandleDeleteClick, stableHandleContentUpdate, stableHandleTitleUpdate]);

  // Create initial flow from analysis data
  const createInitialFlow = useCallback((analysis: ProductAnalysis, productImageUrl: string, fileName?: string) => {
    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];
    
    // Create product node
    const productNode: Node = {
      id: 'product',
      type: 'product',
      position: { x: 400, y: 100 },
      data: {
        title: fileName || 'Product Image',
        content: analysis.summary,
        imageUrl: productImageUrl,
        status: 'completed',
        onImageClick: stableHandleImageClick,
        onDeleteClick: stableHandleDeleteClick,
        onTitleUpdate: stableHandleTitleUpdate,
        onAddConcept: () => {
          // Inline add concept function to avoid circular dependency
          const timestamp = Date.now();
          const newConceptId = `concept-${timestamp}`;
          
          setNodes(prev => {
            const existingConcepts = prev.filter(node => node.type === 'concept');
            const conceptIndex = existingConcepts.length;
            
            const newConceptNode: Node = {
              id: newConceptId,
              type: 'concept',
              position: {
                x: 400 + (conceptIndex - 2) * 320,
                y: 500,
              },
              data: {
                title: 'New Concept',
                content: 'Enter concept description...',
                concept: 'New Concept',
                status: 'completed' as const,
                autoEdit: true,
                inputHandleColor: '#F4A261',
                parentProductId: 'product',
                parentProductImageUrl: productImageUrl,
                onImageClick: stableHandleImageClick,
                onEditClick: stableHandleEditClick,
                onGenerateClick: stableHandleGenerateImage,
                onDeleteClick: stableHandleDeleteClick,
                onContentUpdate: stableHandleContentUpdate,
                onTitleUpdate: stableHandleTitleUpdate,
              },
            };
            
            return [...prev, newConceptNode];
          });
          
          setEdges(prev => {
            const newEdge: Edge = {
              id: `product-${newConceptId}`,
              source: 'product',
              target: newConceptId,
              type: 'smoothstep',
              animated: true,
              className: 'edge-product',
              style: { 
                stroke: '#F4A261', 
                strokeWidth: 2,
                strokeDasharray: '5,5'
              },
            };
            
            return [...prev, newEdge];
          });
        },
      },
    };
    initialNodes.push(productNode);
    
    // Create concept nodes
    analysis.creative_prompts.forEach((prompt, index) => {
      const conceptNode: Node = {
        id: `concept-${index}`,
        type: 'concept',
        position: {
          x: 400 + (index - 2) * 320, // Spread horizontally
          y: 500,
        },
        data: {
          title: prompt.concept,
          content: prompt.prompt,
          concept: prompt.concept,
          status: 'completed',
          inputHandleColor: '#F4A261',
          onImageClick: stableHandleImageClick,
          onEditClick: stableHandleEditClick,
          onGenerateClick: stableHandleGenerateImage,
          onDeleteClick: stableHandleDeleteClick,
          onContentUpdate: stableHandleContentUpdate,
          onTitleUpdate: stableHandleTitleUpdate,
        },
      };
      initialNodes.push(conceptNode);
      
      // Create edge from product to concept
      initialEdges.push({
        id: `product-concept-${index}`,
        source: 'product',
        target: `concept-${index}`,
        type: 'smoothstep',
        animated: true,
        className: 'edge-product',
        style: { 
          stroke: '#F4A261', 
          strokeWidth: 2,
          strokeDasharray: '5,5'
        },
      });
    });
    
    setNodes(initialNodes);
    setEdges(initialEdges);
    setAnalysisComplete(true);
    
    // Auto-fit view after a short delay
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: 50 });
      }
    }, 100);
  }, [setNodes, setEdges, reactFlowInstance, stableHandleImageClick, stableHandleEditClick, stableHandleGenerateImage, stableHandleDeleteClick, stableHandleContentUpdate, stableHandleTitleUpdate]);

  // Create additional product flow (for Add Product button)
  const createAdditionalProductFlow = useCallback((analysis: ProductAnalysis, productImageUrl: string, fileName: string, position: { x: number, y: number }) => {
    // 创建新的 Product 节点（使用指定位置）
    const newProductId = `product-${Date.now()}`;
    const productNode: Node = {
      id: newProductId,
      type: 'product',
      position: position,
      data: {
        title: fileName || 'Product Image',
        content: analysis.summary,
        imageUrl: productImageUrl,
        status: 'completed',
        onImageClick: stableHandleImageClick,
        onDeleteClick: stableHandleDeleteClick,
        onTitleUpdate: stableHandleTitleUpdate,
        onAddConcept: () => {
          // Inline add concept function for this specific product
          const timestamp = Date.now();
          const newConceptId = `concept-${timestamp}`;
          
          setNodes(prev => {
            const existingConceptsForThisProduct = prev.filter(node => 
              node.type === 'concept' && node.data.parentProductId === newProductId
            );
            const conceptIndex = existingConceptsForThisProduct.length;
            
            const newConceptNode: Node = {
              id: newConceptId,
              type: 'concept',
              position: {
                x: position.x + (conceptIndex - 2) * 320,
                y: position.y + 400,
              },
              data: {
                title: 'New Concept',
                content: 'Enter concept description...',
                concept: 'New Concept',
                status: 'completed' as const,
                autoEdit: true,
                inputHandleColor: '#F4A261',
                parentProductId: newProductId,
                parentProductImageUrl: productImageUrl,
                onImageClick: stableHandleImageClick,
                onEditClick: stableHandleEditClick,
                onGenerateClick: stableHandleGenerateImage,
                onDeleteClick: stableHandleDeleteClick,
                onContentUpdate: stableHandleContentUpdate,
                onTitleUpdate: stableHandleTitleUpdate,
              },
            };
            
            return [...prev, newConceptNode];
          });
          
          setEdges(prev => {
            const newEdge: Edge = {
              id: `${newProductId}-${newConceptId}`,
              source: newProductId,
              target: newConceptId,
              type: 'smoothstep',
              animated: true,
              className: 'edge-product',
              style: { 
                stroke: '#F4A261', 
                strokeWidth: 2,
                strokeDasharray: '5,5'
              },
            };
            
            return [...prev, newEdge];
          });
        },
      },
    };

    // 创建概念节点（基于新产品的位置）
    const conceptNodes = analysis.creative_prompts.map((prompt, index) => ({
      id: `${newProductId}-concept-${index}`,
      type: 'concept',
      position: {
        x: position.x + (index - 2) * 320,
        y: position.y + 400,
      },
      data: {
        title: prompt.concept,
        content: prompt.prompt,
        concept: prompt.concept,
        status: 'completed',
        inputHandleColor: '#F4A261',
        parentProductId: newProductId,
        parentProductImageUrl: productImageUrl,
        onImageClick: stableHandleImageClick,
        onEditClick: stableHandleEditClick,
        onGenerateClick: stableHandleGenerateImage,
        onDeleteClick: stableHandleDeleteClick,
        onContentUpdate: stableHandleContentUpdate,
        onTitleUpdate: stableHandleTitleUpdate,
      },
    }));

    // 创建连接线
    const conceptEdges = analysis.creative_prompts.map((prompt, index) => ({
      id: `${newProductId}-concept-${index}`,
      source: newProductId,
      target: `${newProductId}-concept-${index}`,
      type: 'smoothstep',
      animated: true,
      className: 'edge-product',
      style: { 
        stroke: '#F4A261', 
        strokeWidth: 2,
        strokeDasharray: '5,5'
      },
    }));

    // 一次性添加所有节点和连接线
    setNodes(prev => {
      const newNodes = [...prev, productNode, ...conceptNodes];
      console.log('🔄 Adding nodes:', {
        previousCount: prev.length,
        newCount: newNodes.length,
        addedProductId: newProductId,
        addedConceptIds: conceptNodes.map(n => n.id)
      });
      return newNodes;
    });
    setEdges(prev => [...prev, ...conceptEdges]);
    
    console.log('✅ Additional product flow created');
  }, [setNodes, setEdges, stableHandleImageClick, stableHandleEditClick, stableHandleGenerateImage, stableHandleDeleteClick, stableHandleContentUpdate, stableHandleTitleUpdate]);

  // 产品图片上传处理
  const handleFileUpload = useCallback(async (file: File) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.error('API Key required');
      return;
    }

    setIsAnalyzing(true);
    setReasoningSteps([]);
    setCurrentStep(-1); // 初始设为 -1，表示没有步骤完成

    try {
      // 先将图片转换为 base64 以便立即显示
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result as string;
        setProductImagePath(base64Image); // 立即设定产品图片路径
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('product_image', file);
      formData.append('language', currentLanguage);
      formData.append('api_key', apiKey);

      const response = await fetch('/api/analyze-product', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // 更新为 API 返回的图片 URL（如果不同）
        if (data.product_image_url) {
          setProductImagePath(data.product_image_url);
        }
        
        // Start reasoning simulation if we have steps
        if (data.reasoning_steps && data.reasoning_steps.length > 0) {
          console.log('🎯 Starting reasoning simulation with', data.reasoning_steps.length, 'steps');
          
          const simulateReasoning = (steps: AnalysisStep[]) => {
            console.log('🔧 Setting reasoning steps:', steps);
            setReasoningSteps([...steps]); // 使用 spread operator 确保 React 检测到状态变化
            setCurrentStep(-1); // 先设为 -1，确保所有步骤初始为未完成状态
            
            let stepIndex = 0;
            const showNextStep = () => {
              if (stepIndex < steps.length) {
                console.log(`🎯 Showing step ${stepIndex + 1}/${steps.length}:`, steps[stepIndex]);
                setCurrentStep(stepIndex); // 设置当前步骤
                stepIndex++;
                setTimeout(showNextStep, 1500); // Show each step for 1.5 seconds
              } else {
                console.log('🏁 All reasoning steps completed');
                // 推理步骤完成后，等3秒再关闭分析覆蓋層并创建节点
                setTimeout(() => {
                  console.log('🎯 推理展示完成，准备创建节点...');
                  // Create the initial flow with analysis data
                  const analysisData = {
                    summary: data.analysis || 'Product analyzed',
                    creative_prompts: data.creative_prompts || [],
                    reasoning_steps: data.reasoning_steps || []
                  };
                  console.log('🎯 创建节点数据：', analysisData.creative_prompts);
                  createInitialFlow(analysisData, data.product_image_url || URL.createObjectURL(file), file.name);
                  console.log('🎯 关闭分析覆盖层');
                  setIsAnalyzing(false); // 现在才关闭分析覆盖层
                }, 3000);
              }
            };
            
            // 稍微延迟开始，确保 reasoningSteps 状态已更新
            setTimeout(showNextStep, 100);
          };
          
          simulateReasoning(data.reasoning_steps);
        } else {
          // 如果没有推理步骤，直接创建节点
          const analysisData = {
            summary: data.analysis || 'Product analyzed',
            creative_prompts: data.creative_prompts || [],
            reasoning_steps: data.reasoning_steps || []
          };
          createInitialFlow(analysisData, data.product_image_url || URL.createObjectURL(file), file.name);
          setIsAnalyzing(false);
        }
      } else {
        console.error(data.error || 'Analysis failed');
        setIsAnalyzing(false); // 只在错误时关闭
      }
    } catch (error) {
      console.error('分析产品失败:', error);
      console.error('Error analyzing product');
      setIsAnalyzing(false); // 只在错误时关闭
    }
  }, [currentLanguage, getApiKey, createInitialFlow]);

  // 节点操作函数
  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setEdges(prev => prev.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const handleTitleUpdate = useCallback((nodeId: string, newTitle: string) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, title: newTitle } }
        : node
    ));
  }, [setNodes]);

  const handleContentUpdate = useCallback((nodeId: string, newContent: string, newTitle?: string) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { 
            ...node, 
            data: { 
              ...node.data, 
              content: newContent,
              ...(newTitle && { title: newTitle })
            } 
          }
        : node
    ));
  }, [setNodes]);

  const handleAddConceptFromProduct = useCallback((productId: string) => {
    const productNode = nodesRef.current.find(n => n.id === productId);
    if (!productNode) return;

    const existingConcepts = nodesRef.current.filter(n => 
      n.type === 'concept' && 
      n.data.parentProductId === productId
    );

    const newConceptId = `concept-${Date.now()}`;
    const row = Math.floor(existingConcepts.length / 3);
    const col = existingConcepts.length % 3;

    const newConceptNode: Node = {
      id: newConceptId,
      type: 'concept',
      position: {
        x: 100 + col * 320,
        y: 500 + row * 400,
      },
      data: {
        title: 'New Concept',
        content: 'Enter concept description...',
        concept: 'New Concept',
        status: 'idle',
        autoEdit: true,
        inputHandleColor: '#F4A261',
        parentProductId: productId,
        parentProductImageUrl: productNode.data.imageUrl,
        onEditClick: () => {},
        onGenerateClick: (nodeId: string) => stableHandleGenerateImage(nodeId),
        onDeleteClick: handleDeleteNode,
        onContentUpdate: handleContentUpdate,
        onTitleUpdate: handleTitleUpdate,
      }
    };

    setNodes(prev => [...prev, newConceptNode]);

    const newEdge: Edge = {
      id: `edge-${productId}-${newConceptId}`,
      source: productId,
      target: newConceptId,
      type: 'default',
      animated: false,
      style: { stroke: '#F4A261', strokeWidth: 2 },
    };

    setEdges(prev => [...prev, newEdge]);
  }, [stableHandleGenerateImage, handleDeleteNode, handleContentUpdate, handleTitleUpdate]);

  // 文件处理
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    setIsDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);


  // Handle product upload from URL (for merged images)
  const handleProductUploadFromUrl = useCallback(async (imageUrl: string, fileName: string) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.error('API Key required');
      return;
    }

    // Calculate new Product node position (within canvas, avoid overlap)
    const existingProductNodes = nodesRef.current.filter(n => n.type === 'product');
    const newPosition = {
      x: 400 + (existingProductNodes.length * 500), // Center of canvas, horizontal arrangement
      y: 100
    };
    
    console.log('🆕 Adding new product from URL:', {
      existingProductCount: existingProductNodes.length,
      newPosition: newPosition,
      fileName: fileName,
      imageUrl: imageUrl.substring(0, 50) + '...'
    });

    // Call complete analysis flow, but specify new position
    setIsAnalyzing(true);
    setReasoningSteps([]);
    setCurrentStep(-1);

    try {
      // Use the image URL directly
      setProductImagePath(imageUrl);

      // Create a FormData with the image URL
      const formData = new FormData();
      formData.append('image_url', imageUrl);
      formData.append('language', currentLanguage);
      formData.append('api_key', apiKey);

      const response = await fetch('/api/analyze-product', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Update with API returned image URL (if different)
        if (data.product_image_url) {
          setProductImagePath(data.product_image_url);
        }
        
        // Start reasoning simulation if we have steps
        if (data.reasoning_steps && data.reasoning_steps.length > 0) {
          console.log('🎯 Starting reasoning simulation for new product with', data.reasoning_steps.length, 'steps');
          
          const simulateReasoning = (steps: AnalysisStep[]) => {
            console.log('🔧 Setting reasoning steps for new product:', steps);
            setReasoningSteps([...steps]);
            setCurrentStep(-1);
            
            let stepIndex = 0;
            const showNextStep = () => {
              if (stepIndex < steps.length) {
                console.log(`🎯 Showing step ${stepIndex + 1}/${steps.length}:`, steps[stepIndex]);
                setCurrentStep(stepIndex);
                stepIndex++;
                setTimeout(showNextStep, 1500);
              } else {
                console.log('🏁 All reasoning steps completed for new product');
                setTimeout(() => {
                  console.log('🎯 Creating additional product nodes...');
                  
                  // Create new product node (using calculated position)
                  const analysisData = {
                    summary: data.analysis || 'Product analyzed',
                    creative_prompts: data.creative_prompts || [],
                    reasoning_steps: data.reasoning_steps || []
                  };
                  
                  createAdditionalProductFlow(analysisData, data.product_image_url || imageUrl, fileName, newPosition);
                  setIsAnalyzing(false);
                }, 3000);
              }
            };
            
            setTimeout(showNextStep, 100);
          };
          
          simulateReasoning(data.reasoning_steps);
        } else {
          // If no reasoning steps, create node directly
          const analysisData = {
            summary: data.analysis || 'Product analyzed',
            creative_prompts: data.creative_prompts || [],
            reasoning_steps: data.reasoning_steps || []
          };
          createAdditionalProductFlow(analysisData, data.product_image_url || imageUrl, fileName, newPosition);
          setIsAnalyzing(false);
        }
      } else {
        console.error(data.error || 'Analysis failed');
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error('Failed to analyze new product:', error);
      console.error('Error analyzing new product');
      setIsAnalyzing(false);
    }
  }, [currentLanguage, getApiKey, createAdditionalProductFlow]);

  // Handle product upload with full analysis (for Add Product button)
  const handleSimpleProductUpload = useCallback(async (file: File) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.error('API Key required');
      return;
    }

    // 关闭 Modal 先
    setShowProductUpload(false);
    
    // 计算新 Product 节点的位置 (在画布内，避免重叠)
    const existingProductNodes = nodesRef.current.filter(n => n.type === 'product');
    const newPosition = {
      x: 400 + (existingProductNodes.length * 500), // 在画布中央，水平排列
      y: 100
    };
    
    console.log('🆕 Adding new product with analysis:', {
      existingProductCount: existingProductNodes.length,
      newPosition: newPosition,
      fileName: file.name
    });

    // 调用完整的分析流程，但指定新位置
    setIsAnalyzing(true);
    setReasoningSteps([]);
    setCurrentStep(-1);

    try {
      // 先将图片转换为 base64 以便立即显示
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result as string;
        setProductImagePath(base64Image);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('product_image', file);
      formData.append('language', currentLanguage);
      formData.append('api_key', apiKey);

      const response = await fetch('/api/analyze-product', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // 更新为 API 返回的图片 URL（如果不同）
        if (data.product_image_url) {
          setProductImagePath(data.product_image_url);
        }
        
        // Start reasoning simulation if we have steps
        if (data.reasoning_steps && data.reasoning_steps.length > 0) {
          console.log('🎯 Starting reasoning simulation for new product with', data.reasoning_steps.length, 'steps');
          
          const simulateReasoning = (steps: AnalysisStep[]) => {
            console.log('🔧 Setting reasoning steps for new product:', steps);
            setReasoningSteps([...steps]);
            setCurrentStep(-1);
            
            let stepIndex = 0;
            const showNextStep = () => {
              if (stepIndex < steps.length) {
                console.log(`🎯 Showing step ${stepIndex + 1}/${steps.length}:`, steps[stepIndex]);
                setCurrentStep(stepIndex);
                stepIndex++;
                setTimeout(showNextStep, 1500);
              } else {
                console.log('🏁 All reasoning steps completed for new product');
                setTimeout(() => {
                  console.log('🎯 Creating additional product nodes...');
                  
                  // 创建新的产品节点（使用计算好的位置）
                  const analysisData = {
                    summary: data.analysis || 'Product analyzed',
                    creative_prompts: data.creative_prompts || [],
                    reasoning_steps: data.reasoning_steps || []
                  };
                  
                  createAdditionalProductFlow(analysisData, data.product_image_url || URL.createObjectURL(file), file.name, newPosition);
                  setIsAnalyzing(false);
                }, 3000);
              }
            };
            
            setTimeout(showNextStep, 100);
          };
          
          simulateReasoning(data.reasoning_steps);
        } else {
          // 如果没有推理步骤，直接创建节点
          const analysisData = {
            summary: data.analysis || 'Product analyzed',
            creative_prompts: data.creative_prompts || [],
            reasoning_steps: data.reasoning_steps || []
          };
          createAdditionalProductFlow(analysisData, data.product_image_url || URL.createObjectURL(file), file.name, newPosition);
          setIsAnalyzing(false);
        }
      } else {
        console.error(data.error || 'Analysis failed');
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error('分析新产品失败:', error);
      console.error('Error analyzing new product');
      setIsAnalyzing(false);
    }
  }, [currentLanguage, getApiKey, createAdditionalProductFlow]);

  // Knowledge Graph 处理
  const handleKnowledgeGraphNodeClick = useCallback((nodeData: GraphNode, insight?: NodeInsight) => {
    if (!productImagePath) {
      console.warn('Please upload product image first');
      return;
    }

    const newConceptId = `concept-kg-${Date.now()}`;
    const productNode = nodesRef.current.find(n => n.type === 'product');
    
    if (!productNode) return;

    const existingKGConcepts = nodesRef.current.filter(n => 
      n.id.startsWith('concept-kg-')
    );

    const newConceptNode: Node = {
      id: newConceptId,
      type: 'concept',
      position: {
        x: 100 + (existingKGConcepts.length % 3) * 320,
        y: 500 + Math.floor(existingKGConcepts.length / 3) * 400,
      },
      data: {
        title: nodeData.name,
        content: insight?.summary || `基于知识图谱节点：${nodeData.name}`,
        concept: nodeData.name,
        status: 'idle',
        fromKnowledgeGraph: true,
        inputHandleColor: '#F4A261',
        parentProductId: productNode.id,
        parentProductImageUrl: productImagePath,
        onEditClick: () => {},
        onGenerateClick: (nodeId: string) => stableHandleGenerateImage(nodeId),
        onDeleteClick: handleDeleteNode,
        onContentUpdate: handleContentUpdate,
        onTitleUpdate: handleTitleUpdate,
      }
    };

    setNodes(prev => [...prev, newConceptNode]);

    const newEdge: Edge = {
      id: `edge-${productNode.id}-${newConceptId}`,
      source: productNode.id,
      target: newConceptId,
      type: 'default',
      animated: false,
      style: { stroke: '#F4A261', strokeWidth: 2 },
    };

    setEdges(prev => [...prev, newEdge]);
    setShowKnowledgeGraph(false);
    
    console.log(`Added concept: ${nodeData.name}`);
  }, [productImagePath, stableHandleGenerateImage, handleDeleteNode, handleContentUpdate, handleTitleUpdate]);

  // 项目名称编辑（开源版本移除存储功能）
  const handleSaveProjectName = useCallback(() => {
    if (!tempName.trim()) return;
    setProjectName(tempName.trim());
    setIsEditingName(false);
    // 开源版本不存储到后端
  }, [tempName]);

  const handleCancelProjectNameEdit = useCallback(() => {
    setTempName(projectName);
    setIsEditingName(false);
  }, [projectName]);

  // Local save functionality
  const handleSaveCanvas = useCallback(async () => {
    if (nodes.length === 0) return;
    
    setIsSavingCanvas(true);
    
    try {
      // Prepare data to save
      const canvasData = {
        projectName,
        nodes,
        edges,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      
      // Create blob and download
      const blob = new Blob([JSON.stringify(canvasData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName || 'untitled-project'}.banana`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('💾 Canvas saved locally');
    } catch (error) {
      console.error('❌ Save failed:', error);
    } finally {
      setIsSavingCanvas(false);
    }
  }, [nodes, edges, projectName]);

  // Local load functionality
  const handleLoadCanvas = useCallback(() => {
    canvasLoadRef.current?.click();
  }, []);

  const handleLoadFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate data structure
      if (!data.nodes || !data.edges) {
        throw new Error('Invalid file format');
      }
      
      // Load the data
      if (data.projectName) {
        setProjectName(data.projectName);
      }
      setNodes(data.nodes);
      setEdges(data.edges);
      
      console.log('📂 Canvas loaded from file:', file.name);
    } catch (error) {
      console.error('❌ Load failed:', error);
      alert(currentLanguage === 'zh-cn' ? '文件加载失败，请检查文件格式' : 'Failed to load file, please check the format');
    }
    
    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
  }, [currentLanguage]);

  return (
    <div
      className={`w-full h-full flex flex-col bg-gradient-to-br ${
        combineMode
          ? 'from-gray-200 to-gray-300'
          : 'from-gray-50 to-gray-100'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        className="hidden"
      />

      <input
        ref={productUploadRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleSimpleProductUpload(file);
          }
        }}
        className="hidden"
      />

      <input
        ref={canvasLoadRef}
        type="file"
        accept=".banana,.json"
        onChange={handleLoadFile}
        className="hidden"
      />

      {/* Project Toolbar */}
      <div className="sticky top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-2">
          <div className="flex-1 flex items-center">
            {/* Knowledge Graph Button removed for open source version */}
          </div>
          
          <div className="flex-1 flex justify-center">
            {/* 项目名称编辑 - 开源版本保留但不储存 */}
            {isEditingName ? (
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveProjectName();
                    } else if (e.key === 'Escape') {
                      handleCancelProjectNameEdit();
                    }
                  }}
                  className="text-lg font-semibold text-gray-900 bg-transparent border-0 border-b-2 border-orange-300 focus:border-orange-500 focus:outline-none focus:ring-0 flex-1 min-w-0 pb-1 transition-colors text-center truncate"
                  placeholder="Enter project name"
                  autoFocus
                />
                <button
                  onClick={handleSaveProjectName}
                  disabled={!tempName.trim()}
                  className="ml-2 p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Save (Enter)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={handleCancelProjectNameEdit}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Cancel (Esc)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="group flex items-center gap-2 cursor-pointer max-w-md">
                <h1 
                  className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors truncate"
                  onClick={() => {
                    setIsEditingName(true);
                    setTempName(projectName || '');
                  }}
                  title={projectName || 'Untitled Project'}
                >
                  {projectName || 'Untitled Project'}
                </h1>
                <button
                  onClick={() => {
                    setIsEditingName(true);
                    setTempName(projectName || '');
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                  title="Edit Project Name"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 flex justify-end items-center gap-3">
            {/* Load Button */}
            <div className="neu-button-container">
              <div className="neu-button-label">
                {currentLanguage === 'zh-cn' ? '加载' : 'Load'}
              </div>
              <button
                onClick={handleLoadCanvas}
                className="neu-button"
                title={currentLanguage === 'zh-cn' ? '从文件加载项目' : 'Load project from file'}
              >
                <div className="neu-button-outer">
                  <div className="neu-button-inner">
                    <svg className="neu-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>

            {/* Add Product Button */}
            <div className="neu-button-container">
              <div className="neu-button-label">
                {currentLanguage === 'zh-cn' ? '新增产品' : 'Add Product'}
              </div>
              <button
                onClick={() => setShowProductUpload(true)}
                disabled={isUploadingProduct || !analysisComplete}
                className="neu-button"
                title={!analysisComplete 
                  ? (currentLanguage === 'zh-cn' ? '请先上传并分析产品图片' : 'Please upload and analyze product image first')
                  : (currentLanguage === 'zh-cn' ? '新增产品图片' : 'Add Product Image')
                }
              >
                <div className="neu-button-outer">
                  <div className="neu-button-inner">
                    {isUploadingProduct ? (
                      <div className="neu-spinner"></div>
                    ) : (
                      <svg className="neu-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            </div>

            {/* Save Button */}
            <div className="neu-button-container">
              <div className="neu-button-label">
                {isSavingCanvas ? (currentLanguage === 'zh-cn' ? '保存中...' : 'Saving...') : (currentLanguage === 'zh-cn' ? '保存' : 'Save')}
              </div>
              <button
                onClick={handleSaveCanvas}
                disabled={isSavingCanvas || nodes.length === 0}
                className="neu-button primary"
                title={currentLanguage === 'zh-cn' ? '保存项目到文件' : 'Save project to file'}
              >
                <div className="neu-button-outer">
                  <div className="neu-button-inner">
                    {isSavingCanvas ? (
                      <div className="neu-spinner"></div>
                    ) : (
                      <svg className="neu-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            </div>

            {/* Merge Images Button */}
            <ImageMergeButton currentLanguage={currentLanguage} onAddProduct={handleProductUploadFromUrl} />
          </div>
        </div>
      </div>

      {/* Upload Area - Conditional */}
      {nodes.length === 0 && !isAnalyzing && (
        <div 
          className="absolute inset-0 flex items-center justify-center" 
          style={{ zIndex: 30 }}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !isAnalyzing && fileInputRef.current?.click()}
        >
          <motion.div
            className={`
              glass rounded-2xl p-12 text-center max-w-md mx-auto border-2 border-dashed transition-all duration-200 cursor-pointer
              ${isDragActive 
                ? 'border-banana-500 bg-banana-50/50 scale-105' 
                : 'border-gray-300 hover:border-banana-400'
              }
              ${isAnalyzing ? 'pointer-events-none' : ''}
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-4">
              <PhotoIcon className="h-16 w-16 text-banana-500 mx-auto animate-float" />
              <h3 className="text-2xl font-bold text-gray-800">
                {t[currentLanguage].uploadProduct}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {isDragActive 
                  ? t[currentLanguage].dropImageHere
                  : t[currentLanguage].dragDropText
                }
              </p>
              <div className="text-sm text-gray-500">
                {t[currentLanguage].fileSupport}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Reasoning Overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-8 w-[600px] h-[500px] flex flex-col shadow-2xl"
            >
              {/* Fixed Header */}
              <div className="flex items-center space-x-3 mb-4 flex-shrink-0">
                <div className="spinner w-6 h-6 border-4 border-banana-500 border-t-transparent rounded-full animate-spin" />
                <h3 className="text-sm font-semibold text-gray-800">{t[currentLanguage].aiCreativeStrategist}</h3>
              </div>

              {/* Scrollable Content */}
              <div 
                ref={analysisScrollRef}
                className="flex-1 overflow-y-auto space-y-4 pr-2"
                style={{ maxHeight: 'calc(500px - 120px)' }}
              >
                {/* Product Image Display */}
                {productImagePath && (
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <img
                        src={productImagePath}
                        alt="Product being analyzed"
                        className="max-w-[200px] max-h-32 object-contain rounded-xl shadow-lg border-2 border-banana-200"
                        onError={(e) => {
                          console.error('Product image loading failed:', productImagePath);
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNDBMMTYwIDEyMEgxNDBWMTYwSDYwVjEyMEg0MEwxMDAgNDBaIiBmaWxsPSIjOTdBM0I0Ii8+Cjwvc3ZnPgo='
                        }}
                      />
                      <div className="absolute -top-2 -right-2 bg-banana-500 text-white text-xs px-2 py-1 rounded-full">
                        {t[currentLanguage].analyzing}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 显示所有分析步骤，无论是否完成 */}
                {reasoningSteps.length > 0 ? (
                  reasoningSteps.map((step, index) => {
                    console.log(`🎨 Rendering step ${index + 1}:`, step, 'Current step:', currentStep);
                    return (
                    <motion.div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 transition-all duration-500 ${
                        index <= currentStep 
                          ? 'bg-banana-50 border-banana-500 opacity-100' 
                          : 'bg-gray-50 border-gray-300 opacity-50'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: index <= currentStep ? 1 : 0.5,
                        x: 0 
                      }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index <= currentStep 
                            ? 'bg-banana-500 text-white' 
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1 text-sm">{step.step}</h4>
                          {index <= currentStep && (
                            <motion.p 
                              className="text-gray-700 text-sm"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                            >
                              {step.analysis}
                            </motion.p>
                          )}
                        </div>
                        {index <= currentStep && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.5 }}
                            className="text-green-500 text-sm"
                          >
                            ✓
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                    );
                  })
                ) : (
                  /* 如果还没有步骤，显示加载中的占位符 */
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div key={num} className="p-4 rounded-lg border-l-4 bg-gray-50 border-gray-300 opacity-50 animate-pulse">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
                            {num}
                          </div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
          className={combineMode ? '!bg-gray-300' : ''}
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />
          

        </ReactFlow>
      </div>

      {/* 图片预览 Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-6xl max-h-6xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Product Upload Modal */}
      <AnimatePresence>
        {showProductUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-8 w-[500px] max-w-[90vw] shadow-2xl"
            >
              <div className="text-center">
                <div className="mb-6">
                  <svg className="h-16 w-16 text-banana-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {currentLanguage === 'zh-cn' ? '新增产品图片' : 'Add Product Image'}
                  </h3>
                  <p className="text-gray-600">
                    {currentLanguage === 'zh-cn' 
                      ? '选择要新增的产品图片' 
                      : 'Select product image to add'
                    }
                  </p>
                </div>
                
                {/* Upload Area */}
                <div
                  className="border-2 border-dashed border-gray-300 hover:border-banana-400 rounded-xl p-8 mb-6 cursor-pointer transition-colors"
                  onClick={() => productUploadRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const files = Array.from(e.dataTransfer.files);
                    if (files.length > 0) {
                      handleSimpleProductUpload(files[0]);
                    }
                  }}
                >
                  <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-600 mb-2">
                    {currentLanguage === 'zh-cn' 
                      ? '拖放图片到此处或点击上传' 
                      : 'Drag & drop image here or click to upload'
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    {currentLanguage === 'zh-cn' 
                      ? '支援 JPG, PNG，最大 10MB' 
                      : 'Supports JPG, PNG • Max 10MB'
                    }
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-center gap-3 mb-4">
                  <button
                    onClick={() => setShowProductUpload(false)}
                    disabled={isUploadingProduct}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {currentLanguage === 'zh-cn' ? '取消' : 'Cancel'}
                  </button>
                  <button
                    onClick={() => productUploadRef.current?.click()}
                    disabled={isUploadingProduct}
                    className="px-6 py-2 text-sm font-medium text-white bg-banana-600 hover:bg-banana-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isUploadingProduct ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    )}
                    {currentLanguage === 'zh-cn' ? '选择文件' : 'Choose File'}
                  </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Knowledge Graph */}
      <KFCKnowledgeGraph
        isVisible={showKnowledgeGraph}
        onClose={() => setShowKnowledgeGraph(false)}
        onNodeClick={handleKnowledgeGraphNodeClick}
      />

      {/* Official Version Modal */}
      <OfficialVersionModal
        isOpen={showOfficialModal}
        onClose={() => setShowOfficialModal(false)}
        currentLanguage={currentLanguage}
      />

      {/* Drag Drop Overlay */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-banana-500/20 flex items-center justify-center z-40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl p-12 border-4 border-banana-500 border-dashed"
            >
              <div className="text-center">
                <PhotoIcon className="w-16 h-16 text-banana-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {t[currentLanguage].dropImageHere}
                </h3>
                <p className="text-gray-600">
                  {t[currentLanguage].fileSupport}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Wrapper component with ReactFlowProvider
export default function AdCreativeCanvasWithProvider(props: AdCreativeCanvasProps) {
  return (
    <ReactFlowProvider>
      <AdCreativeCanvasReactFlow {...props} />
    </ReactFlowProvider>
  );
}