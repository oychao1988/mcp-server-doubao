#!/usr/bin/env node
/**
 * MCP服务器主入口
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMCPServer } from "./server.js";

/**
 * 主函数
 */
async function main() {
  const server = createMCPServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  // 优雅关闭处理
  process.on("SIGINT", async () => {
    await server.close();
    process.exit(0);
  });
}

// 启动服务器
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
