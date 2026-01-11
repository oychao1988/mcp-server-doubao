/**
 * 视频任务查询MCP工具
 */

import { VideoAPI } from "../api/index.js";
import { z } from "zod";

/**
 * 视频任务查询工具
 */
export const queryVideoTaskTool = {
  name: "query_video_task",
  description: "Query the status and details of a video generation task. Returns video URL when task succeeds.",
  inputSchema: z.object({
    taskId: z.string().describe("Video task ID returned by generate_video"),
  }),
  handler: async (input: { taskId: string }) => {
    const api = new VideoAPI();

    try {
      const result = await api.queryTask(input.taskId);

      return {
        success: true,
        taskId: result.id,
        model: result.model,
        status: result.status,
        videoUrl: result.content?.video_url,
        lastFrameUrl: result.content?.last_frame_url,
        error: result.error
          ? {
              code: result.error.code,
              message: result.error.message,
            }
          : null,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
        seed: result.seed,
        resolution: result.resolution,
        ratio: result.ratio,
        duration: result.duration,
        frames: result.frames,
        framesPerSecond: result.framespersecond,
        serviceTier: result.service_tier,
        executionExpiresAfter: result.execution_expires_after,
        generateAudio: result.generate_audio,
        draft: result.draft,
        draftTaskId: result.draft_task_id,
        usage: result.usage,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
