/**
 * 基础API客户端
 */

import type { Config } from "../types/index.js";
import { getConfig } from "../utils/config.js";
import { handleAPIResponse, handleNetworkError } from "../utils/errors.js";

/**
 * API客户端基类
 */
export class APIClient {
  protected config: Config;

  constructor() {
    this.config = getConfig();
  }

  protected async fetchBinary(
    endpointOrUrl: string,
    init: RequestInit = {}
  ): Promise<{ buffer: ArrayBuffer; contentType: string | null }> {
    const url = endpointOrUrl.startsWith("http")
      ? endpointOrUrl
      : `${this.config.baseURL}${endpointOrUrl}`;

    try {
      const headers = new Headers(init.headers);
      headers.set("Authorization", `Bearer ${this.config.apiKey}`);

      const response = await fetch(url, {
        ...init,
        headers,
      });

      if (!response.ok) {
        await handleAPIResponse(response);
      }

      return {
        buffer: await response.arrayBuffer(),
        contentType: response.headers.get("content-type"),
      };
    } catch (error) {
      if (error instanceof Error && (error as any).code) {
        throw error;
      }
      handleNetworkError(error);
    }
  }

  /**
   * 发送POST请求
   */
  protected async post<T>(endpoint: string, data: unknown): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await handleAPIResponse(response);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error && (error as any).code) {
        throw error;
      }
      handleNetworkError(error);
    }
  }

  /**
   * 发送GET请求
   */
  protected async get<T>(endpoint: string): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        await handleAPIResponse(response);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error && (error as any).code) {
        throw error;
      }
      handleNetworkError(error);
    }
  }
}
