/**
 * 错误处理模块
 */

import type { APIError } from "../types/index.js";

/**
 * API错误代码
 */
export enum APIErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_REQUEST = "INVALID_REQUEST",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  SERVER_ERROR = "SERVER_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN = "UNKNOWN",
}

/**
 * 创建API错误
 */
export function createAPIError(
  code: APIErrorCode,
  message: string,
  statusCode?: number
): APIError {
  return {
    name: "APIError",
    code,
    message,
    statusCode,
  } as APIError;
}

/**
 * 处理API响应错误
 */
export async function handleAPIResponse(
  response: Response
): Promise<never> {
  let errorMessage = `API error: ${response.status} ${response.statusText}`;
  let errorCode = APIErrorCode.UNKNOWN;

  try {
    const data = await response.json();
    if (data.error) {
      errorMessage = data.error.message || errorMessage;
      errorCode = data.error.code || errorCode;
    }
  } catch {
    // 如果解析JSON失败，使用默认错误消息
  }

  throw createAPIError(errorCode, errorMessage, response.status);
}

/**
 * 处理网络错误
 */
export function handleNetworkError(error: unknown): never {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    throw createAPIError(
      APIErrorCode.NETWORK_ERROR,
      "Network error: Failed to connect to the API. Please check your internet connection."
    );
  }

  // 提供更详细的错误信息
  const errorMessage = error instanceof Error
    ? `${error.name}: ${error.message}${error.stack ? `\nStack: ${error.stack}` : ""}`
    : JSON.stringify(error);

  throw createAPIError(
    APIErrorCode.UNKNOWN,
    `Unexpected error: ${errorMessage}`
  );
}
