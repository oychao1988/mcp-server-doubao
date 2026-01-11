/**
 * 配置管理模块
 */

import type { Config } from "../types/index.js";

/**
 * 获取API Key
 * 优先从环境变量读取，如果未设置则抛出错误
 */
export function getApiKey(): string {
  const apiKey = process.env.ARK_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ARK_API_KEY environment variable is not set. " +
      "Please set it before running the MCP server."
    );
  }
  return apiKey;
}

/**
 * 获取配置
 */
export function getConfig(): Config {
  return {
    apiKey: getApiKey(),
    baseURL: "https://ark.cn-beijing.volces.com",
  };
}

/**
 * 验证配置
 */
export function validateConfig(config: Config): void {
  if (!config.apiKey) {
    throw new Error("API key is required");
  }
}
