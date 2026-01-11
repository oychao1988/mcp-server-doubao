/**
 * 图片生成相关类型定义
 */

/**
 * 支持的图片生成模型
 */
export const IMAGE_MODELS = {
  SEEDREAM_4_5: "doubao-seedream-4-5-251128",
  SEEDREAM_4_0: "doubao-seedream-4-0-250428",
  SEEDREAM_3_0_T2I: "doubao-seedream-3-0-t2i",
  SEEDEDIT_3_0_I2I: "doubao-seededit-3-0-i2i",
} as const;

export type ImageModel = typeof IMAGE_MODELS[keyof typeof IMAGE_MODELS];

/**
 * 图片尺寸类型
 * - Seedream 4.5/4.0: 支持 "2K", "4K", 或自定义像素值如 "2048x2048"
 * - Seedream 3.0-t2i: 支持自定义像素值
 * - Seededit 3.0-i2i: 仅支持 "adaptive"
 */
export type ImageSize =
  | "2K"  // 2K 分辨率
  | "4K"  // 4K 分辨率
  | "adaptive"  // 自适应（仅 Seededit 3.0-i2i）
  | `${number}x${number}`;  // 自定义像素值，如 "2048x2048", "2560x1440"

/**
 * 返回格式
 */
export type ResponseFormat = "url" | "b64_json";

/**
 * 组图生成模式
 */
export type SequentialImageGeneration = "auto" | "disabled";

/**
 * 提示词优化模式
 * 注意: 4.5 模型当前仅支持 "standard" 模式
 */
export type OptimizePromptMode = "standard";

/**
 * 图片生成请求参数
 */
export interface ImageGenerationRequest {
  /** 模型 ID（必选） */
  model: string;

  /** 提示词（必选） */
  prompt: string;

  /** 图片信息（可选）- 支持 URL 或 Base64，支持单图或多图 */
  image?: string | string[];

  /** 图片尺寸（可选） */
  size?: ImageSize;

  /** 随机种子（可选）- 仅 3.0 模型支持，范围 [-1, 2147483647] */
  seed?: number;

  /** 组图功能（可选）- 仅 4.5/4.0 支持 */
  sequential_image_generation?: SequentialImageGeneration;

  /** 组图配置（可选）- 仅 4.5/4.0 支持 */
  sequential_image_generation_options?: {
    /** 最多生成图片数量 [1, 15] */
    max_images?: number;
  };

  /** 流式输出（可选）- 仅 4.5/4.0 支持 */
  stream?: boolean;

  /** 文本权重（可选）- 仅 3.0 模型支持，范围 [1, 10] */
  guidance_scale?: number;

  /** 返回格式（可选）- 默认 "url" */
  response_format?: ResponseFormat;

  /** 水印（可选）- 默认 true */
  watermark?: boolean;

  /** 提示词优化（可选）- 仅 4.5/4.0 支持 */
  optimize_prompt_options?: {
    /** 优化模式 */
    mode?: OptimizePromptMode;
  };

  /** 生成数量（可选，已废弃，使用 sequential_image_generation_options.max_images） */
  count?: number;
}

/**
 * 图片数据
 */
export interface ImageData {
  /** 图片 URL（当 response_format 为 "url" 时返回） */
  url?: string;

  /** Base64 编码的图片（当 response_format 为 "b64_json" 时返回） */
  b64_json?: string;

  /** 图像的宽高像素值（仅 4.5/4.0 支持） */
  size?: string;

  /** 错误信息（某张图片生成失败时） */
  error?: {
    /** 错误码 */
    code?: string;
    /** 错误信息 */
    message?: string;
  };

  /** 优化后的提示词 */
  revised_prompt?: string;
}

/**
 * 用量信息
 */
export interface UsageInfo {
  /** 成功生成的图片张数 */
  generated_images?: number;

  /** 模型生成的图片花费的 token 数量 */
  output_tokens?: number;

  /** 本次请求消耗的总 token 数量 */
  total_tokens?: number;
}

/**
 * 图片生成响应
 */
export interface ImageGenerationResponse {
  /** 本次请求使用的模型 ID */
  model?: string;

  /** 本次请求创建时间的 Unix 时间戳（秒） */
  created: number;

  /** 输出图像的信息 */
  data: ImageData[];

  /** 本次请求的用量信息 */
  usage?: UsageInfo;

  /** 错误信息 */
  error?: {
    /** 错误码 */
    code?: string;
    /** 错误信息 */
    message?: string;
  };
}

/**
 * 图片生成选项（简化版，供外部使用）
 */
export interface ImageGenerationOptions {
  /** 模型 ID */
  model?: string;

  /** 图片尺寸 */
  size?: ImageSize;

  /** 随机种子 */
  seed?: number;

  /** 组图功能 */
  sequential_image_generation?: SequentialImageGeneration;

  /** 组图最大数量 */
  max_images?: number;

  /** 流式输出 */
  stream?: boolean;

  /** 文本权重 */
  guidance_scale?: number;

  /** 返回格式 */
  response_format?: ResponseFormat;

  /** 水印 */
  watermark?: boolean;

  /** 提示词优化模式 */
  optimize_prompt_mode?: OptimizePromptMode;

  /** 生成数量（兼容旧版本） */
  count?: number;

  /** 单张参考图 URL */
  imageUrl?: string;

  /** 多张参考图 URL */
  imageUrls?: string[];
}
