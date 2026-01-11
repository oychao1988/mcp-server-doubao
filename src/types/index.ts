/**
 * 类型定义导出
 */

export * from "./image.js";
export * from "./video.js";

/**
 * API错误类型
 */
export class APIError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "APIError";
  }
}

/**
 * 配置类型
 */
export interface Config {
  apiKey: string;
  baseURL?: string;
}
