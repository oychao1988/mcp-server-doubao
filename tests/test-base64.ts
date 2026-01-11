#!/usr/bin/env node
/**
 * 测试 Base64 编码图片生成视频
 */

import { VideoAPI } from "./src/api/video-api.js";
import { VIDEO_MODELS } from "./src/types/video.js";

const api = new VideoAPI();

// 使用文档中的公开图片URL
const SAMPLE_IMAGE_URL = "https://ark-project.tos-cn-beijing.volces.com/doc_image/seepro_i2v.png";

/**
 * 将图片URL转换为Base64编码
 */
async function urlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  // 从 Content-Type 获取图片格式
  const contentType = response.headers.get('content-type') || 'image/png';
  const format = contentType.split('/')[1];

  return `data:${contentType};base64,${base64}`;
}

async function testBase64Image() {
  console.log("=== 测试 Base64 编码图片 ===\n");

  console.log("步骤 1: 下载图片并转换为 Base64...");
  let base64Image: string;
  try {
    base64Image = await urlToBase64(SAMPLE_IMAGE_URL);
    console.log("✅ Base64 编码完成");
    console.log("   图片格式:", base64Image.substring(5, 20) + "...");
    console.log("   编码长度:", base64Image.length, "字符");
  } catch (error: any) {
    console.error("❌ Base64 编码失败:", error.message);
    return;
  }

  console.log("\n步骤 2: 测试首帧图生视频 (Base64)");
  console.log("------------------------------------------------");
  try {
    const result = await api.createTask(
      "让图片动起来，展示动态效果",
      {
        imageUrl: base64Image,  // 使用 Base64 编码
        duration: 5,
      }
    );
    console.log("✅ 成功 - 任务ID:", result.id);
    console.log("   使用 Base64 编码图片");
  } catch (error: any) {
    console.error("❌ 失败:", error.message);
  }

  console.log("\n步骤 3: 测试参考图模式 (Base64)");
  console.log("------------------------------------------------");
  try {
    const result = await api.createTask(
      "根据参考图生成视频",
      {
        referenceImages: [base64Image],
        duration: 5,
      },
      VIDEO_MODELS.SEEDANCE_1_0_LITE_I2V
    );
    console.log("✅ 成功 - 任务ID:", result.id);
    console.log("   模型:", VIDEO_MODELS.SEEDANCE_1_0_LITE_I2V);
    console.log("   使用 Base64 编码参考图");
  } catch (error: any) {
    console.error("❌ 失败:", error.message);
  }

  console.log("\n步骤 4: 测试首尾帧图生视频 (Base64)");
  console.log("------------------------------------------------");
  try {
    const result = await api.createTask(
      "视频过渡效果",
      {
        firstFrameImage: base64Image,
        lastFrameImage: base64Image,
        duration: 5,
      },
      VIDEO_MODELS.SEEDANCE_1_5_PRO
    );
    console.log("✅ 成功 - 任务ID:", result.id);
    console.log("   使用同一张 Base64 编码图片作为首尾帧");
  } catch (error: any) {
    console.error("❌ 失败:", error.message);
  }

  console.log("\n=== 总结 ===");
  console.log("✅ Base64 编码图片测试完成");
  console.log("💡 Base64 编码可以绕过图片URL访问限制");
}

testBase64Image().catch(console.error);
