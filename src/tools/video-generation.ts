/**
 * 视频生成MCP工具
 */

import { VideoAPI } from "../api/index.js";
import { VIDEO_MODELS } from "../types/index.js";
import { z } from "zod";

/**
 * 获取模型枚举值
 */
const MODEL_ENUM = z.enum([
  VIDEO_MODELS.SEEDANCE_1_5_PRO,
  VIDEO_MODELS.SEEDANCE_1_0_PRO,
  VIDEO_MODELS.SEEDANCE_1_0_PRO_FAST,
  VIDEO_MODELS.SEEDANCE_1_0_LITE_I2V,
  VIDEO_MODELS.SEEDANCE_1_0_LITE_T2V,
  "custom", // 允许自定义模型ID
]);

/**
 * 视频生成工具
 */
export const generateVideoTool = {
  name: "generate_video",
  description: "Generate videos from text or images using Doubao Seedance model. Supports text-to-video, image-to-video (first frame), and image-to-video (first & last frame).",
  inputSchema: z.object({
    // 必填参数
    prompt: z.string().describe("Text prompt for video generation (supports Chinese and English, recommended under 500 characters)"),

    // 图片参数
    imageUrl: z.string().optional().describe("[First Frame] First frame image URL. Supports HTTP/HTTPS URL or Base64 (data:image/png;base64,...)"),
    endImageUrl: z.string().optional().describe("[Last Frame] Last frame image URL. Supports HTTP/HTTPS URL or Base64"),
    referenceImages: z.array(z.string()).max(4).optional().describe("[Reference Images] Array of 1-4 reference image URLs for Seedance 1.0 Lite I2V model"),

    // 模型选择
    model: z.string().optional().describe(`Model ID. Options: ${Object.values(VIDEO_MODELS).join(", ")}. Default: ${VIDEO_MODELS.SEEDANCE_1_5_PRO}`),

    // 视频输出参数
    resolution: z.enum(["480p", "720p", "1080p"]).optional().describe("Video resolution. Default: 720p (Seedance 1.5 pro/lite), 1080p (Seedance 1.0 pro/pro-fast)"),
    ratio: z.enum(["16:9", "4:3", "1:1", "3:4", "9:16", "21:9", "adaptive"]).optional().describe("Video aspect ratio. Default: adaptive for Seedance 1.5 pro, 16:9 for others"),
    duration: z.number().int().min(2).max(12).optional().describe("Video duration in seconds (2-12). Default: 5. Seedance 1.5 pro also supports -1 for auto-selection"),
    frames: z.number().int().min(29).max(289).optional().describe("Number of frames (29-289, must match format 25+4n). Priority over duration"),
    seed: z.number().int().min(-1).max(4294967295).optional().describe("Seed for reproducibility (-1 for random)"),

    // 功能开关
    generate_audio: z.boolean().optional().describe("Generate synchronized audio (default: true, only for Seedance 1.5 pro)"),
    draft: z.boolean().optional().describe("Draft mode for quick preview (default: false, only for Seedance 1.5 pro)"),
    watermark: z.boolean().optional().describe("Add watermark to video (default: false)"),
    camera_fixed: z.boolean().optional().describe("Fixed camera mode (default: false, not supported for reference images)"),
    return_last_frame: z.boolean().optional().describe("Return last frame image (default: false)"),

    // 服务参数
    service_tier: z.enum(["default", "flex"]).optional().describe("Service tier: 'default' (online, lower quota) or 'flex' (offline, 50% price, higher quota). Default: default"),
    execution_expires_after: z.number().int().min(3600).max(259200).optional().describe("Task expiration time in seconds (3600-259200). Default: 172800 (48 hours)"),
    callback_url: z.string().url().optional().describe("Callback URL for task status notifications"),

    // 轮询参数
    waitForCompletion: z.boolean().optional().describe("Whether to wait for completion (default: false)"),
    maxAttempts: z.number().int().positive().optional().describe("Max polling attempts (default: 60)"),
    pollInterval: z.number().int().positive().optional().describe("Poll interval in milliseconds (default: 5000)"),
  }),
  handler: async (input: any) => {
    const api = new VideoAPI();

    try {
      // 提取选项
      const {
        prompt,
        model,
        waitForCompletion,
        maxAttempts,
        pollInterval,
        imageUrl,
        endImageUrl,
        referenceImages,
        ...options
      } = input;

      // 构建视频选项
      const videoOptions: any = {
        ...options,
        waitForCompletion,
        maxAttempts,
        pollInterval,
      };

      // 添加图片参数
      if (imageUrl) videoOptions.imageUrl = imageUrl;
      if (endImageUrl) videoOptions.endImageUrl = endImageUrl;
      if (referenceImages && referenceImages.length > 0) {
        videoOptions.referenceImages = referenceImages;
      }

      const result = await api.generateVideo(
        prompt,
        videoOptions,
        model
      );

      if (input.waitForCompletion && result.result) {
        return {
          success: true,
          taskId: result.taskId,
          status: result.result.status,
          videoUrl: result.result.content?.video_url,
          lastFrameUrl: result.result.content?.last_frame_url,
          resolution: result.result.resolution,
          ratio: result.result.ratio,
          duration: result.result.duration,
          frames: result.result.frames,
          seed: result.result.seed,
          usage: result.result.usage,
        };
      }

      return {
        success: true,
        taskId: result.taskId,
        message: "Video generation task created. Use query_video_task to check status.",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
