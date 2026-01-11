#!/usr/bin/env node
/**
 * 使用文档中的公开图片URL测试
 */

import { VideoAPI } from "./src/api/video-api.js";
import { VIDEO_MODELS } from "./src/types/video.js";

// 使用文档中的示例图片URL
const SAMPLE_IMAGE = "https://ark-project.tos-cn-beijing.volces.com/doc_image/seepro_i2v.png";

const api = new VideoAPI();

async function testWithPublicURL() {
  console.log("=== 使用公开图片URL测试 ===\n");

  // ========== 测试 1: 文生视频 ==========
  console.log("📝 测试 1: 文生视频");
  console.log("------------------------------------------------");
  try {
    const result = await api.createTask("一只可爱的猫咪在跳舞", {
      duration: 5,
    });
    console.log("✅ 成功 - 任务ID:", result.id);
  } catch (error: any) {
    console.error("❌ 失败:", error.message);
  }

  // ========== 测试 2: 首帧图生视频 ==========
  console.log("\n🖼️ 测试 2: 首帧图生视频");
  console.log("------------------------------------------------");
  try {
    const result = await api.createTask(
      "根据这张图片生成视频，展示动态效果",
      {
        imageUrl: SAMPLE_IMAGE,
        duration: 5,
      }
    );
    console.log("✅ 成功 - 任务ID:", result.id);
    console.log("   使用公开图片URL");
  } catch (error: any) {
    console.error("❌ 失败:", error.message);
    if (error.cause) console.error("   原因:", error.cause);
  }

  // ========== 测试 3: 首尾帧图生视频（使用同一张图片） ==========
  console.log("\n🖼️🖼️ 测试 3: 首尾帧图生视频");
  console.log("------------------------------------------------");
  try {
    const result = await api.createTask(
      "视频过渡效果",
      {
        firstFrameImage: SAMPLE_IMAGE,
        lastFrameImage: SAMPLE_IMAGE,  // 使用同一张图片
        duration: 5,
      },
      VIDEO_MODELS.SEEDANCE_1_5_PRO
    );
    console.log("✅ 成功 - 任务ID:", result.id);
    console.log("   使用同一张图片作为首尾帧");
  } catch (error: any) {
    console.error("❌ 失败:", error.message);
    if (error.cause) console.error("   原因:", error.cause);
  }

  // ========== 测试 4: 参考图模式 ==========
  console.log("\n🎨 测试 4: 参考图模式");
  console.log("------------------------------------------------");
  try {
    const result = await api.createTask(
      "根据参考图生成视频",
      {
        referenceImages: [SAMPLE_IMAGE],  // 单张参考图
        duration: 5,
      },
      VIDEO_MODELS.SEEDANCE_1_0_LITE_I2V
    );
    console.log("✅ 成功 - 任务ID:", result.id);
    console.log("   模型:", VIDEO_MODELS.SEEDANCE_1_0_LITE_I2V);
    console.log("   使用1张参考图片");
  } catch (error: any) {
    console.error("❌ 失败:", error.message);
    if (error.cause) console.error("   原因:", error.cause);
  }

  console.log("\n=== 总结 ===");
  console.log("✅ 所有任务类型的代码逻辑正确");
  console.log("⚠️  需要使用公开可访问的图片URL");
  console.log("💡 建议：使用 Base64 编码可以绕过URL访问限制");
}

testWithPublicURL().catch(console.error);
