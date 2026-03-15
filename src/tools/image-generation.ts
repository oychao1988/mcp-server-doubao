/**
 * 图片生成MCP工具
 *
 * 任务类型说明：
 * 1. 文生图: 纯文本生成图片
 * 2. 单图生图: 一张参考图 + 文本提示 → 生成图片
 * 3. 多图融合: 多张参考图(2-14) + 文本提示 → 融合生成单张图片
 * 4. 组图: 生成一组内容关联的图片(最多15张)
 *
 * 模型能力对比：
 * ┌─────────────────────────┬──────┬──────┬────────┬─────────────┐
 * │ 功能                     │ 4.5  │ 4.0  │ 3.0t2i │ 3.0i2i      │
 * ├─────────────────────────┼──────┼──────┼────────┼─────────────┤
 * │ 文生图                   │ ✅   │ ✅   │ ✅     │ ❌          │
 * │ 单图生图                 │ ✅   │ ✅   │ ❌     │ ✅          │
 * │ 多图融合(2-14张)         │ ✅   │ ✅   │ ❌     │ ❌          │
 * │ 组图功能                 │ ✅   │ ✅   │ ❌     │ ❌          │
 * │ 4K 分辨率                │ ✅   │ ✅   │ ❌     │ ❌          │
 * │ 自定义像素               │ ✅   │ ✅   │ ✅     │ ❌          │
 * │ adaptive 尺寸            │ ❌   │ ❌   │ ❌     │ ✅          │
 * │ seed 参数               │ ❌   │ ❌   │ ✅     │ ✅          │
 * │ guidance_scale 参数     │ ❌   │ ❌   │ ✅     │ ✅          │
 * │ 流式输出                 │ ✅   │ ✅   │ ❌     │ ❌          │
 * │ 提示词优化               │ ✅   │ ✅   │ ❌     │ ❌          │
 * └─────────────────────────┴──────┴──────┴────────┴─────────────┘
 */

import { ImageAPI } from "../api/index.js";
import { promises as fs } from "node:fs";
import { dirname, resolve } from "node:path";
import { z } from "zod";

/**
 * 文生图工具 - Generate images from text prompts
 */
export const generateImageTool = {
  name: "generate_image",
  description: `🎨 Generate images from text prompts using Doubao Seedream models.

【任务类型】
• 文生图: Use text prompt ONLY to create a new image from scratch
• 单图生图: Use imageUrl + prompt to transform/modify a reference image
• 组图: Set sequential_image_generation="auto" to generate multiple related images (up to 15)

【模型选择】Model Selection:
• doubao-seedream-4-5-251128 (DEFAULT): Best overall, supports multi-image fusion (2-14 images), 4K, sequential generation, streaming
• doubao-seedream-4-0-250428: 4K ultra HD, strong subject consistency, requires separate access
• doubao-seedream-3-0-t2i: Text-to-image only, supports seed and guidance_scale, requires separate access
• doubao-seededit-3-0-i2i: Image-to-image only, supports adaptive size, requires separate access

【常用参数组合】Common Parameter Combinations:
1. Basic text-to-image: prompt + size="2K" + watermark=false
2. High quality: prompt + size="4K" + optimize_prompt_mode="standard"
3. Multi-image fusion: prompt + imageUrls=[...] + sequential_image_generation="disabled"
4. Sequential generation: prompt + sequential_image_generation="auto" + max_images=4
5. Image editing: prompt + imageUrl="..." + size="2K"

【尺寸参数】Size Parameter:
• "2K" or "4K": Resolution presets (4.5/4.0 only, 4K requires more credits)
• "WIDTHxHEIGHT": Custom pixels, e.g., "2048x2048", "2560x1440", "3024x1296"
  - For 4.5/4.0: Total pixels in [3686400, 16777216], aspect ratio in [1/16, 16]
  - For 3.0-t2i: In range [512x512, 2048x2048]
  - For 3.0-i2i: Use "adaptive" only

【重要提示】Important Notes:
• Prompt: Recommended under 300 Chinese characters or 600 English words
• Multi-image fusion: Requires 4.5/4.0 model, supports 2-14 reference images
• Sequential generation: Total images (reference + generated) must be ≤15
• Stream mode: Enables real-time progress updates (4.5/4.0 only)
• Watermark: Default is true, set false to remove "AI Generated" watermark`,
  inputSchema: z.object({
    // ========== 必选参数 ==========
    prompt: z.string().describe("📝 Text prompt for image generation (Chinese or English, recommended under 300 characters)"),

    // ========== 模型选择 ==========
    model: z.string().optional().describe(`🤖 Model ID (default: doubao-seedream-4-5-251128)
Known models:
• doubao-seedream-5-0-260128 - Latest (2026-01), web search, deep reasoning
• doubao-seedream-4-5-251128 - 4K, multi-image fusion, streaming
• doubao-seedream-4-0-250428 - 4K ultra HD, strong consistency
• doubao-seedream-3-0-t2i - Text-to-image, supports seed/guidance_scale
• doubao-seededit-3-0-i2i - Image-to-image, supports adaptive size
You can use any valid Doubao model ID, including future releases.`),

    // ========== 尺寸参数 ==========
    size: z.string().optional().describe(`📐 Image size:
• "2K": 2K resolution (~2048x2048), default for 4.5/4.0
• "4K": 4K resolution (~4096x4096), 4.5/4.0 only, higher quality
• "WIDTHxHEIGHT": Custom pixel value, e.g., "2048x2048", "2560x1440" (16:9), "3024x1296" (21:9)
  - For 4.5/4.0: Total pixels in [3686400, 16777216], aspect ratio in [1/16, 16]
  - For 3.0-t2i: In range [512x512, 2048x2048]
• "adaptive": Auto-adaptive from reference image (Seededit 3.0-i2i only)`),

    // ========== 组图功能 (4.5/4.0 only) ==========
    sequential_image_generation: z.enum(["auto", "disabled"]).optional().describe(`🖼️ Enable sequential image generation (组图):
• "auto": Model automatically decides whether to return multiple related images and how many
• "disabled": Generate only one image (default)
• Only supported by 4.5/4.0 models
• Use with max_images to control maximum number of images [1-15]`),
    max_images: z.number().min(1).max(15).optional().describe("🔢 Maximum number of images to generate [1-15], used with sequential_image_generation='auto' (default: 15)"),

    // ========== 3.0 模型专用参数 ==========
    seed: z.number().min(-1).max(2147483647).optional().describe("🎲 Random seed for reproducibility (3.0 models only, -1 for random, same seed ≈ similar result)"),
    guidance_scale: z.number().min(1).max(10).optional().describe("⚖️ Text weight / guidance scale (3.0 models only, range: 1-10, higher = more faithful to prompt, 3.0-t2i default: 2.5, 3.0-i2i default: 5.5)"),

    // ========== 输出参数 ==========
    response_format: z.enum(["url", "b64_json"]).optional().describe("📦 Response format: 'url' for download link (valid for 24h), 'b64_json' for base64 string (default: url)"),
    watermark: z.boolean().optional().describe("💧 Add watermark 'AI Generated' in bottom-right corner (default: true, set false for clean images)"),

    // ========== 提示词优化 (4.5/4.0 only) ==========
    optimize_prompt_mode: z.enum(["standard"]).optional().describe("✨ Prompt optimization mode: 'standard' for higher quality with longer processing time (4.5/4.0 only, note: 4.5 currently only supports 'standard')"),

    // ========== 流式输出 (4.5/4.0 only) ==========
    stream: z.boolean().optional().describe("📡 Enable streaming output for real-time progress updates (4.5/4.0 only, default: false)"),

    // ========== 兼容旧参数 ==========
    count: z.number().min(1).max(15).optional().describe("🔢 (Deprecated) Number of images to generate [1-15], use max_images with sequential_image_generation instead"),
  }),
  handler: async (input: any) => {
    const api = new ImageAPI();

    try {
      const response = await api.generateImage(input.prompt, {
        model: input.model,
        size: input.size,
        seed: input.seed,
        sequential_image_generation: input.sequential_image_generation,
        max_images: input.max_images ?? input.count,
        stream: input.stream,
        guidance_scale: input.guidance_scale,
        response_format: input.response_format,
        watermark: input.watermark,
        optimize_prompt_mode: input.optimize_prompt_mode,
      });

      return {
        success: true,
        model: response.model,
        created: response.created,
        images: response.data.map((img) => ({
          url: img.url,
          base64: img.b64_json,
          size: img.size,
          revisedPrompt: img.revised_prompt,
          error: img.error,
        })),
        usage: response.usage,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const downloadImageTool = {
  name: "download_image",
  description:
    "Download an image by URL and save to a specified file path. The request will include Authorization header (Bearer ARK_API_KEY).",
  inputSchema: z.object({
    url: z
      .string()
      .describe("Image URL to download (typically the url returned by generate_image)"),
    filePath: z
      .string()
      .describe("Local file path to save the image (e.g., /path/to/image.png or ./downloads/image.jpg)"),
  }),
  handler: async (input: { url: string; filePath: string }) => {
    const api = new ImageAPI();

    try {
      const result = await api.downloadImage(input.url);

      const absolutePath = resolve(input.filePath);
      const dir = dirname(absolutePath);

      await fs.mkdir(dir, { recursive: true });

      const buffer = Buffer.from(result.base64, "base64");
      await fs.writeFile(absolutePath, buffer);

      return {
        success: true,
        url: input.url,
        filePath: absolutePath,
        contentType: result.contentType,
        bytes: result.bytes,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

/**
 * 图生图工具 - Generate images from reference images
 */
export const imageToImageTool = {
  name: "image_to_image",
  description: `🖼️ Generate images from reference images using Doubao Seedream models.

【任务类型】Task Types:
• 单图生图 (Single Image): imageUrl + prompt → Transform/edit a reference image
• 多图融合 (Multi-Image Fusion): imageUrls (2-14) + prompt → Fuse styles/content from multiple images
• 组图: Set sequential_image_generation="auto" to generate multiple related images from references

【模型选择】Model Selection:
• doubao-seedream-4-5-251128 (DEFAULT): Best for multi-image fusion (2-14 images), supports sequential generation
• doubao-seedream-4-0-250428: 4K ultra HD, strong subject consistency, requires separate access
• doubao-seededit-3-0-i2i: Image-to-image editing only, supports adaptive size and seed, requires separate access

【常用参数组合】Common Parameter Combinations:
1. Single image editing: imageUrl + prompt + size="2K"
2. Multi-image fusion: imageUrls=[url1, url2, ...] + prompt + sequential_image_generation="disabled"
3. Multi-reference sequential: imageUrls=[...] + prompt + sequential_image_generation="auto" + max_images=3
4. Adaptive editing (3.0-i2i): imageUrl + prompt + size="adaptive" + seed=123

【图片要求】Image Requirements:
• Formats: jpeg, png, webp, bmp, tiff, gif (4.5/4.0 support more formats)
• Size: Max 10MB per image, total pixels ≤ 6000x6000 = 36,000,000
• Aspect ratio: [1/16, 16] for 4.5/4.0, [1/3, 3] for 3.0 models
• For multi-image fusion: Reference images + generated images ≤ 15 total

【重要提示】Important Notes:
• imageUrl vs imageUrls: Use imageUrl for single image, imageUrls (array) for multiple images (2-14)
• Base64 format: data:image/png;base64,<base64_string> (format must be lowercase)
• Sequential mode with references: Model can generate multiple images based on reference images`,
  inputSchema: z.object({
    // ========== 必选参数 ==========
    prompt: z.string().describe("📝 Text prompt for image transformation/editing"),

    // ========== 模型选择 ==========
    model: z.string().optional().describe(`🤖 Model ID (default: doubao-seedream-4-5-251128)
Known models:
• doubao-seedream-5-0-260128 - Latest (2026-01), web search, deep reasoning
• doubao-seedream-4-5-251128 - Best for multi-image fusion (2-14 images)
• doubao-seedream-4-0-250428 - 4K ultra HD, strong subject consistency
• doubao-seededit-3-0-i2i - Image-to-image, adaptive size
You can use any valid Doubao model ID, including future releases.`),

    // ========== 图片输入 (二选一) ==========
    imageUrl: z.string().optional().describe("🖼️ Single reference image URL or base64 data URI (format: data:image/png;base64,...)"),
    imageUrls: z.array(z.string()).min(2).max(14).optional().describe("🖼️🖼️ Multiple reference image URLs or base64 data URIs (2-14 images, 4.5/4.0 only, for multi-image fusion)"),

    // ========== 尺寸参数 ==========
    size: z.string().optional().describe(`📐 Image size:
• "2K": 2K resolution (~2048x2048), default for 4.5/4.0
• "4K": 4K resolution (~4096x4096), 4.5/4.0 only
• "WIDTHxHEIGHT": Custom pixel value, e.g., "2048x2048", "2560x1440"
  - For 4.5/4.0: Total pixels in [3686400, 16777216], aspect ratio in [1/16, 16]
  - For 3.0-i2i: Use [512x512, 2048x2048]
• "adaptive": Auto-adaptive from reference image (Seededit 3.0-i2i only, matches closest preset ratio)`),

    // ========== 组图功能 (4.5/4.0 only) ==========
    sequential_image_generation: z.enum(["auto", "disabled"]).optional().describe("🖼️ Enable sequential image generation: 'auto' for multiple related images, 'disabled' for single image (default: disabled)"),
    max_images: z.number().min(1).max(15).optional().describe("🔢 Maximum number of images to generate [1-15], reference + generated ≤15"),

    // ========== 3.0 模型专用参数 ==========
    seed: z.number().min(-1).max(2147483647).optional().describe("🎲 Random seed for reproducibility (Seededit 3.0-i2i only, -1 for random)"),
    guidance_scale: z.number().min(1).max(10).optional().describe("⚖️ Text weight (Seededit 3.0-i2i only, range: 1-10, default: 5.5)"),

    // ========== 输出参数 ==========
    response_format: z.enum(["url", "b64_json"]).optional().describe("📦 Response format: 'url' for download link, 'b64_json' for base64 string (default: url)"),
    watermark: z.boolean().optional().describe("💧 Add watermark (default: true, set false for clean images)"),

    // ========== 提示词优化 (4.5/4.0 only) ==========
    optimize_prompt_mode: z.enum(["standard"]).optional().describe("✨ Prompt optimization mode: 'standard' for higher quality (4.5/4.0 only)"),

    // ========== 流式输出 (4.5/4.0 only) ==========
    stream: z.boolean().optional().describe("📡 Enable streaming output for real-time progress (4.5/4.0 only, default: false)"),

    // ========== 兼容旧参数 ==========
    count: z.number().min(1).max(15).optional().describe("🔢 (Deprecated) Number of images to generate [1-15]"),
  }),
  handler: async (input: any) => {
    const api = new ImageAPI();

    try {
      let response;

      if (input.imageUrls && input.imageUrls.length > 0) {
        // 多张参考图 - Multi-image fusion
        response = await api.imageToMultipleImages(input.prompt, input.imageUrls, {
          model: input.model,
          size: input.size,
          seed: input.seed,
          sequential_image_generation: input.sequential_image_generation,
          max_images: input.max_images ?? input.count,
          stream: input.stream,
          guidance_scale: input.guidance_scale,
          response_format: input.response_format,
          watermark: input.watermark,
          optimize_prompt_mode: input.optimize_prompt_mode,
        });
      } else if (input.imageUrl) {
        // 单张参考图 - Single image transformation
        response = await api.imageToImage(input.prompt, input.imageUrl, {
          model: input.model,
          size: input.size,
          seed: input.seed,
          sequential_image_generation: input.sequential_image_generation,
          max_images: input.max_images ?? input.count,
          stream: input.stream,
          guidance_scale: input.guidance_scale,
          response_format: input.response_format,
          watermark: input.watermark,
          optimize_prompt_mode: input.optimize_prompt_mode,
        });
      } else {
        throw new Error("Either imageUrl or imageUrls must be provided");
      }

      return {
        success: true,
        model: response.model,
        created: response.created,
        images: response.data.map((img) => ({
          url: img.url,
          base64: img.b64_json,
          size: img.size,
          revisedPrompt: img.revised_prompt,
          error: img.error,
        })),
        usage: response.usage,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
