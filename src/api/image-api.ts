/**
 * 图片生成API
 */

import { APIClient } from "./client.js";
import { Buffer } from "node:buffer";
import { IMAGE_MODELS } from "../types/index.js";
import type {
  ImageGenerationRequest,
  ImageGenerationResponse,
  ImageGenerationOptions,
} from "../types/index.js";

/**
 * 默认图片生成模型ID
 */
export const DEFAULT_IMAGE_MODEL = IMAGE_MODELS.SEEDREAM_4_5;

/**
 * 图片API类
 */
export class ImageAPI extends APIClient {
  async downloadImage(url: string): Promise<{
    base64: string;
    contentType: string | null;
    bytes: number;
  }> {
    const { buffer, contentType } = await this.fetchBinary(url);
    const base64 = Buffer.from(buffer).toString("base64");

    return {
      base64,
      contentType,
      bytes: buffer.byteLength,
    };
  }

  /**
   * 生成图片（文本生成图片）
   */
  async generateImage(
    prompt: string,
    options: ImageGenerationOptions = {},
    model?: string
  ): Promise<ImageGenerationResponse> {
    const requestBody = this.buildRequestBody(
      prompt,
      model || DEFAULT_IMAGE_MODEL,
      options
    );

    return this.post<ImageGenerationResponse>(
      "/api/v3/images/generations",
      requestBody
    );
  }

  /**
   * 图生图（单张参考图）
   */
  async imageToImage(
    prompt: string,
    imageUrl: string,
    options: ImageGenerationOptions = {},
    model?: string
  ): Promise<ImageGenerationResponse> {
    const mergedOptions = { ...options, imageUrl };
    const requestBody = this.buildRequestBody(
      prompt,
      model || DEFAULT_IMAGE_MODEL,
      mergedOptions
    );

    return this.post<ImageGenerationResponse>(
      "/api/v3/images/generations",
      requestBody
    );
  }

  /**
   * 图生图（多张参考图）
   */
  async imageToMultipleImages(
    prompt: string,
    imageUrls: string[],
    options: ImageGenerationOptions = {},
    model?: string
  ): Promise<ImageGenerationResponse> {
    const mergedOptions = { ...options, imageUrls };
    const requestBody = this.buildRequestBody(
      prompt,
      model || DEFAULT_IMAGE_MODEL,
      mergedOptions
    );

    return this.post<ImageGenerationResponse>(
      "/api/v3/images/generations",
      requestBody
    );
  }

  /**
   * 构建请求体
   */
  private buildRequestBody(
    prompt: string,
    model: string,
    options: ImageGenerationOptions
  ): ImageGenerationRequest {
    const requestBody: ImageGenerationRequest = {
      model,
      prompt,
    };

    // 处理图片输入
    if (options.imageUrl) {
      requestBody.image = options.imageUrl;
    } else if (options.imageUrls && options.imageUrls.length > 0) {
      requestBody.image = options.imageUrls;
    }

    // 处理尺寸参数
    if (options.size) {
      requestBody.size = options.size;
    }

    // 处理随机种子（仅 3.0 模型支持）
    if (options.seed !== undefined) {
      requestBody.seed = options.seed;
    }

    // 处理组图功能（仅 4.5/4.0 支持）
    if (options.sequential_image_generation !== undefined) {
      requestBody.sequential_image_generation = options.sequential_image_generation;
    }

    // 处理组图配置
    const maxImages = options.max_images ?? options.count;
    if (maxImages !== undefined) {
      requestBody.sequential_image_generation_options = {
        max_images: maxImages,
      };
      // 如果设置了 max_images，自动启用组图模式（除非明确设置为 disabled）
      if (options.sequential_image_generation === undefined) {
        requestBody.sequential_image_generation = "auto";
      }
    }

    // 处理流式输出（仅 4.5/4.0 支持）
    if (options.stream !== undefined) {
      requestBody.stream = options.stream;
    } else {
      requestBody.stream = false;
    }

    // 处理文本权重（仅 3.0 模型支持）
    if (options.guidance_scale !== undefined) {
      requestBody.guidance_scale = options.guidance_scale;
    }

    // 处理返回格式
    if (options.response_format !== undefined) {
      requestBody.response_format = options.response_format;
    } else {
      requestBody.response_format = "url";
    }

    // 处理水印
    if (options.watermark !== undefined) {
      requestBody.watermark = options.watermark;
    } else {
      // 默认添加水印
      requestBody.watermark = true;
    }

    // 处理提示词优化（仅 4.5/4.0 支持）
    if (options.optimize_prompt_mode !== undefined) {
      requestBody.optimize_prompt_options = {
        mode: options.optimize_prompt_mode,
      };
    }

    // 移除 undefined 的字段
    Object.keys(requestBody).forEach((key) => {
      const value = requestBody[key as keyof ImageGenerationRequest];
      if (value === undefined) {
        delete requestBody[key as keyof ImageGenerationRequest];
      }
    });

    return requestBody;
  }
}
