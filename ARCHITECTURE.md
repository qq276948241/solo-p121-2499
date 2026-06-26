# 光影手札 · 架构文档

> 一个基于 Vue 3 + TypeScript + Tailwind CSS 的私人影单 SPA。数据全程本地存储，刷新不丢。

---

## 一、文件结构（缩进图）

```
project121/
├── index.html
├── tailwind.config.js         # amber/zinc 主题色阶 + 自定义动画
├── vite.config.ts
├── tsconfig.json
├── ARCHITECTURE.md            # ← 你正在看的这份
│
├── src/
│   ├── main.ts                # 挂载 Vue App + Router
│   ├── App.vue                # 根组件：背景光晕 + 页面 transition
│   ├── style.css              # 中文字体栈、自定义滚动条、全局工具样式
│   │
│   ├── types/
│   │   └── index.ts           # Movie / MovieStatus / GENRES 常量等类型定义
│   │
│   ├── router/
│   │   └── index.ts           # 4 条路由 + scrollBehavior
│   │
│   ├── composables/           # 业务逻辑层（见下）
│   │   ├── useStorage.ts      # localStorage 读写封装
│   │   └── useMovies.ts       # 核心：状态 + 筛选 + CRUD + 统计
│   │
│   ├── components/            # 展示组件（纯 UI，不持有业务状态）
│   │   ├── NavBar.vue         # 固定吸顶导航
│   │   ├── MovieCard.vue      # 电影卡片（hover 动画）
│   │   └── StarRating.vue     # 五星打分（半星精度）
│   │
│   └── pages/                 # 页面层（消费 composable，负责 UI 编排）
│       ├── HomePage.vue       # 筛选条 + 卡片网格
│       ├── AddPage.vue        # 添加表单 + 海报预览
│       ├── DetailPage.vue     # 详情 + 打分 + 短评 + 删除
│       └── StatsPage.vue      # 环形图 + Top5 + 进度条
```

**说明**：当前项目**没有** `useTheme.ts`。主题方案以 Tailwind 配置为主（`tailwind.config.js` 里的 amber 色阶 + zinc 深灰色系），全局样式在 `src/style.css`，组件级颜色全部直接用 Tailwind class 编写（如 `bg-zinc-800/40`、`text-amber-400`）。如果后续需要引入**可切换主题**（如浅色模式、彩色模式），新增 `src/composables/useTheme.ts` 即可（见「六、扩展指南」）。

---

## 二、三层架构与数据流向

```
┌──────────────────────────────────────────────────────────────────┐
│  页面层 (src/pages/*.vue)                                         │
│  HomePage / AddPage / DetailPage / StatsPage                      │
│    • 只负责模板渲染、交互事件绑定（v-model、@click）                │
│    • 不直接访问 localStorage，也不持有共享业务状态                  │
│    • 通过解构赋值从 composable 按需消费状态与方法                   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼  解构导入（解构本身会触发 Proxy 属性访问，建立依赖）
┌──────────────────────────────────────────────────────────────────┐
│  业务逻辑层 (src/composables/useMovies.ts)                         │
│  const { filteredMovies, filterState, stats, addMovie, ... }      │
│  = useMovies();                                                   │
│    • 核心状态：movies.value（原始数组，只改这里）                   │
│    • 派生状态：filteredMovies（computed，管道式筛选+排序）           │
│    • 派生状态：stats（computed，聚合统计）                          │
│    • 命令式方法：addMovie / updateMovie / deleteMovie / ...        │
│    • 不依赖 Vue Router、不操作 DOM                                 │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼  useMovies() 内部调用 useStorage()
┌──────────────────────────────────────────────────────────────────┐
│  存储层 (src/composables/useStorage.ts)                            │
│  const movies = ref<Movie[]>(loadFromStorage());                  │
│  watch(movies, saveToStorage, { deep: true });                    │
│    • 单一职责：只关心 localStorage 与内存 ref 的双向同步            │
│    • 不理解类型、状态、评分等业务概念                                │
│    • 对外只导出 { movies }，任何修改都会被 deep watch 自动持久化    │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼  JSON.stringify / JSON.parse
┌──────────────────────────────────────────────────────────────────┐
│  localStorage (key: 'my-movie-list-v2')                            │
│  纯字符串持久化。版本号 v2，加载失败或缺省时退回 16 部内置假数据。   │
└──────────────────────────────────────────────────────────────────┘
```

### 数据流关键原则

1. **单向写入**：只有 `useMovies` 的 CRUD 方法（add / update / delete / setRating / setReview / toggleStatus）会改变 `movies.value`。页面层**绝不**直接 push / splice `movies`。
2. **只读派生**：`filteredMovies` 和 `stats` 是 `computed`，对页面层来说是只读视图。所有筛选条件通过写入 `filterState` 这个 reactive 对象触发重算。
3. **自动持久化**：`useStorage` 的 `watch(..., { deep: true })` 确保任何对 `movies.value` 内部字段的修改（甚至只改了某条的 rating）都会自动写回 localStorage。

---

## 三、`useMovies.ts` 核心解析

`useMovies` 是整个应用唯一的业务入口。它的对外契约分三类：**状态**（可读写或只读）、**派生计算**（只读）、**命令**（函数）。

### 3.1 导出清单

| 名称 | 类型 | 说明 |
|---|---|---|
| `movies` | `Ref<Movie[]>` | 原始电影数组（存储层直接代理出来的 ref）。页面层一般只读。 |
| `filterState` | `Reactive<MovieFilterState>` | 筛选条件集合，**页面层唯一的写入点**。字段见下。 |
| `filteredMovies` | `ComputedRef<Movie[]>` | 经过「类型→状态→年份范围→排序」管道后的结果。只读。 |
| `stats` | `ComputedRef<Stats>` | 统计聚合（总数、已看、想看、均分、类型分布）。只读。 |
| `findMovie(id)` | `(string) => Movie \| undefined` | 按 ID 单条查询。 |
| `addMovie(data)` | `(Omit<...>) => Movie` | 新增一条，自动生成 id / createdAt，返回新对象。 |
| `updateMovie(id, patch)` | `(string, Partial<...>) => void` | 局部更新，自动刷新 updatedAt。 |
| `deleteMovie(id)` | `(string) => void` | 按 ID 删除。 |
| `setRating(id, rating)` | `(string, number) => void` | updateMovie 的语义封装。 |
| `setReview(id, review)` | `(string, string) => void` | 同上。 |
| `toggleStatus(id)` | `(string) => void` | watched ↔ wishlist 互切。 |

### 3.2 `MovieFilterState` 结构

```ts
interface MovieFilterState {
  genre: string;          // 'all' | GENRES[i]
  status: 'all' | MovieStatus;
  sort: SortKey;          // 'newest' | 'rating-desc' | 'rating-asc' | 'year-desc' | 'year-asc'
  yearFrom: number | '';  // 起始年份（空=不限）
  yearTo: number | '';    // 结束年份（空=不限）
}
```

### 3.3 筛选管道（纯函数 + pipe）

`filteredMovies` 的实现不使用链式写法，而是拆成 4 个独立纯函数，再由 `pipeMovies` 按固定顺序串联：

```
原始数组 movies.value
     │
     ▼ filterByGenre()        ← 按 filterState.genre 过滤，未选时返回 slice 拷贝
     ▼ filterByStatus()       ← 按 filterState.status 过滤
     ▼ filterByYear()         ← 按 [yearFrom, yearTo] 闭区间过滤
     ▼ sortMovies()           ← 按 sortKey 排序（sort 前做一次 slice 保证不原地改上一级数组）
     │
     ▼
最终结果（computed 缓存）
```

**设计要点**：
- 4 个纯函数**不访问 reactive**，只接收普通值入参，便于测试，也避免 Vue 依赖追踪时序问题。
- 即使条件是 `'all'` 或空，函数也会返回 `movies.slice()`，保证管道每一步都产出独立的新数组引用，防止 Vue diff 时因引用相同造成的 DOM 节点复用异常（重复 / 消失 Bug）。
- `computed` 中**显式解包** `filterState.genre` 等 5 个属性分别传参，而不是把整个 reactive 对象当参数传进去。这样 Vue 能为每个属性建立独立的依赖边，任意一个改了都会正确重算。

---

## 四、各页面消费明细

### 4.1 HomePage.vue（首页：筛选 + 列表）

```ts
const { filteredMovies, filterState, stats } = useMovies();
```

| 消费项 | 用途 |
|---|---|
| `filterState.genre` | 类型下拉框 v-model，双向绑定 |
| `filterState.status` | 三按钮（全部/已看/想看）点击时赋值 |
| `filterState.yearFrom` | 年份起始输入框 v-model.number |
| `filterState.yearTo` | 年份结束输入框 v-model.number |
| `filterState.sort` | 排序下拉框 v-model |
| `filteredMovies` | 卡片网格 v-for 渲染 |
| `stats.total / watchedCount / wishlistCount` | 页头摘要文案 |

### 4.2 AddPage.vue（添加页：表单）

```ts
const { addMovie } = useMovies();
```

| 消费项 | 用途 |
|---|---|
| `addMovie(data)` | 表单校验通过后调用，拿到返回的 `movie.id` 再跳转到详情页 |

页面自己用本地 `ref` 持有 6 个表单字段（title / director / year / poster / genre / status），**不碰 filterState**。

### 4.3 DetailPage.vue（详情页：查看 + 修改）

```ts
const { findMovie, setRating, setReview, toggleStatus, deleteMovie, updateMovie } = useMovies();
```

| 消费项 | 用途 |
|---|---|
| `findMovie(id)` | 用路由 params.id 拿整条记录，computed 包装 |
| `setRating(id, n)` | 五星打分保存 |
| `setReview(id, text)` | 短评保存 |
| `toggleStatus(id)` | 「已看 / 想看」切换按钮 |
| `deleteMovie(id)` | 删除确认后调用，再跳回首页 |
| `updateMovie(id, { status })` | 打分>0 且当前是 wishlist 时，强制状态升为 watched（语义补正） |

页面本地 ref 只存表单暂存态（`localRating`、`localReview`、`reviewEditing`、`confirmDelete` 等 UI 状态），不污染共享层。

### 4.4 StatsPage.vue（统计页：只读视图）

```ts
const { stats, movies } = useMovies();
```

| 消费项 | 用途 |
|---|---|
| `stats.*`（5 个字段） | 4 个数据卡片 + 环形图数据 + 完成度进度条 |
| `movies.value` | 额外派生一个 Top5 高分榜（按 rating 倒序取前 5），不写回 |

---

## 五、主题与样式约定

当前项目的视觉风格**未抽象**成独立的 `useTheme`，而是通过三层约定固化：

1. **色板**：`tailwind.config.js` 中扩展了完整的 `amber`（琥珀色强调色）+ `zinc`（深灰背景色）色阶。组件只能从这两套调色板选色。
2. **设计令牌**：所有圆角、阴影、间距都用 Tailwind 默认令牌 + 少量自定义（如 `rounded-2xl` / `rounded-3xl`、`shadow-lg shadow-amber-500/25`）。
3. **全局兜底**：`src/style.css` 负责中文字体栈（系统中文 → PingFang → Microsoft YaHei）、滚动条样式、`<select>` 下拉箭头、`input[type=number]` 隐藏上下箭头等 CSS 级规范。
4. **App.vue**：在固定吸顶 NavBar 之下加了 `bg-gradient-radial` 的琥珀色光晕装饰，是品牌视觉的主要来源。

如果后续需要把主题做成可切换（比如用户可选「深夜 / 暖色 / 浅色」三种），参考「六.2」。

---

## 六、扩展指南（平滑升级路径）

### 6.1 加标签系统（给每部电影打多个自定义 tag）

**步骤**：

1. **类型层** `src/types/index.ts`
   ```ts
   interface Movie {
     // ...已有字段
     tags: string[];   // 新增
   }
   ```

2. **业务层** `src/composables/useMovies.ts`
   - `MovieFilterState` 新增 `tag: string`（单选）或 `tags: string[]`（多选）
   - 新增纯函数 `filterByTag(movies: Movie[], tag: string): Movie[]`
   - `pipeMovies` 里把 `filterByTag` 插到 `filterByGenre` 之后、`filterByStatus` 之前
   - `stats` computed 里新增 `tagStats`（标签分布聚合）
   - `addMovie` / `updateMovie` 的 patch 类型自然支持 tags（Partial 已经包含）

3. **页面层**
   - **HomePage**：筛选条 `lg:grid-cols-4` 改成 `lg:grid-cols-5`，加一格「标签」下拉框或 tag chips，v-model 到 `filterState.tag`
   - **AddPage / DetailPage**：加一个标签输入/管理组件，用 `updateMovie(id, { tags })` 保存
   - **StatsPage**：复用环形图组件，加一个「标签占比」的 donut

4. **存储层**：`STORAGE_KEY` 升一个版本号（`my-movie-list-v3`），`getDefaultMovies()` 返回的假数据里给每部都塞一两个示例 tags，**或者**在 `loadFromStorage` 里给老数据补 `tags: []` 的默认值（避免 undefined）。

整个过程**不需要改 useStorage.ts** 的实现，只要 Movie 类型对得上、load 时数据完整，deep watch 会自动处理一切。

### 6.2 加导入导出（JSON / CSV）

**步骤**：

1. **新建 `src/composables/useImportExport.ts`**，作为独立的可选模块，不侵入 useMovies：
   ```ts
   import { useMovies } from './useMovies';

   export function useImportExport() {
     const { movies, addMovie } = useMovies();    // 复用现有入口

     function exportJSON(): string {
       return JSON.stringify(movies.value, null, 2);
     }

     function downloadJSON(): void {
       const blob = new Blob([exportJSON()], { type: 'application/json' });
       // ...触发下载
     }

     function importJSON(raw: string): { ok: number; skipped: number } {
       const parsed = JSON.parse(raw);
       // 校验：必须是数组、每条至少有 title/director/year
       let ok = 0, skipped = 0;
       for (const item of parsed) {
         if (item.title && item.director && item.year) {
           addMovie(item);     // 通过 useMovies 的正规入口写入
           ok++;
         } else {
           skipped++;
         }
       }
       return { ok, skipped };
     }

     return { exportJSON, downloadJSON, importJSON };
   }
   ```

2. **UI 层**：在 NavBar 或 StatsPage 加一个「设置」菜单，点进去暴露导入/导出按钮。
3. **注意点**：
   - 导入**必须**走 `addMovie`，不要直接 `movies.value = ...` 整体覆盖。走 addMovie 才能保证 id / createdAt / 缺失字段默认值都一致。
   - 如果想支持「全量覆盖导入」，再另加一个 `replaceAllMovies(newList)` 方法到 useMovies，而不是在 import 模块里直接改 movies.value。
   - 建议导出时附带 `__schema_version: 3` 元字段，未来升级格式可以做迁移。

### 6.3 加 useTheme.ts（可切换主题）

如果想做浅色模式等，不必改现有页面的任何 Tailwind class（那要改的地方太多）。推荐用 **CSS 变量 + data-attribute** 方案：

1. **新建 `src/composables/useTheme.ts`**：
   ```ts
   import { ref, watch } from 'vue';
   export type Theme = 'dark' | 'light' | 'warm';

   export function useTheme() {
     const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'dark');
     watch(theme, (v) => {
       document.documentElement.dataset.theme = v;
       localStorage.setItem('theme', v);
     }, { immediate: true });
     return { theme };
   }
   ```

2. **改 `src/style.css`**：
   ```css
   :root, [data-theme="dark"] { /* 现有深灰+琥珀色变量 */ }
   [data-theme="light"] { /* 覆盖 CSS 变量 */ }
   [data-theme="warm"]  { /* 覆盖 CSS 变量 */ }
   ```

3. **改 `tailwind.config.js`**：把 amber/zinc 色阶绑定到 CSS 变量（用 `rgb(var(--color-amber-500) / <alpha-value>)` 语法）。现有页面 class 不用动一行。

4. **在 NavBar 加一个主题切换按钮**，调 `useTheme()` 改值即可。完全正交于 useMovies / useStorage，不会互相干扰。

---

> **设计哲学小结**：所有扩展都遵循「**加代码，不拆代码**」的原则——
> 新增的维度（tags、导入导出、主题）各自作为独立的 composable 或独立的纯函数接到现有链路里，**不动 useMovies 的公共契约**，也不动页面层已有字段。这样升级过程中几乎不可能引入回归 Bug。
