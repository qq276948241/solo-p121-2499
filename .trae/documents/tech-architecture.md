## 1. 架构设计

```mermaid
flowchart TB
    A["Vue 3 前端应用"] --> B["Vue Router 路由层"]
    B --> C["首页 Home"]
    B --> D["添加页 Add"]
    B --> E["详情页 Detail"]
    B --> F["统计页 Stats"]
    A --> G["Composables 状态层"]
    G --> H["useMovies 电影数据管理"]
    G --> I["useStorage localStorage持久化"]
    H --> J["localStorage 数据层"]
```

## 2. 技术描述
- **前端框架**：Vue 3 + TypeScript + Vite
- **路由管理**：Vue Router 4
- **样式方案**：Tailwind CSS 3
- **图标库**：lucide-vue-next
- **数据存储**：localStorage（纯前端持久化）
- **图表方案**：原生SVG绘制环形图（无需额外依赖）

## 3. 路由定义
| 路由 | 用途 |
|-------|---------|
| / | 首页：电影卡片网格 + 筛选条 |
| /add | 添加页：电影信息录入表单 |
| /movie/:id | 详情页：电影完整信息 + 打分 + 短评 |
| /stats | 统计页：环形图 + 数据概览 |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    MOVIE {
        string id PK "唯一ID"
        string title "片名"
        string director "导演"
        number year "上映年份"
        string poster "海报URL"
        string genre "类型"
        string status "状态: watched/wishlist"
        number rating "评分: 0-5, 步长0.5"
        string review "短评"
        number createdAt "创建时间戳"
        number updatedAt "更新时间戳"
    }
```

### 4.2 数据结构定义（TypeScript）
```typescript
type MovieStatus = 'watched' | 'wishlist';

interface Movie {
  id: string;
  title: string;
  director: string;
  year: number;
  poster: string;
  genre: string;
  status: MovieStatus;
  rating: number;
  review: string;
  createdAt: number;
  updatedAt: number;
}

const GENRES = [
  '动作', '喜剧', '剧情', '科幻', '悬疑',
  '爱情', '动画', '恐怖', '纪录片', '其他'
];
```

## 5. Composables 设计

### useMovies
- 响应式电影列表
- 筛选逻辑（类型、状态、排序）
- CRUD 操作（增删改查）
- 评分、短评更新

### useStorage
- localStorage 读写封装
- 初始化数据加载
- 自动同步变更到存储
