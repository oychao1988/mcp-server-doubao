/**
 * MCP服务器配置
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  generateImageTool,
  imageToImageTool,
  downloadImageTool,
  generateVideoTool,
  queryVideoTaskTool,
} from "./tools/index.js";

/**
 * 创建MCP服务器
 */
export function createMCPServer(): Server {
  const server = new Server(
    {
      name: "mcp-server-doubao",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // 注册工具列表处理器
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: generateImageTool.name,
          description: generateImageTool.description,
          inputSchema: zodToJsonSchema(generateImageTool.inputSchema as any),
        },
        {
          name: imageToImageTool.name,
          description: imageToImageTool.description,
          inputSchema: zodToJsonSchema(imageToImageTool.inputSchema as any),
        },
        {
          name: downloadImageTool.name,
          description: downloadImageTool.description,
          inputSchema: zodToJsonSchema(downloadImageTool.inputSchema as any),
        },
        {
          name: generateVideoTool.name,
          description: generateVideoTool.description,
          inputSchema: zodToJsonSchema(generateVideoTool.inputSchema as any),
        },
        {
          name: queryVideoTaskTool.name,
          description: queryVideoTaskTool.description,
          inputSchema: zodToJsonSchema(queryVideoTaskTool.inputSchema as any),
        },
      ],
    };
  });

  // 注册工具调用处理器
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (!args) {
      throw new Error("No arguments provided");
    }

    let result;

    switch (name) {
      case "generate_image":
        result = await generateImageTool.handler(args as any);
        break;

      case "image_to_image":
        result = await imageToImageTool.handler(args as any);
        break;

      case "download_image":
        result = await downloadImageTool.handler(args as any);
        break;

      case "generate_video":
        result = await generateVideoTool.handler(args as any);
        break;

      case "query_video_task":
        result = await queryVideoTaskTool.handler(args as any);
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  });

  return server;
}
