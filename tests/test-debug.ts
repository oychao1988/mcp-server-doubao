#!/usr/bin/env node
/**
 * 调试视频生成失败原因
 */

import { VideoAPI } from "./src/api/video-api.js";
import { VIDEO_MODELS } from "./src/types/video.js";

const CAT_IMAGE_1 = "https://ark-content-generation-v2-cn-beijing.tos-cn-beijing.volces.com/doubao-seedream-4-5/0217681323917187b02e641abd64d0836d5f697bc661db6b95983_0.jpeg";
const CAT_IMAGE_2 = "https://ark-content-generation-v2-cn-beijing.tos-cn-beijing.volces.com/doubao-seedream-4-5/021768132404125595b095274e84f4639fb3088e51bd50eab6cdf_0.jpeg";
const DOG_IMAGE = "https://ark-content-generation-v2-cn-beijing.tos-cn-beijing.volces.com/doubao-seedream-4-5/0217681324197143393bc98fc45d4a5de2d8a04f79b33ef430001_0.jpeg";

const api = new VideoAPI();

async function testDetailed() {
  console.log("=== 详细调试测试 ===\n");

  // 测试 2: 首帧图生视频
  console.log("🖼️ 测试 2: 首帧图生视频");
  console.log("------------------------------------------------");
  try {
    const result = await api.createTask(
      "让这张图片中的猫咪动起来",
      {
        imageUrl: CAT_IMAGE_1,
        duration: 5,
      }
    );
    console.log("✅ 成功:", result);
  } catch (error: any) {
    console.error("❌ 错误:", error);
    console.error("   Name:", error.name);
    console.error("   Code:", error.code);
    console.error("   Message:", error.message);
    console.error("   Stack:", error.stack);
    console.error("   Full:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
  }

  console.log("\n");

  // 测试 3: 首尾帧图生视频
  console.log("🖼️🖼️ 测试 3: 首尾帧图生视频");
  console.log("------------------------------------------------");
  try {
    const result = await api.createTask(
      "从坐姿过渡到站立",
      {
        firstFrameImage: CAT_IMAGE_1,
        lastFrameImage: CAT_IMAGE_2,
        duration: 5,
      },
      undefined,
      undefined,
      VIDEO_MODELS.SEEDANCE_1_5_PRO
    );
    console.log("✅ 成功:", result);
  } catch (error: any) {
    console.error("❌ 错误:", error);
    console.error("   Name:", error.name);
    console.error("   Code:", error.code);
    console.error("   Message:", error.message);
    console.error("   Full:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
  }

  console.log("\n");

  // 测试 4: 参考图模式
  console.log("🎨 测试 4: 参考图模式");
  console.log("------------------------------------------------");
  try {
    const result = await api.createTask(
      "生成卡通风格的动物",
      {
        referenceImages: [CAT_IMAGE_1, DOG_IMAGE],
        duration: 5,
      },
      undefined,
      undefined,
      VIDEO_MODELS.SEEDANCE_1_0_LITE_I2V
    );
    console.log("✅ 成功:", result);
  } catch (error: any) {
    console.error("❌ 错误:", error);
    console.error("   Name:", error.name);
    console.error("   Code:", error.code);
    console.error("   Message:", error.message);
    console.error("   Full:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
  }
}

testDetailed().catch(console.error);
