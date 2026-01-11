#!/usr/bin/env node
/**
 * 测试模型参数传递
 */

import { VideoAPI } from "./src/api/video-api.js";
import { VIDEO_MODELS } from "./src/types/video.js";

const api = new VideoAPI();
const SAMPLE_IMAGE = "https://ark-project.tos-cn-beijing.volces.com/doc_image/seepro_i2v.png";

async function testModelParam() {
  console.log("=== 测试模型参数 ===\n");

  // 直接调用 createTask，查看请求内容
  console.log("测试 1: 参考图模式");
  console.log("预期模型:", VIDEO_MODELS.SEEDANCE_1_0_LITE_I2V);

  try {
    const result = await api.createTask(
      "测试参考图",
      {
        referenceImages: [SAMPLE_IMAGE],
        duration: 5,
      },
      undefined,  // imageUrl
      undefined,  // endImageUrl
      VIDEO_MODELS.SEEDANCE_1_0_LITE_I2V  // model
    );
    console.log("✅ 成功 - 任务ID:", result.id);
  } catch (error: any) {
    console.error("❌ 失败:", error.message);

    // 打印模型常量值
    console.log("\n模型常量:");
    console.log("SEEDANCE_1_0_LITE_I2V:", VIDEO_MODELS.SEEDANCE_1_0_LITE_I2V);
    console.log("DEFAULT_VIDEO_MODEL:", "doubao-seedance-1-5-pro-251215");
  }

  console.log("\n\n测试 2: 使用字符串字面量");
  try {
    const result = await api.createTask(
      "测试参考图",
      {
        referenceImages: [SAMPLE_IMAGE],
        duration: 5,
      },
      undefined,
      undefined,
      "doubao-seedance-1-0-lite-i2v"  // 直接使用字符串
    );
    console.log("✅ 成功 - 任务ID:", result.id);
  } catch (error: any) {
    console.error("❌ 失败:", error.message);
  }
}

testModelParam().catch(console.error);
