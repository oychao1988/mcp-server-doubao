# 豆包 (Doubao) MCP Server

> 基于 Model Context Protocol (MCP) 的豆包AI模型服务器，支持图片生成和视频生成功能。

[![npm version](https://badge.fury.io/js/%40tonychaos%2Fmcp-server-doubao.svg)](https://www.npmjs.com/package/@tonychaos/mcp-server-doubao)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 功能特性

### 🎨 图片生成 (Doubao Seedream)

#### 支持的模型

| 模型 | 任务类型 | 特点 |
|------|---------|------|
| **doubao-seedream-5.0** | 文生图、单图生图、多图融合(2-14)、组图 | 🔥 最新，深度推理，网络搜索，多轮交互编辑 |
| **doubao-seedream-4.5** | 文生图、单图生图、多图融合(2-14)、组图 | 4K超高清，流式输出 |
| **doubao-seedream-4.0** | 文生图、单图生图、多图融合(2-14)、组图 | 4K超高清，强主体一致性 |
| **doubao-seedream-3.0-t2i** | 文生图 | 支持 seed 和 guidance_scale |
| **doubao-seededit-3.0-i2i** | 单图生图 | 支持 adaptive 尺寸 |

> 💡 **注意**: 服务器支持任意有效的豆包模型ID，包括未来发布的新模型。只需在请求时指定 `model` 参数即可。

#### 核心能力

- ✅ **文生图** - 纯文本提示生成图片
- ✅ **单图生图** - 一张参考图 + 文本提示 → 生成新图片
- ✅ **多图融合** - 多张参考图(2-14张) + 文本提示 → 融合生成
- ✅ **组图功能** - 生成一组内容关联的图片(最多15张)
- ✅ **4K超高清** - 最高 4096x4096 分辨率
- ✅ **自定义尺寸** - 支持自定义像素值，如 2560x1440 (16:9)
- ✅ **Base64返回** - 支持返回 Base64 编码的图片数据
- ✅ **图片下载** - 支持下载图片到本地指定路径
- ✅ **提示词优化** - 自动优化提示词以提升生成质量
- ✅ **水印控制** - 可选择是否添加水印
- ✅ **流式输出** - 实时返回生成进度(4.5/4.0/5.0)
- 🔥 **网络搜索** - 获取实时信息生成内容(5.0)
- 🔥 **深度推理** - 更智能的理解和生成能力(5.0)

#### 图片要求

- **格式**: jpeg, png, webp, bmp, tiff, gif
- **大小**: 最大 10MB
- **分辨率**: 总像素 ≤ 36,000,000 (6000x6000)
- **宽高比**: [1/16, 16] (4.5/4.0), [1/3, 3] (3.0)

### 🎬 视频生成 (Doubao Seedance)

#### 支持的任务类型

- ✅ **文生视频** - 从文本提示生成视频
- ✅ **首帧图生视频** - 从首帧图片和文本生成视频
- ✅ **首尾帧图生视频** - 从首尾帧图片和文本生成视频
- ✅ **图生视频(带遮罩)** - 从图片、遮罩和文本生成视频

#### 核心能力

- ✅ **音画同步** - 自动生成与画面匹配的音频
- ✅ **异步处理** - 支持任务创建和状态查询
- ✅ **任务列表** - 批量查询任务状态
- ✅ **任务取消** - 取消正在进行的任务
- ✅ **多种分辨率** - 720p, 1080p, 1440p

## 📦 安装

### npm 全局安装

```bash
npm install -g @tonychaos/mcp-server-doubao
```

### npx 直接运行（无需安装）

```bash
npx @tonychaos/mcp-server-doubao
```

## ⚙️ 配置

### 1. 获取 API Key

1. 访问 [火山方舟控制台](https://console.volcengine.com/ark/region:ark+cn-beijing/overview)
2. 登录账号
3. 进入「API Key 管理」创建 API Key

### 2. 配置 Claude Desktop

在 Claude Desktop 的配置文件中添加：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "doubao": {
      "command": "npx",
      "args": ["-y", "@tonychaos/mcp-server-doubao"],
      "env": {
        "ARK_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### 3. 重启 Claude Desktop

配置完成后，重启 Claude Desktop 以加载 MCP 服务器。

## 🚀 使用方法

### 图片生成示例

#### 文生图 (2K 高清)

```
请使用豆包生成一张 2K 图片：一只在花园里玩耍的橘猫，阳光明媚
```

#### 文生图 (4K 超高清)

```
请使用豆包生成一张 4K 图片：未来城市夜景，赛博朋克风格，霓虹灯光
```

#### 文生图 (自定义宽高比)

```
请使用豆包生成一张 21:9 的图片：壮丽的山川风景，全景视野
```

#### 组图生成

```
请使用豆包生成一组图片（4张）：春夏秋冬四季的森林景色
```

#### 单图生图

```
请基于这张图片生成一张新图：https://example.com/cat.jpg
让图片中的猫咪戴上一顶红色的帽子，保持其他元素不变
```

#### 多图融合

```
请基于这两张图片生成一张新图：
图片1: https://example.com/style.jpg
图片2: https://example.com/content.jpg
将图片1的艺术风格应用到图片2的内容上
```

#### 无水印高清图

```
请生成一张无水印的图片：一只金毛犬在海滩上奔跑
```

#### 图片下载

```
请下载这张图片并保存到 ./downloads/cat.jpg: https://example.com/cat.jpg
```

### 视频生成示例

#### 文生视频

```
请使用豆包生成一个视频：无人机以极快速度穿越复杂障碍，带来沉浸式飞行体验
```

#### 首帧图生视频

```
请基于这张图片生成一个视频：https://example.com/frame.jpg
让画面中的风景逐渐变得明亮，阳光从云层中射出
```

#### 首尾帧图生视频

```
请基于这两张图片生成一个视频：
首帧: https://example.com/start.jpg
尾帧: https://example.com/end.jpg
描述: 平滑的日转夜过渡效果
```

#### 查询视频任务状态

```
请查询视频任务 task_id_xxx 的状态
```

#### 查询所有视频任务

```
请查询最近创建的所有视频任务
```

## 🔧 开发

### 环境要求

- Node.js >= 18.0.0
- npm 或 yarn

### 构建项目

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 本地运行
ARK_API_KEY=your_api_key_here npm start
```

### 开发模式

```bash
# 监听文件变化自动构建
npm run watch

# 构建并运行
npm run dev
```

### 运行测试

```bash
# 图片生成测试
npx tsx test-image.ts

# 完整功能测试
npx tsx test-image-complete.ts

# 视频生成测试
npx tsx test-video.ts
```

## 📚 API 参考

### 图片生成 API

**端点**: `https://ark.cn-beijing.volces.com/api/v3/images/generations`

**支持模型**:
- `doubao-seedream-5-0-260128` (推荐，最新)
- `doubao-seedream-4-5-251128` (4K超高清，流式输出)
- `doubao-seedream-4-0-250428` (4K超高清)
- `doubao-seedream-3-0-t2i` (文生图)
- `doubao-seededit-3-0-i2i` (图生图)

> 💡 **提示**: 服务器支持任意有效的模型ID，无需等待代码更新即可使用未来发布的新模型。

**价格参考**:
- 2K 图片: ~0.25元/张
- 4K 图片: ~0.5元/张

**官方文档**: [图片生成 API](https://www.volcengine.com/docs/82379/1541523)

### 视频生成 API

**创建任务**: `POST https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks`

**查询任务**: `GET https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks/{id}`

**支持模型**:
- `doubao-seedance-1-5-pro-251215` (推荐)
- `doubao-seedance-1-5` (经济版)

**价格参考**:
- 1.5-pro (有声): ~16元/百万tokens
- 1.5 (有声): ~4元/百万tokens

**官方文档**: [视频生成 API](https://www.volcengine.com/docs/82379/1520757)

## 📁 项目结构

```
mcp-server-doubao/
├── src/
│   ├── index.ts              # 主入口文件
│   ├── server.ts             # MCP 服务器配置
│   ├── tools/                # MCP 工具实现
│   │   ├── image-generation.ts   # 图片生成工具
│   │   └── video-generation.ts   # 视频生成工具
│   ├── api/                  # API 客户端
│   │   ├── client.ts             # 基础 API 客户端
│   │   ├── image-api.ts          # 图片生成 API
│   │   └── video-api.ts          # 视频生成 API
│   ├── types/                # TypeScript 类型定义
│   │   ├── index.ts
│   │   ├── image.ts              # 图片相关类型
│   │   └── video.ts              # 视频相关类型
│   └── utils/                # 工具函数
├── dist/                     # 编译输出目录
├── test-*.ts                 # 测试文件
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 工具和参数说明

### 图片生成工具

#### generate_image (文生图/组图)

**主要参数**:
- `prompt` (必选): 文本提示词
- `model`: 模型选择，默认 "doubao-seedream-5-0-260128"
- `size`: 图片尺寸 ("2K", "4K", "WIDTHxHEIGHT", "adaptive")
- `sequential_image_generation`: 组图模式 ("auto", "disabled")
- `max_images`: 最大生成图片数 [1-15]
- `response_format`: 返回格式 ("url", "b64_json")
- `watermark`: 是否添加水印 (默认 true)

#### image_to_image (图生图/多图融合)

**主要参数**:
- `prompt` (必选): 文本提示词
- `imageUrl`: 单张参考图 URL
- `imageUrls`: 多张参考图 URL 数组 [2-14]
- `model`: 模型选择
- `size`: 图片尺寸
- `sequential_image_generation`: 组图模式

#### download_image (图片下载)

**主要参数**:
- `url` (必选): 图片 URL（通常由 generate_image 返回）
- `filePath` (必选): 本地保存路径（如 /path/to/image.png 或 ./downloads/image.jpg）

**功能说明**:
- 自动携带认证头下载图片
- 自动创建目标目录（如果不存在）
- 返回保存的绝对路径、文件大小和内容类型

### 视频生成工具

#### generate_video (创建视频任务)

**主要参数**:
- `prompt` (必选): 文本提示词
- `task_type`: 任务类型 ("text_to_video", "image_to_video", "frames_to_video")
- `image_url`: 首帧图片 URL
- `end_image_url`: 尾帧图片 URL
- `mask_url`: 遮罩图片 URL
- `resolution`: 分辨率 ("720p", "1080p", "1440p")
- `duration`: 视频时长 [3-10秒]

#### query_video_task (查询视频任务)

**主要参数**:
- `task_id` (必选): 任务 ID

## 📝 更新日志

### v1.3.0 (2026-03-15)

- ✨ 支持 Seedream 5.0 模型
  - 新增 `doubao-seedream-5-0-260128` 模型支持
  - 支持深度推理和网络搜索功能
  - 默认使用最新 5.0 模型
- 🎯 开放模型选择机制
  - 支持任意有效的豆包模型ID
  - 未来发布的新模型无需代码更新即可使用
  - 工具描述中列出已知模型供参考
- 📝 更新文档
  - 更新模型列表和特性说明
  - 添加模型使用建议

### v1.2.0 (2026-01-17)

- ✨ 新增图片下载功能
  - 支持下载图片到本地指定路径
  - 自动携带认证头
  - 自动创建目标目录
  - 返回保存路径、文件大小和内容类型
- 🐛 修复 MCP 工具参数描述无法显示的问题
  - 将 Zod schema 转换为 JSON Schema
  - 确保 MCP 客户端正确解析工具参数信息

### v1.1.0 (2025-01-11)

- ✨ 新增完整的图片生成功能支持
  - 支持 4 个模型 (4.5, 4.0, 3.0-t2i, 3.0-i2i)
  - 文生图、单图生图、多图融合(2-14张)
  - 组图功能，最多生成 15 张关联图片
  - 4K 超高清输出
  - 自定义像素值尺寸
  - Base64 返回格式
  - 提示词优化
  - 水印控制
  - 流式输出支持
- ✨ 新增完整的视频生成功能支持
  - 支持 2 个模型 (1.5-pro, 1.5)
  - 4 种任务类型
  - 任务状态查询
  - 任务列表查询
  - 任务取消功能
- 📝 完善的工具参数说明和使用示例
- 🧪 添加完整的测试用例

### v1.0.0 (2025-01-10)

- 🎉 初始版本发布
- ✅ 基础图片生成功能
- ✅ 基础视频生成功能

## 📄 许可证

[MIT](LICENSE)

## 🔗 相关链接

- [豆包 AI 官网](https://www.doubao.com)
- [火山方舟文档](https://www.volcengine.com/docs/ark)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [MCP SDK 文档](https://github.com/modelcontextprotocol/typescript-sdk)

## 💬 支持

如有问题或建议，请提交 [Issue](https://github.com/oychao1988/mcp-server-doubao/issues)。

## 🙏 致谢

感谢 [Anthropic](https://www.anthropic.com) 开发的 Model Context Protocol 框架。
