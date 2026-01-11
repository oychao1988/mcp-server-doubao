/**
 * 视频生成相关类型定义
 */

/**
 * 支持的视频模型
 *
 * 注意：模型ID包含版本号后缀，这是API要求的完整格式
 * 例如：doubao-seedance-1-0-lite-i2v-250428
 */
export const VIDEO_MODELS = {
  SEEDANCE_1_5_PRO: "doubao-seedance-1-5-pro-251215",
  SEEDANCE_1_0_PRO: "doubao-seedance-1-0-pro-250528",
  SEEDANCE_1_0_PRO_FAST: "doubao-seedance-1-0-pro-fast",
  /** 图生视频 - 参考图模式 (1-4张图片) */
  SEEDANCE_1_0_LITE_I2V: "doubao-seedance-1-0-lite-i2v-250428",
  /** 文生视频 */
  SEEDANCE_1_0_LITE_T2V: "doubao-seedance-1-0-lite-t2v",
} as const;

export type VideoModel = typeof VIDEO_MODELS[keyof typeof VIDEO_MODELS];

/**
 * 视频分辨率
 */
export type VideoResolution = "480p" | "720p" | "1080p";

/**
 * 视频宽高比
 */
export type VideoRatio = "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "21:9" | "adaptive";

/**
 * 视频任务状态
 */
export type VideoTaskStatus =
  | "queued"
  | "running"
  | "cancelled"
  | "succeeded"
  | "failed"
  | "expired";

/**
 * 服务等级
 */
export type ServiceTier = "default" | "flex";

/**
 * 图片角色类型
 */
export type ImageRole =
  | "first_frame" // 首帧
  | "last_frame" // 尾帧
  | "reference_image"; // 参考图

/**
 * 文本内容
 */
export interface TextContent {
  type: "text";
  text: string;
}

/**
 * 图片内容
 */
export interface ImageUrlContent {
  type: "image_url";
  image_url: {
    url: string;
  };
  role?: ImageRole;
}

/**
 * 样片任务内容
 */
export interface DraftTaskContent {
  type: "draft_task";
  draft_task: {
    id: string;
  };
}

/**
 * 视频内容联合类型
 */
export type VideoContent = TextContent | ImageUrlContent | DraftTaskContent;

/**
 * 视频任务创建请求
 */
export interface VideoTaskCreateRequest {
  model: string;
  content: VideoContent[];
  callback_url?: string;
  return_last_frame?: boolean;
  service_tier?: ServiceTier;
  execution_expires_after?: number;
  generate_audio?: boolean;
  draft?: boolean;
  resolution?: VideoResolution;
  ratio?: VideoRatio;
  duration?: number;
  frames?: number;
  seed?: number;
  camera_fixed?: boolean;
  watermark?: boolean;
}

/**
 * 视频任务创建响应
 */
export interface VideoTaskCreateResponse {
  id: string;
  object: string;
  status: VideoTaskStatus;
}

/**
 * 视频内容输出
 */
export interface VideoContentOutput {
  video_url: string;
  last_frame_url?: string;
}

/**
 * 错误信息
 */
export interface VideoError {
  code: string;
  message: string;
}

/**
 * Token 使用情况
 */
export interface VideoUsage {
  completion_tokens: number;
  total_tokens: number;
}

/**
 * 视频任务查询响应
 */
export interface VideoTaskQueryResponse {
  id: string;
  model: string;
  status: VideoTaskStatus;
  content?: VideoContentOutput;
  error?: VideoError | null;
  created_at: number;
  updated_at: number;
  seed?: number;
  resolution?: string;
  ratio?: string;
  duration?: number;
  frames?: number;
  framespersecond?: number;
  service_tier?: string;
  execution_expires_after?: number;
  generate_audio?: boolean;
  draft?: boolean;
  draft_task_id?: string;
  usage?: VideoUsage;
}

/**
 * 图片来源类型
 */
export type ImageSourceType = "url" | "base64";

/**
 * 图片输入
 */
export interface ImageInput {
  data: string; // URL 或 base64 字符串
  type?: ImageSourceType; // 默认为 "url"
  role: ImageRole; // first_frame, last_frame, reference_image
}

/**
 * 视频生成选项
 */
export interface VideoGenerationOptions {
  resolution?: VideoResolution;
  ratio?: VideoRatio;
  duration?: number;
  frames?: number;
  seed?: number;
  camera_fixed?: boolean;
  watermark?: boolean;
  generate_audio?: boolean;
  draft?: boolean;
  service_tier?: ServiceTier;
  execution_expires_after?: number;
  callback_url?: string;
  return_last_frame?: boolean;
  waitForCompletion?: boolean;
  maxAttempts?: number;
  pollInterval?: number;
}

/**
 * 带图片的生成选项
 */
export interface VideoGenerationWithImagesOptions extends VideoGenerationOptions {
  // 首尾帧模式
  firstFrameImage?: string | ImageInput;
  lastFrameImage?: string | ImageInput;

  // 参考图模式（Seedance 1.0 Lite I2V）
  referenceImages?: (string | ImageInput)[];

  // 兼容旧参数
  imageUrl?: string | ImageInput;
  endImageUrl?: string | ImageInput;
}
