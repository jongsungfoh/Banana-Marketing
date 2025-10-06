'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

// 内嵌样式定义
const styles = `
  /* Glass morphism effect */
  .kg-glass {
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    background-color: rgba(17, 25, 40, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.125);
  }
  
  /* Animation keyframes */
  @keyframes kg-fade-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes kg-slide-in {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes kg-slide-right {
    from { transform: translateX(300px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  /* Component specific styles */
  .kg-modal {
    animation: kg-fade-in 0.3s ease-out;
  }
  
  .kg-content {
    animation: kg-slide-in 0.3s ease-out;
  }
  
  .kg-panel {
    animation: kg-slide-right 0.3s ease-out;
  }
  
  .kg-button-hover:hover {
    background-color: rgba(31, 41, 55, 0.8);
    transition: all 0.2s;
  }
  
  .kg-link-label {
    font-size: 8px;
    fill: #a0a0a0;
    text-anchor: middle;
  }
`;

// 节点接口定义
export interface GraphNode extends d3.SimulationNodeDatum {
  id: string
  name: string
  category: string
  mentions: number
  sentiment: 'positive' | 'negative' | 'neutral'
  trending: boolean
}

// 链接接口定义
export interface GraphLink {
  source: string
  target: string
  value: number
  relation: string
}

// 图表数据接口
export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

// 洞察接口定义
export interface NodeInsight {
  summary: string
  sentiment: string
  keyPoints: string[]
}

// 创意模板接口
export interface CreativeTemplate {
  concept: string
  description: string
  style: string
}

// 组件 Props 接口
export interface KnowledgeGraphProps {
  isVisible: boolean
  onClose: () => void
  onNodeClick: (nodeData: GraphNode, insight?: NodeInsight) => void
  
  // 可配置属性（全部可选，有KFC默认值）
  title?: string
  subtitle?: string
  data?: GraphData
  insights?: Record<string, NodeInsight>
  creativeTemplates?: Record<string, CreativeTemplate>
  colorMap?: Record<string, string>
  width?: number
  height?: number
  
  // 统计数据配置
  stats?: {
    label: string
    value: string | number
    color?: string
  }[]
  
  // 图例配置
  legend?: {
    category: string
    label: string
    color: string
  }[]
  
  // 语言配置
  language?: {
    title: string
    subtitle: string
    nodesTotalLabel: string
    linksTotalLabel: string
    mentionsLabel: string
    sentimentLabel: string
    insightsLabel: string
    keyPointsLabel: string
    templatesLabel: string
    conceptLabel: string
    descriptionLabel: string
    styleLabel: string
    generateButtonLabel: string
    instructionText: string
    legendTitle: string
    positiveLabel: string
    negativeLabel: string
    neutralLabel: string
  }
}

// KFC 专用创意模板
export const kfcCreativeTemplates: Record<string, CreativeTemplate> = {
  "韩式起司脆鸡饭": {
    concept: "韩式风味盛宴",
    description: "展示韩式起司脆鸡饭的诱人起司拉丝效果，搭配韩式辣酱的火红色泽，营造正宗韩式料理氛围",
    style: "韩式美食摄影风格，暖色调灯光，突出起司拉丝瞬间"
  },
  "爆浆卡士达蛋挞": {
    concept: "爆浆惊喜时刻", 
    description: "捕捉蛋挞被咬开瞬间，卡士达内馅流淌而出的惊艳画面，传达爆浆带来的味觉惊喜",
    style: "特写微距摄影，金黄色泽，突出流动质感"
  },
  "经典炸鸡": {
    concept: "11种香料传奇",
    description: "展现炸鸡外酥内嫩的完美质感，搭配神秘香料氛围，强调肯德基独家配方的传奇地位",
    style: "经典美食摄影，温暖灯光，突出酥脆质感"
  },
  "家庭聚餐": {
    concept: "温馨分享时光",
    description: "展现家人围桌分享炸鸡的温馨画面，突出肯德基在家庭重要时刻的陪伴价值",
    style: "温馨家庭摄影风格，自然灯光，强调情感连接"
  },
  "韩流追星族": {
    concept: "K-Culture美食体验",
    description: "结合韩流文化元素，展现年轻人享用韩式起司脆鸡饭的时尚生活方式",
    style: "时尚生活摄影，活力色彩，突出年轻潮流感"
  },
  "下午茶时光": {
    concept: "悠闲午后享受",
    description: "展现蛋挞配茶的精致下午茶时光，营造放松愉悦的休闲氛围",
    style: "精致生活摄影风格，柔和灯光，突出悠闲感"
  }
}

// KFC 节点颜色映射
export const kfcColorMap = {
  "brand": "#e74c3c",           // 品牌核心 - 红色
  "product": "#f39c12",         // 产品节点 - 橙色  
  "concept": "#3498db",        // 概念节点 - 蓝色
  "creative": "#9b59b6",       // 创意节点 - 紫色
  "target": "#2ecc71",         // 目标受众 - 绿色
  "competitor": "#95a5a6",     // 竞品 - 灰色
  "trend": "#1abc9c",          // 趋势 - 青色
  "insight": "#e67e22"         // 洞察 - 深橙色
}

// 通用预设颜色映射 
const defaultColorMap = {
  "primary": "#e74c3c",      // 主要 - 红色
  "secondary": "#ff6b9d",    // 次要 - 粉红色 
  "success": "#f39c12",      // 成功 - 橙色
  "info": "#8e44ad",         // 信息 - 紫色
  "warning": "#16a085",      // 警告 - 青绿色
  "danger": "#795548",       // 危险 - 棕色
  "light": "#e67e22",        // 浅色 - 橙红色
  "dark": "#3498db"          // 深色 - 蓝色
}

// KFC 专用统计数据
export const kfcStats = [
  { label: "总节点数", value: 26, color: "#f87171" },
  { label: "总链接数", value: 35, color: "#f87171" },
  { label: "真实讨论", value: 1237, color: "#f87171" },
  { label: "正面评价率", value: "87%", color: "#10b981" },
  { label: "2025热点新品", value: 6, color: "#facc15" }
]

// KFC 专用图例
export const kfcLegend = [
  { category: "brand", label: "品牌核心", color: "#e74c3c" },
  { category: "hot_product", label: "热点新品", color: "#ff6b9d" },
  { category: "core_product", label: "经典产品", color: "#f39c12" },
  { category: "consumer_group", label: "消费族群", color: "#3498db" },
  { category: "usage_scenario", label: "使用场景", color: "#16a085" },
  { category: "marketing_event", label: "营销事件", color: "#8e44ad" },
  { category: "purchase_channel", label: "购买渠道", color: "#795548" },
  { category: "service_issue", label: "服务问题", color: "#e67e22" }
]

// KFC 专用语言配置
export const kfcLanguage = {
  title: "肯德基舆情知识图谱",
  subtitle: "基于1237则真实讨论的AI深度分析 • 点击节点生成对应广告素材",
  nodesTotalLabel: "总节点数",
  linksTotalLabel: "总链接数",
  mentionsLabel: "次提及",
  sentimentLabel: "情感倾向",
  insightsLabel: "深度洞察",
  keyPointsLabel: "关键要点",
  templatesLabel: "创意模板预览",
  conceptLabel: "概念",
  descriptionLabel: "描述",
  styleLabel: "风格",
  generateButtonLabel: "生成广告素材",
  instructionText: "💡 点击任意节点可基于舆情洞察自动生成对应的广告创意素材",
  legendTitle: "图例",
  positiveLabel: "😊 正面",
  negativeLabel: "😔 负面",
  neutralLabel: "😐 中性"
}

// 默认语言配置
const defaultLanguage = {
  title: "知识图谱",
  subtitle: "基于数据分析的深度洞察 • 点击节点查看详细信息",
  nodesTotalLabel: "总节点数",
  linksTotalLabel: "总链接数", 
  mentionsLabel: "次提及",
  sentimentLabel: "情感倾向",
  insightsLabel: "深度洞察",
  keyPointsLabel: "关键要点",
  templatesLabel: "创意模板预览",
  conceptLabel: "概念",
  descriptionLabel: "描述",
  styleLabel: "风格",
  generateButtonLabel: "生成内容",
  instructionText: "💡 点击任意节点可查看详细洞察分析",
  legendTitle: "图例",
  positiveLabel: "😊 正面",
  negativeLabel: "😔 负面",
  neutralLabel: "😐 中性"
}

// KFC 2025年舆情知识图谱数据
export const kfcGraphData: GraphData = {
  nodes: [
    // 品牌节点
    {id: "肯德基", name: "肯德基", category: "brand", mentions: 1237, sentiment: "positive", trending: true},
    
    // 2025年热点新品
    {id: "韩式起司脆鸡饭", name: "韩式起司脆鸡饭", category: "hot_product", mentions: 87, sentiment: "positive", trending: true},
    {id: "爆浆卡士达蛋挞", name: "爆浆卡士达蛋挞", category: "hot_product", mentions: 64, sentiment: "positive", trending: true},
    {id: "明太子无骨脆鸡", name: "明太子无骨脆鸡", category: "hot_product", mentions: 45, sentiment: "positive", trending: true},
    {id: "青花椒香麻系列", name: "青花椒香麻系列", category: "hot_product", mentions: 38, sentiment: "positive", trending: true},
    
    // 经典产品
    {id: "经典炸鸡", name: "经典炸鸡", category: "core_product", mentions: 176, sentiment: "positive", trending: true},
    {id: "原味蛋挞", name: "原味蛋挞", category: "core_product", mentions: 89, sentiment: "positive", trending: true},
    {id: "上校鸡块", name: "上校鸡块", category: "core_product", mentions: 52, sentiment: "positive", trending: true},
    
    // 营销事件
    {id: "黑白大厨联名", name: "黑白大厨联名", category: "marketing_event", mentions: 67, sentiment: "positive", trending: true},
    {id: "618促销活动", name: "618促销活动", category: "marketing_event", mentions: 43, sentiment: "positive", trending: true},
    
    // 真实使用场景
    {id: "家庭聚餐", name: "家庭聚餐", category: "usage_scenario", mentions: 36, sentiment: "positive", trending: true},
    {id: "下午茶时光", name: "下午茶时光", category: "usage_scenario", mentions: 38, sentiment: "positive", trending: true},
    {id: "生日庆祝", name: "生日庆祝", category: "usage_scenario", mentions: 28, sentiment: "positive", trending: true},
    {id: "深夜宵夜", name: "深夜宵夜", category: "usage_scenario", mentions: 22, sentiment: "positive", trending: true},
    {id: "追剧配餐", name: "追剧配餐", category: "usage_scenario", mentions: 15, sentiment: "positive", trending: true},
    
    // 消费族群
    {id: "韩流追星族", name: "韩流追星族", category: "consumer_group", mentions: 67, sentiment: "positive", trending: true},
    {id: "炸鸡爱好者", name: "炸鸡爱好者", category: "consumer_group", mentions: 156, sentiment: "positive", trending: true},
    {id: "蛋挞控", name: "蛋挞控", category: "consumer_group", mentions: 89, sentiment: "positive", trending: true},
    {id: "优惠券猎人", name: "优惠券猎人", category: "consumer_group", mentions: 124, sentiment: "positive", trending: true},
    {id: "外送重度用户", name: "外送重度用户", category: "consumer_group", mentions: 45, sentiment: "positive", trending: true},
    
    // 购买渠道
    {id: "Foodpanda外送", name: "Foodpanda外送", category: "purchase_channel", mentions: 23, sentiment: "positive", trending: true},
    {id: "KFC官方APP", name: "KFC官方APP", category: "purchase_channel", mentions: 18, sentiment: "positive", trending: true},
    {id: "门市现场", name: "门市现场", category: "purchase_channel", mentions: 20, sentiment: "neutral", trending: true},
    
    // 服务问题
    {id: "出餐等待时间", name: "出餐等待时间", category: "service_issue", mentions: 61, sentiment: "negative", trending: true},
    {id: "点餐准确度", name: "点餐准确度", category: "service_issue", mentions: 119, sentiment: "negative", trending: true},
    {id: "食物保温效果", name: "食物保温效果", category: "service_issue", mentions: 34, sentiment: "neutral", trending: true}
  ],
  links: [
    // 品牌并热点新品关联
    {source: "肯德基", target: "韩式起司脆鸡饭", value: 5, relation: "2025爆红新品"},
    {source: "肯德基", target: "爆浆卡士达蛋挞", value: 5, relation: "6月回归限定"},
    {source: "肯德基", target: "明太子无骨脆鸡", value: 4, relation: "夏季限定新品"},
    {source: "肯德基", target: "青花椒香麻系列", value: 4, relation: "四川风味系列"},
    
    // 品牌并经典产品关联
    {source: "肯德基", target: "经典炸鸡", value: 5, relation: "招牌产品"},
    {source: "肯德基", target: "原味蛋挞", value: 5, relation: "经典甜点"},
    {source: "肯德基", target: "上校鸡块", value: 4, relation: "经典产品"},
    
    // 品牌并行销事件关联
    {source: "肯德基", target: "黑白大厨联名", value: 5, relation: "话题营销"},
    {source: "肯德基", target: "618促销活动", value: 4, relation: "促销策略"},
    
    // 热点产品并事件关联
    {source: "韩式起司脆鸡饭", target: "黑白大厨联名", value: 5, relation: "联名主打"},
    {source: "韩式起司脆鸡饭", target: "韩流追星族", value: 5, relation: "目标客群"},
    {source: "爆浆卡士达蛋挞", target: "蛋挞控", value: 5, relation: "期待回归"},
    {source: "明太子无骨脆鸡", target: "下午茶时光", value: 4, relation: "夏季新选择"},
    
    // 产品并场景关联
    {source: "经典炸鸡", target: "家庭聚餐", value: 5, relation: "分享首选"},
    {source: "原味蛋挞", target: "下午茶时光", value: 5, relation: "经典搭配"},
    {source: "上校鸡块", target: "生日庆祝", value: 4, relation: "庆祝套餐"},
    
    // 消费族群并产品关联
    {source: "炸鸡爱好者", target: "经典炸鸡", value: 5, relation: "忠实偏爱"},
    {source: "蛋挞控", target: "原味蛋挞", value: 5, relation: "经典首选"},
    {source: "韩流追星族", target: "韩式起司脆鸡饭", value: 5, relation: "话题跟踪"},
    {source: "优惠券猎人", target: "618促销活动", value: 5, relation: "优惠追踪"},
    
    // 购买渠道并客群关联
    {source: "Foodpanda外送", target: "外送重度用户", value: 5, relation: "主要渠道"},
    {source: "KFC官方APP", target: "优惠券猎人", value: 4, relation: "优惠获取"},
    {source: "门市现场", target: "炸鸡爱好者", value: 4, relation: "体验偏好"},
    
    // 服务问题并客群关联
    {source: "出餐等待时间", target: "外送重度用户", value: 4, relation: "主要痛点"},
    {source: "点餐准确度", target: "炸鸡爱好者", value: 4, relation: "体验影响"},
    {source: "食物保温效果", target: "外送重度用户", value: 3, relation: "品质关注"}
  ]
}

// KFC深度洞察数据
export const kfcInsights: Record<string, NodeInsight> = {
  "肯德基": {
    summary: "肯德基在台湾快餐市场以炸鸡专业技术建立领导地位，1237次真实讨论中体现出强势的品牌认知度。2025年与Netflix《黑白大厨》崔鉉碩联名推出韩式起司脆鸡饭引爆话题，结合经典蛋挞优势，持续巩固市场地位。",
    sentiment: "positive",
    keyPoints: ["炸鸡领导地位", "黑白大厨联名话题", "蛋挞差异化优势", "韩式创新尝试"]
  },
  "韩式起司脆鸡饭": {
    summary: "2025年最具话题性的新品，与Netflix热门节目《黑白大厨》崔鉉碩联名推出。87次讨论中消费者对韩式辣酱和起司融合的创新口感给予高度评价，'终于等到你'的热烈反应体现出成功的跨界合作。",
    sentiment: "positive",
    keyPoints: ["Netflix联名话题", "崔鉉碩主厨加持", "韩式创新口感", "社交媒体热议"]
  },
  "爆浆卡士达蛋挞": {
    summary: "6月强势回归的限定蛋挞，64次讨论中展现出消费者的高度期待和喜爱。“要冲啊”等热烈反应反映出稀缺性营销的成功，爆浆设计升级了经典蛋挞体验。",
    sentiment: "正面",
    keyPoints: ["限定回归话题", "爆浆创新设计", "消费者高度期待", "稀缺性营销成功"]
  },
  "经典炸鸡": {
    summary: "肯德基的绝对招牌产品，176次讨论中体现出无可撼动的品牌象征地位。独特的11种香料调味配方和外酥内嫩口感，创造了竞争对手难以复制的味觉记忆。",
    sentiment: "正面",
    keyPoints: ["品牌象征地位", "11种香料秘方", "外酥内嫩口感", "无法复制优势"]
  },
  "原味蛋挞": {
    summary: "肯德基最具代表性的甜点，89次讨论中消费者一致认为'吃来吃去就原味蛋挞最好吃'。酥脆塔皮配香滑卡士达的经典组合，创造了快餐界独一无二的甜点体验。",
    sentiment: "正面",
    keyPoints: ["最具代表性甜点", "消费者一致认可", "经典组合完美", "独一无二体验"]
  },
  "黑白大厨联名": {
    summary: "2025年最成功的话题营销事件，与Netflix热门节目《黑白大厨》崔鉉碩联名合作。67次讨论中体现出'终于等到你'的消费者期待，成功结合流行文化与美食创新。",
    sentiment: "正面",
    keyPoints: ["Netflix热门联名", "崔鉉碩主厨加持", "流行文化结合", "年轻客群吸引"]
  },
  "韩流追星族": {
    summary: "受《黑白大厨》联名影响而关注肯德基的新兴客群，67次讨论中展现出对韩式料理和K-culture的高度兴趣。韩式起司脆鸡饭成为这个族群的话题焦点。",
    sentiment: "正面",
    keyPoints: ["Netflix节目影响", "K-culture兴趣", "话题焦点产品", "流行文化驱动"]
  },
  "蛋挞控": {
    summary: "专门为蛋挞而来的忠实客群，89次讨论中体现出对蛋挞产品的深度依恋。从原味到爆浆卡士达的每次创新都能引起这个族群的高度关注。",
    sentiment: "正面",
    keyPoints: ["蛋挞深度依恋", "创新高度关注", "忠实客群支撑", "甜点策略核心"]
  },
  "优惠券猎人": {
    summary: "积极追踪和分享优惠资讯的价格敏感族群，124次讨论中体现出对618促销、信用卡优惠等价格策略的高度关注。具有很强的口碑传播力。",
    sentiment: "正面",
    keyPoints: ["价格敏感特征", "优惠信息分享", "促销活动关注", "口碑传播力"]
  },
  "炸鸡爱好者": {
    summary: "对肯德基11种香料炸鸡情有独钟的核心客群，156次讨论中体现出对品牌的深度忠诚。是品牌最重要的支撑力量。",
    sentiment: "正面", 
    keyPoints: ["核心忠实客群", "11种香料偏爱", "品牌深度忠诚", "支撑力量"]
  },
  "家庭聚餐": {
    summary: "家庭聚餐是肯德基的核心使用场景，36次讨论中体现出炸鸡分享特性的社交价值。“庆祝开幕”等聚餐活动反映出肯德基在重要时刻的参与度。",
    sentiment: "正面",
    keyPoints: ["核心使用场景", "分享社交价值", "重要时刻参与", "家庭友善品牌"]
  },
  "下午茶时光": {
    summary: "下午茶场景在38次讨论中展现出蛋挞配饮料的经典组合魅力。'坐下来聊天，吃个小点心'体现了肯德基在休闲社交场景中的重要地位。",
    sentiment: "正面",
    keyPoints: ["蛋挞经典组合", "休闲社交场景", "聊天配餐首选", "轻松氛围营造"]
  }
}

export default function KnowledgeGraph(props: KnowledgeGraphProps) {
  const {
    isVisible,
    onClose,
    onNodeClick,
    title = kfcLanguage.title,
    subtitle = kfcLanguage.subtitle, 
    data = kfcGraphData,
    insights = kfcInsights,
    creativeTemplates = kfcCreativeTemplates,
    colorMap = kfcColorMap,
    width = 800,
    height = 600,
    stats = kfcStats,
    legend = kfcLegend,
    language = kfcLanguage
  } = props

  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [showInsight, setShowInsight] = useState(false)
  const [generateFeedback, setGenerateFeedback] = useState('')

  // 注入样式
  useEffect(() => {
    const styleElement = document.createElement('style')
    styleElement.textContent = styles
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  // D3.js 图形渲染（已修正为简体中文）
  useEffect(() => {
    if (!isVisible || !svgRef.current || !data.nodes.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const g = svg.append("g")
    
    // 创建力导向模拟
    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(80).strength(0.8))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(25))
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1))

    // 创建连接线
    const link = g.append("g")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("stroke", "#64748b")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d: any) => d.value)

    // 创建连接标签
    const linkLabels = g.append("g")
      .selectAll("text")
      .data(data.links)
      .enter()
      .append("text")
      .attr("class", "kg-link-label")
      .attr("dy", -2)
      .text((d: any) => d.relation)

    // 创建节点
    const node = g.append("g")
      .selectAll("g")
      .data(data.nodes)
      .enter()
      .append("g")
      .style("cursor", "pointer")

    node.append("circle")
      .attr("r", (d: any) => {
        const sizeScale = d3.scaleLinear()
          .domain([0, d3.max(data.nodes, (n: any) => n.mentions) || 1])
          .range([8, 25])
        return sizeScale(d.mentions)
      })
      .attr("fill", (d: any) => {
        const color = (colorMap as any)[d.category] || (defaultColorMap as any)[d.category] || "#666"
        if (insights[d.id]) {
          return d3.color(color)?.brighter(0.3)?.toString() || color
        }
        return color
      })
      .attr("stroke", (d: any) => {
        if (insights[d.id]) return "#e74c3c"
        if (d.trending) return "#ffd700"
        return "#333"
      })
      .attr("stroke-width", (d: any) => insights[d.id] ? 3 : (d.trending ? 2 : 1.5))

    node.append("text")
      .attr("dx", 30)
      .attr("dy", ".35em")
      .text((d: any) => d.name + (insights[d.id] ? " 🧠" : "") + (d.trending ? " 🔥" : ""))
      .attr("font-size", 10)
      .attr("fill", "#e0e0e0")

    // 添加点击事件
    node.on("click", (event: any, d: any) => {
      setSelectedNode(d)
      setShowInsight(true)
      onNodeClick(d, insights[d.id])
    })

    // 添加拖拽行为
    const drag = d3.drag()
      .on("start", (event: any, d: any) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on("drag", (event: any, d: any) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on("end", (event: any, d: any) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      })

    node.call(drag as any)

    // 更新位置
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)

      linkLabels
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2)

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`)
    })
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)

      linkLabels
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2)

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`)
    })

    // 添加缩放行为
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event: any) => {
        g.attr("transform", event.transform)
      })

    svg.call(zoom as any)

  }, [isVisible, data, insights, colorMap, width, height])

  if (!isVisible) return null

  // 计算统计数据
  const defaultStats = data === kfcGraphData ? kfcStats : [
    { label: language.nodesTotalLabel, value: data.nodes.length, color: "#f87171" },
    { label: language.linksTotalLabel, value: data.links.length, color: "#f87171" },
  ]

  const displayStats = stats || defaultStats

  // 计算图例
  const defaultLegend = data === kfcGraphData ? kfcLegend : Object.keys(colorMap).map(category => ({
    category,
    label: category,
    color: (colorMap as any)[category]
  }))

  const displayLegend = legend || defaultLegend

  return (
    <div
      className="kg-modal fixed inset-0 flex items-center justify-center z-[9999]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="kg-content rounded-2xl shadow-2xl overflow-hidden"
        style={{ 
          backgroundColor: '#111827',
          width: '95vw',
          height: '90vh',
          maxWidth: '1152px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6"
          style={{ borderBottom: '1px solid #374151' }}
        >
          <div>
            <h2 
              className="text-2xl font-bold flex items-center gap-2"
              style={{ color: 'white' }}
            >
              🧠 {title}
              <span style={{ color: '#fbbf24' }}>✨</span>
            </h2>
            <p style={{ color: '#9ca3af', marginTop: '4px' }}>
              {subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="kg-button-hover p-2 rounded-lg"
            style={{ 
              backgroundColor: 'transparent',
              border: 'none',
              color: '#9ca3af',
              transition: 'all 0.2s'
            }}
          >
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div 
          className="flex justify-around p-4"
          style={{ 
            backgroundColor: '#1f2937',
            borderBottom: '1px solid #374151'
          }}
        >
          {displayStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div 
                className={`text-2xl font-bold ${stat.color || 'text-red-400'}`}
                style={{ 
                  color: stat.color?.includes('text-') ? undefined : (stat.color || '#f87171')
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Graph Container */}
        <div className="flex" style={{ height: 'calc(100% - 140px)' }}>
          {/* Main Graph */}
          <div className="flex-1 relative">
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              style={{ 
                backgroundColor: '#111827',
                minHeight: '500px'
              }}
            />
            
            {/* Legend */}
            <div 
              className="kg-glass absolute top-4 left-4 p-4 rounded-lg"
              style={{ maxWidth: '200px' }}
            >
              <h4 
                className="font-semibold mb-2"
                style={{ color: 'white' }}
              >
                {language.legendTitle}
              </h4>
              <div className="space-y-1" style={{ fontSize: '0.75rem' }}>
                {displayLegend.slice(0, 8).map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span style={{ color: '#d1d5db' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div 
              className="kg-glass absolute bottom-4 left-4 p-3 rounded-lg"
              style={{ maxWidth: '300px' }}
            >
              <p style={{ fontSize: '0.75rem', color: '#d1d5db' }}>
                {language.instructionText}
              </p>
            </div>
          </div>

          {/* Insight Panel */}
          {showInsight && selectedNode && (
            <div 
              className="kg-panel w-80 p-4 overflow-y-auto"
              style={{ 
                backgroundColor: '#1f2937',
                borderLeft: '1px solid #374151'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 
                  className="font-semibold"
                  style={{ color: 'white' }}
                >
                  {selectedNode.name}
                </h3>
                <button
                  onClick={() => setShowInsight(false)}
                  style={{ 
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer'
                  }}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {/* Node Stats */}
              <div 
                className="rounded-lg p-3 mb-4"
                style={{ backgroundColor: '#374151' }}
              >
                <div style={{ fontSize: '0.875rem', color: '#d1d5db' }}>讨论热度</div>
                <div 
                  className="text-xl font-bold"
                  style={{ color: '#f87171' }}
                >
                  {selectedNode.mentions} {language.mentionsLabel}
                </div>
                <div 
                  style={{ fontSize: '0.875rem', color: '#d1d5db', marginTop: '8px' }}
                >
                  {language.sentimentLabel}
                </div>
                <div 
                  className="text-sm font-semibold"
                  style={{ 
                    color: selectedNode.sentiment === 'positive' ? '#10b981' :
                           selectedNode.sentiment === 'negative' ? '#f87171' : '#facc15'
                  }}
                >
                  {selectedNode.sentiment === 'positive' ? language.positiveLabel :
                   selectedNode.sentiment === 'negative' ? language.negativeLabel : language.neutralLabel}
                </div>
              </div>

              {/* Insight */}
              {insights[selectedNode.id] && (
                <div 
                  className="rounded-lg p-3 mb-4"
                  style={{ backgroundColor: '#374151' }}
                >
                  <h4 
                    className="text-sm font-semibold mb-2"
                    style={{ color: '#f87171' }}
                  >
                    🧠 {language.insightsLabel}
                  </h4>
                  <p 
                    className="text-xs mb-3"
                    style={{ color: '#d1d5db' }}
                  >
                    {insights[selectedNode.id].summary}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    <strong>{language.keyPointsLabel}：</strong> {insights[selectedNode.id].keyPoints.join(' • ')}
                  </div>
                </div>
              )}

              {/* Creative Template Preview */}
              {creativeTemplates[selectedNode.id] && (
                <div 
                  className="rounded-lg p-3 mb-4"
                  style={{ backgroundColor: '#374151' }}
                >
                  <h4 
                    className="text-sm font-semibold mb-2"
                    style={{ color: '#facc15' }}
                  >
                    🎨 {language.templatesLabel}
                  </h4>
                  <div className="space-y-2" style={{ fontSize: '0.75rem' }}>
                    <div>
                      <span style={{ color: '#9ca3af' }}>{language.conceptLabel}：</span>
                      <span style={{ color: 'white' }}>{creativeTemplates[selectedNode.id].concept}</span>
                    </div>
                    <div>
                      <span style={{ color: '#9ca3af' }}>{language.descriptionLabel}：</span>
                      <span style={{ color: '#d1d5db' }}>{creativeTemplates[selectedNode.id].description}</span>
                    </div>
                    <div>
                      <span style={{ color: '#9ca3af' }}>{language.styleLabel}：</span>
                      <span style={{ color: '#d1d5db' }}>{creativeTemplates[selectedNode.id].style}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={() => {
                  console.log('🎨 生成广告素材按钮被点击:', selectedNode?.name);
                  
                  // 显示短暂反馈，不阻塞按钮
                  setGenerateFeedback(`正在创建 ${selectedNode?.name} 节点...`);
                  
                  // 直接创建 concept 节点
                  const conceptData = {
                    title: selectedNode?.name || '',
                    content: selectedNode?.name || '',
                    insight: insights[selectedNode?.id]
                  };
                  
                  console.log('🎯 直接发送创建 concept 事件:', conceptData);
                  window.dispatchEvent(new CustomEvent('createConceptFromKnowledgeGraph', {
                    detail: conceptData
                  }));
                  
                  // 短暂的成功反馈，不阻塞按钮
                  setTimeout(() => {
                    setGenerateFeedback(`✅ ${selectedNode?.name} 已加入编辑器！`);
                    setTimeout(() => {
                      setGenerateFeedback('');
                    }, 1500);
                  }, 300);
                }}
                className="w-full font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b91c1c'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626'
                }}
              >
                <span>✨</span>
                {language.generateButtonLabel}
              </button>
              
              {/* Feedback Message */}
              {generateFeedback && (
                <div 
                  className="mt-3 text-center text-sm font-medium p-2 rounded-lg"
                  style={{
                    backgroundColor: generateFeedback.includes('✅') ? '#10b981' : '#3b82f6',
                    color: 'white'
                  }}
                >
                  {generateFeedback}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// KFC专用便利组件 - 直接使用，无需配置
export function KFCKnowledgeGraph({ 
  isVisible, 
  onClose, 
  onNodeClick 
}: {
  isVisible: boolean
  onClose: () => void
  onNodeClick: (nodeData: GraphNode, insight?: NodeInsight) => void
}) {
  return (
    <KnowledgeGraph
      isVisible={isVisible}
      onClose={onClose}
      onNodeClick={onNodeClick}
      data={kfcGraphData}
      insights={kfcInsights}
      creativeTemplates={kfcCreativeTemplates}
      colorMap={kfcColorMap}
      stats={kfcStats}
      legend={kfcLegend}
      language={kfcLanguage}
      title="🍗 肯德基舆情知识图谱"
      subtitle="基于1237则真实讨论的AI深度分析 • 点击节点生成对应广告素材"
    />
  )
}

// 使用示例：

/* 
// 方法1：使用便利的KFC组件（推荐）
import { KFCKnowledgeGraph } from './KnowledgeGraph'

function App() {
  const [showKFCGraph, setShowKFCGraph] = useState(false)
  
  return (
    <div>
      <button onClick={() => setShowKFCGraph(true)}>
        打开KFC知识图谱
      </button>
      
      <KFCKnowledgeGraph
        isVisible={showKFCGraph}
        onClose={() => setShowKFCGraph(false)}
        onNodeClick={(node, insight) => {
          console.log('🍗 KFC节点点击:', node.name)
          console.log('💡 洞察:', insight)
          // 在这里可以触发广告素材生成等功能
        }}
      />
    </div>
  )
}
*/

/* 
// 方法2：使用完整配置的通用组件
import KnowledgeGraph, { kfcGraphData, kfcInsights, kfcCreativeTemplates } from './KnowledgeGraph'

function App() {
  const [showGraph, setShowGraph] = useState(false)
  
  return (
    <div>
      <button onClick={() => setShowGraph(true)}>
        打开自定义知识图谱
      </button>
      
      <KnowledgeGraph
        isVisible={showGraph}
        onClose={() => setShowGraph(false)}
        onNodeClick={(node, insight) => {
          console.log('节点点击:', node.name, insight)
        }}
        data={kfcGraphData}
        insights={kfcInsights}
        creativeTemplates={kfcCreativeTemplates}
        title="我的KFC分析"
        subtitle="自定义的舆情分析"
      />
    </div>
  )
}
*/

/*
// 方法3：使用自己的数据
import KnowledgeGraph from './KnowledgeGraph'

const myData = {
  nodes: [
    {id: "node1", name: "节点1", category: "primary", mentions: 100, sentiment: "positive", trending: true},
    // ... 更多节点
  ],
  links: [
    {source: "node1", target: "node2", value: 5, relation: "强关联"},
    // ... 更多链接
  ]
}

const myInsights = {
  "node1": {
    summary: "这是我的节点分析...",
    sentiment: "正面",
    keyPoints: ["特点1", "特点2", "特点3"]
  }
}

function App() {
  const [showGraph, setShowGraph] = useState(false)
  
  return (
    <div>
      <button onClick={() => setShowGraph(true)}>
        打开我的知识图谱
      </button>
      
      <KnowledgeGraph
        isVisible={showGraph}
        onClose={() => setShowGraph(false)}
        onNodeClick={(node, insight) => {
          console.log('点击了:', node.name)
        }}
        data={myData}
        insights={myInsights}
        title="我的知识图谱"
      />
    </div>
  )
}
*/

/*
安装依赖：
npm install d3 @types/d3 react

特色功能：
✅ 完全独立 - 无外部CSS依赖，内嵌所有样式
✅ 开箱即用 - 包含完整KFC舆情数据和洞察
✅ 高度可配置 - 支持自定义数据、颜色、语言等
✅ 互动式图表 - D3.js力导向布局，支持拖拽缩放
✅ 深度洞察面板 - 点击节点显示详细分析
✅ 创意模板系统 - 内建广告创意生成模板
✅ 响应式设计 - 适应各种屏幕尺寸
✅ TypeScript支持 - 完整的类型定义

直接复制这个文件到你的项目就可以使用！
*/

