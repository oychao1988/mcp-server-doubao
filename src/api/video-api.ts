/**
 * 视频生成API
 */

import { APIClient } from "./client.js";
import {
  VIDEO_MODELS,
  VideoTaskCreateRequest,
  VideoTaskCreateResponse,
  VideoTaskQueryResponse,
  VideoContent,
  VideoGenerationOptions,
  VideoTaskStatus,
  VideoModel,
} from "../types/index.js";

/**
 * 默认视频生成模型ID
 */
export const DEFAULT_VIDEO_MODEL = VIDEO_MODELS.SEEDANCE_1_5_PRO;

/**
 * 默认轮询配置
 */
const DEFAULT_POLL_CONFIG = {
  maxAttempts: 60,
  pollInterval: 5000,
};

/**
 * 视频API类
 */
export class VideoAPI extends APIClient {
  /**
   * 创建视频生成任务
   */
  async createTask(
    prompt: string,
    options: VideoGenerationOptions & {
      // 首尾帧模式
      firstFrameImage?: string;
      lastFrameImage?: string;

      // 参考图模式（1-4张图片）
      referenceImages?: string[];

      // 兼容旧参数
      imageUrl?: string;
      endImageUrl?: string;
    } = {},
    model?: string
  ): Promise<VideoTaskCreateResponse> {
    const content: VideoContent[] = [{ type: "text", text: prompt }];

    // 处理首帧图片
    const firstImage = options.firstFrameImage || options.imageUrl;
    if (firstImage) {
      content.push({
        type: "image_url",
        image_url: { url: firstImage },
        role: "first_frame",
      });
    }

    // 处理尾帧图片
    const lastImage = options.lastFrameImage || options.endImageUrl;
    if (lastImage) {
      content.push({
        type: "image_url",
        image_url: { url: lastImage },
        role: "last_frame",
      });
    }

    // 处理参考图模式（1-4张）
    if (options.referenceImages && options.referenceImages.length > 0) {
      if (options.referenceImages.length > 4) {
        throw new Error("最多支持4张参考图片");
      }

      options.referenceImages.forEach((imageUrl) => {
        content.push({
          type: "image_url",
          image_url: { url: imageUrl },
          role: "reference_image",
        });
      });
    }

    // 构建请求体
    const requestBody: VideoTaskCreateRequest = {
      model: model || DEFAULT_VIDEO_MODEL,
      content,
      callback_url: options.callback_url,
      return_last_frame: options.return_last_frame,
      service_tier: options.service_tier,
      execution_expires_after: options.execution_expires_after,
      generate_audio: options.generate_audio,
      draft: options.draft,
      resolution: options.resolution,
      ratio: options.ratio,
      duration: options.duration,
      frames: options.frames,
      seed: options.seed,
      camera_fixed: options.camera_fixed,
      watermark: options.watermark,
    };

    // 移除 undefined 的字段
    Object.keys(requestBody).forEach(
      (key) =>
        requestBody[key as keyof VideoTaskCreateRequest] === undefined &&
        delete requestBody[key as keyof VideoTaskCreateRequest]
    );

    // 调试：打印请求体
    console.debug("[VideoAPI] Request body:", JSON.stringify(requestBody, null, 2));

    return this.post<VideoTaskCreateResponse>(
      "/api/v3/contents/generations/tasks",
      requestBody
    );
  }

  /**
   * 查询任务状态
   */
  async queryTask(taskId: string): Promise<VideoTaskQueryResponse> {
    return this.get<VideoTaskQueryResponse>(
      `/api/v3/contents/generations/tasks/${taskId}`
    );
  }

  /**
   * 等待任务完成（轮询）
   */
  async waitForTaskCompletion(
    taskId: string,
    options: VideoGenerationOptions = {}
  ): Promise<VideoTaskQueryResponse> {
    const maxAttempts = options.maxAttempts || DEFAULT_POLL_CONFIG.maxAttempts;
    const pollInterval = options.pollInterval || DEFAULT_POLL_CONFIG.pollInterval;

    let attempts = 0;

    while (attempts < maxAttempts) {
      const result = await this.queryTask(taskId);

      // 修正：使用小写的状态值
      if (
        result.status === "succeeded" ||
        result.status === "failed" ||
        result.status === "cancelled" ||
        result.status === "expired"
      ) {
        return result;
      }

      // 等待一段时间后再次查询
      await this.sleep(pollInterval);
      attempts++;
    }

    throw new Error(
      `Task ${taskId} did not complete within ${maxAttempts * (pollInterval / 1000)} seconds`
    );
  }

  /**
   * 生成视频（可选：等待完成）
   */
  async generateVideo(
    prompt: string,
    options?: VideoGenerationOptions & {
      firstFrameImage?: string;
      lastFrameImage?: string;
      referenceImages?: string[];
      imageUrl?: string;
      endImageUrl?: string;
    },
    model?: string
  ): Promise<{ taskId: string; result?: VideoTaskQueryResponse }> {
    // 创建任务
    const taskResponse = await this.createTask(prompt, options || {}, model);

    // 如果需要等待完成
    if (options?.waitForCompletion) {
      const result = await this.waitForTaskCompletion(
        taskResponse.id,
        options
      );
      return { taskId: taskResponse.id, result };
    }

    return { taskId: taskResponse.id };
  }

  /**
   * 辅助方法：延迟
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
