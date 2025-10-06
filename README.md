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

### 6. Knowledge Graph
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

AI 創意編輯器 - 使用您自己的 Gemini API Key

## 🚀 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 輸入 API Key

啟動應用後，在右上角輸入您的 **Gemini API Key**

### 3. 啟動開發伺服器

```bash
npm run dev
```

訪問 http://localhost:3003

## 🎯 專案特色

- ✅ **產品圖片上傳和分析**
- ✅ **AI 創意概念生成**
- ✅ **知識圖譜功能(範例)**
- ✅ **節點拖拽和連接**
- ✅ **Neumorphism UI**
- ✅ **儲存/載入專案** *(儲存為 .banana 檔案，可載入 .banana/.json)*
- ✅ **雙語系支援（中/英）**
- ✅ **完全本地運行**

## 📝 如何取得 Gemini API Key

1. 前往 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 登入 Google 帳號
3. 點擊「Get API Key」
4. 創建新的 API Key
5. 複製並在應用右上角輸入

## ⚠️ 注意事項

- 專案資料可使用儲存/載入按鈕進行儲存/載入
- 生成圖片刷新後會消失（儲存專案以保留）
- 圖片不會儲存到雲端
- 僅在記憶體中處理資料

## 🎨 功能使用說明

### 1. 上傳產品圖片
- **方式一**：點擊中央上傳區域選擇檔案
- **方式二**：直接拖曳圖片到上傳區域
- 支援格式：JPG, PNG
- 檔案大小：最大 10MB

### 2. 產品分析
上傳後，AI 會自動：
- 分析產品特徵
- 生成創意概念
- 建立產品節點和概念節點
- 顯示推薦的廣告創意方向

### 3. 生成創意圖片
1. 點擊概念節點上的「Generate」按鈕
2. AI 會基於概念描述生成廣告創意圖片
3. 生成的圖片會顯示在新的創意節點中

### 4. 編輯概念
1. 雙擊概念節點的標題或內容
2. 修改文字
3. 點擊外部區域或按 Enter 儲存

### 5. 新增概念
- 從產品節點：點擊「+」按鈕新增概念
- 從創意節點：點擊「+」按鈕基於生成圖片新增概念

### 6. 使用知識圖譜
1. 點擊工具列的知識圖譜按鈕開啟
2. 瀏覽 KFC 品牌相關的概念網路
3. 點擊任何節點將其新增為創意概念

### 7. 節點操作
- **拖曳**：移動節點位置
- **連接**：從節點底部的連接點拖曳到另一個節點
- **刪除**：點擊節點上的刪除按鈕（有子節點時會提示）
- **預覽圖片**：點擊圖片查看大圖

### 8. 儲存/載入專案
- **儲存專案**：點擊「儲存」按鈕匯出目前畫布為 .banana 檔案
- **載入專案**：點擊「載入」按鈕匯入 .banana 或 .json 檔案
- **檔案格式**：.banana 檔案包含所有節點、連接和專案資料
- **相容性**：支援從 .banana 和 .json 格式載入

## 💾 資料儲存說明

### 本地儲存特性
- ✅ API Key：儲存在 localStorage（持久化）
- ✅ 語言設定：儲存在 localStorage（持久化）
- ✅ 儲存/載入專案：匯出/匯入 .banana 檔案包含所有節點和連接
- ❌ 生成圖片：僅存在記憶體中（base64 格式）

### F5 刷新後
- API Key 和語言設定**會保留**
- 專案資料**可儲存/載入**使用儲存/載入按鈕
- 生成圖片**會消失**（儲存專案以保留）



## 🐛 常見問題

### 1. 圖片無法生成
- 確認已輸入有效的 Gemini API Key
- 檢查 API Key 是否有足夠的配額
- 查看瀏覽器控制台是否有錯誤訊息

### 2. 分析失敗
- 確認上傳的是 JPG 或 PNG 格式
- 確認檔案大小不超過 10MB
- 確認網路連線正常

### 3. API Key 設定後無效
- 檢查 API Key 是否完整複製
- 確認沒有多餘的空格
- 重新整理頁面後再試

### 4. 節點無法拖曳
- 確保沒有在編輯模式中
- 嘗試重新整理頁面
- 檢查瀏覽器是否支援 ReactFlow

## 🔒 隱私與安全

### 資料隱私
- ✅ 不收集任何用戶資料
- ✅ API Key 僅存在本地
- ✅ 圖片不上傳到雲端
- ✅ 完全靜態網頁應用

### 安全建議
- 定期更換 API Key
- 不要在公共電腦上儲存 API Key
- 監控 Google AI Studio 的 API 使用量

## 📄 授權

MIT License

Copyright (c) 2024 The Pocket Company

使用本軟體時，您必須：
1. 保留原作者署名「The Pocket Company」
2. 在公開專案中連結回原始 repository
3. 在社群媒體提及專案時標註 @thepocketcompany

---

**Powered by The Pocket Company**
