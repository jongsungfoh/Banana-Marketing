# 🍌 Banana Marketing

AI creative editor - Bring your own Gemini API Key

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Enter API Key

After launching, enter your **Gemini API Key** in the top-right corner

### 3. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3003

## 🎯 Features

- ✅ **Product Image Upload & Analysis**
- ✅ **AI Creative Concept Generation**
- ✅ **Merge Multiple Images** *(Combine images with drag & drop reordering)*
- ✅ **Add Merged Images as Products** *(Convert merged images to product nodes)*
- ✅ **Knowledge Graph (Sample)**
- ✅ **Node Drag & Connect**
- ✅ **Neumorphism UI**
- ✅ **Save/Load Projects** *(Save to .banana files, load from .banana/.json)*
- ✅ **Bilingual Support (EN/ZH)**
- ✅ **Fully Local** *(Official Version provides cloud storage)*

## 📝 How to Get Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with Google Account
3. Click "Get API Key"
4. Create new API Key
5. Copy and paste in the top-right corner

## ⚠️ Important Notes

- Project data can be saved/loaded using Save/Load buttons
- Generated images disappear after refresh (save project to preserve)
- Images are not saved to cloud
- Data processed only in memory

## 🎨 How to Use

### 1. Upload Product Image
- **Method 1**: Click central upload area to select file
- **Method 2**: Drag & drop image to upload area
- Supported formats: JPG, PNG
- File size: Max 10MB

### 2. Product Analysis
After upload, AI will automatically:
- Analyze product features
- Generate creative concepts
- Create product and concept nodes
- Show recommended advertising directions

### 3. Generate Creative Images
1. Click "Generate" button on concept nodes
2. AI generates advertising creative images based on concept description
3. Generated images appear in new creative nodes

### 4. Edit Concepts
1. Double-click concept node title or content
2. Modify text
3. Click outside or press Enter to save

### 5. Add Concepts
- From product nodes: Click "+" button to add concept
- From creative nodes: Click "+" button to add concept based on generated image

### 6. Merge Images
1. Click the "Merge Images" button in the toolbar
2. Upload multiple images (2 or more)
3. Drag & drop to reorder images
4. Click "Merge Images" to combine them
5. Choose to download the merged image OR add it as a product
6. If adding as product: Click "Add Product" to analyze and create product node

### 7. Knowledge Graph
1. Click ✨ icon in bottom-right to open knowledge graph
2. Browse KFC brand-related concept network
3. Click any node to add as creative concept

### 7. Node Operations
- **Drag**: Move node position
- **Connect**: Drag from bottom connection point to another node
- **Delete**: Click delete button on node
- **Preview Image**: Click image to view full size

### 8. Save/Load Projects
- **Save Project**: Click "Save" button to export current canvas as .banana file
- **Load Project**: Click "Load" button to import .banana or .json files
- **File Format**: .banana files contain all nodes, edges, and project data
- **Compatibility**: Supports loading from .banana and .json formats

## 💾 Data Storage

### Local Storage Features
- ✅ API Key: Stored in localStorage (persistent)
- ✅ Language Setting: Stored in localStorage (persistent)
- ✅ Save/Load Projects: Export/import .banana files with all nodes and edges
- ❌ Generated Images: Memory only (base64 format)

### After F5 Refresh
- API Key and language settings **will be retained**
- Project data **can be saved/loaded** using Save/Load buttons
- Generated images **will disappear** (save project to preserve)

## 🐛 Troubleshooting

### 1. Cannot Generate Images
- Confirm valid Gemini API Key is entered
- Check if API Key has sufficient quota
- Check browser console for error messages

### 2. Analysis Failed
- Confirm uploaded file is JPG or PNG format
- Confirm file size doesn't exceed 10MB
- Confirm network connection is stable

### 3. API Key Invalid After Setting
- Check if API Key is completely copied
- Confirm no extra spaces
- Refresh page and try again

## 🔒 Privacy & Security

### Data Privacy
- ✅ No user data collection
- ✅ API Key stored locally only
- ✅ Images not uploaded to cloud
- ✅ Completely static web application

### Security Recommendations
- Regularly rotate API Key
- Don't store API Key on public computers
- Monitor Google AI Studio API usage

## 📄 License

MIT License

Copyright (c) 2024 The Pocket Company

When using this software, you must:
1. Retain attribution "The Pocket Company"
2. Link back to original repository in public projects
3. Tag @thepocketcompany when sharing on social media

---

# 🍌 Banana Marketing

AI 创意编辑器 - 使用您自己的 Gemini API Key

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 输入 API Key

启动应用后，在右上角输入您的 **Gemini API Key**

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3003

## 🎯 项目特色

- ✅ **产品图片上传和分析**
- ✅ **AI 创意概念生成**
- ✅ **合并多张图片** *(拖放重新排序组合图片)*
- ✅ **将合并图片添加为产品** *(将合并图片转换为产品节点)*
- ✅ **知识图谱功能(示例)**
- ✅ **节点拖拽和连接**
- ✅ **Neumorphism UI**
- ✅ **保存/加载项目** *(保存为 .banana 文件，可加载 .banana/.json)*
- ✅ **双语系支持（中/英）**
- ✅ **完全本地运行**

## 📝 如何获取 Gemini API Key

1. 前往 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 登录 Google 账号
3. 点击「Get API Key」
4. 创建新的 API Key
5. 复制并在应用右上角输入

## ⚠️ 注意事项

- 项目数据可使用保存/加载按钮进行保存/加载
- 生成图片刷新后会消失（保存项目以保留）
- 图片不会保存到云端
- 仅在内存中处理数据

## 🎨 功能使用说明

### 1. 上传产品图片
- **方式一**：点击中央上传区域选择文件
- **方式二**：直接拖拽图片到上传区域
- 支持格式：JPG, PNG
- 文件大小：最大 10MB

### 2. 产品分析
上传后，AI 会自动：
- 分析产品特征
- 生成创意概念
- 建立产品节点和概念节点
- 显示推荐的广告创意方向

### 3. 生成创意图片
1. 点击概念节点上的「Generate」按钮
2. AI 会基于概念描述生成广告创意图片
3. 生成的图片会显示在新的创意节点中

### 4. 编辑概念
1. 双击概念节点的标题或内容
2. 修改文字
3. 点击外部区域或按 Enter 保存

### 5. 新增概念
- 从产品节点：点击「+」按钮新增概念
- 从创意节点：点击「+」按钮基于生成图片新增概念

### 6. 合并图片
1. 点击工具栏的「合并图片」按钮
2. 上传多张图片（2 张以上）
3. 拖放重新排序图片
4. 点击「合并图片」进行组合
5. 选择下载合并图片或添加为产品
6. 若添加为产品：点击「添加产品」进行分析并创建产品节点

### 7. 使用知识图谱
1. 点击工具栏的知识图谱按钮开启
2. 浏览 KFC 品牌相关的概念网络
3. 点击任何节点将其新增为创意概念

### 7. 节点操作
- **拖拽**：移动节点位置
- **连接**：从节点底部的连接点拖拽到另一个节点
- **删除**：点击节点上的删除按钮（有子节点时会提示）
- **预览图片**：点击图片查看大图

### 8. 保存/加载项目
- **保存项目**：点击「保存」按钮导出当前画布为 .banana 文件
- **加载项目**：点击「加载」按钮导入 .banana 或 .json 文件
- **文件格式**：.banana 文件包含所有节点、连接和项目数据
- **兼容性**：支持从 .banana 和 .json 格式加载

## 💾 数据存储说明

### 本地存储特性
- ✅ API Key：存储在 localStorage（持久化）
- ✅ 语言设置：存储在 localStorage（持久化）
- ✅ 保存/加载项目：导出/导入 .banana 文件包含所有节点和连接
- ❌ 生成图片：仅存在内存中（base64 格式）

### F5 刷新后
- API Key 和语言设置**会保留**
- 项目数据**可保存/加载**使用保存/加载按钮
- 生成图片**会消失**（保存项目以保留）



## 🐛 常见问题

### 1. 图片无法生成
- 确认已输入有效的 Gemini API Key
- 检查 API Key 是否有足够的配额
- 查看浏览器控制台是否有错误信息

### 2. 分析失败
- 确认上传的是 JPG 或 PNG 格式
- 确认文件大小不超过 10MB
- 确认网络连接正常

### 3. API Key 设置后无效
- 检查 API Key 是否完整复制
- 确认没有多余的空格
- 重新整理页面后再试

### 4. 节点无法拖拽
- 确保没有在编辑模式中
- 尝试重新整理页面
- 检查浏览器是否支持 ReactFlow

## 🔒 隐私与安全

### 数据隐私
- ✅ 不收集任何用户数据
- ✅ API Key 仅存在本地
- ✅ 图片不上传到云端
- ✅ 完全静态网页应用

### 安全建议
- 定期更换 API Key
- 不要在公共电脑上存储 API Key
- 监控 Google AI Studio 的 API 使用量

## 📄 授权

MIT License

Copyright (c) 2024 The Pocket Company

使用本软件时，您必须：
1. 保留原作者署名「The Pocket Company」
2. 在公开项目中链接回原始 repository
3. 在社交媒体提及项目时标注 @thepocketcompany

---

**Powered by The Pocket Company**
