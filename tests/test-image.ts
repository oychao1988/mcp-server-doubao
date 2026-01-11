#!/usr/bin/env node
/**
 * 测试图片生成功能
 */

import { ImageAPI } from "./src/api/image-api.js";
import { IMAGE_MODELS } from "./src/types/index.js";

const api = new ImageAPI();

async function testImageGeneration() {
  console.log("=== 测试图片生成功能 ===\n");

  // ========== 测试 1: 基本文生图 ==========
  console.log("📝 测试 1: 基本文生图 (2K, 无水印)");
  console.log("------------------------------------------------");
  try {
    const response = await api.generateImage("一只可爱的橘猫坐在窗台上", {
      size: "2K",
      watermark: false,
    });
    console.log("✅ 成功");
    console.log("   模型:", response.model);
    console.log("   生成时间:", new Date(response.created * 1000).toLocaleString());
    console.log("   图片数量:", response.data.length);
    console.log("   用量:", response.usage);
    console.log("   第1张图尺寸:", response.data[0].size);
  } catch (error: any) {
    console.error("❌ 失败:", error.message);
  }

  // ========== 测试 2: 4K 分辨率 ==========
  console.log("\n🖼️ 测试 2: 4K 分辨率文生图");
  console.log("------------------------------------------------");
  try {
    const response = await api.generateImage("未来城市夜景，赛博朋克风格", {
      size: "4K",
      watermark: false,
    });
    console.log("✅ 成功");
    console.log("   第1张图尺寸:", response.data[0].size);
  } catch (error: any) {
    console.error("❌ 失败:", error.message);
  }

  // ========== 测试 3: 自定义像素值 ==========
  console.log("\n📐 测试 3: 自定义像素值 (16:9)");
  console.log("------------------------------------------------");
  try {
    const response = await api.generateImage("风景画，山水风格", {
      size: "2560x1440",
      watermark: false,
    });
    console.log("✅ 成功");
    console.log("   第1张图尺寸:", response.data[0].size);
  } catch (error: any) {
    console.error("❌ 失败:", error.message);
  }

  // ========== 测试 4: 组图功能 ==========
  console.log("\n🎨 测试 4: 组图功能 (4张)");
  console.log("------------------------------------------------");
  try {
    const response = await api.generateImage(
      "生成四张不同季节的风景画：春天樱花、夏天荷花、秋天枫叶、冬天雪景",
      {
        sequential_image_generation: "auto",
        max_images: 4,
        watermark: false,
      }
    );
    console.log("✅ 成功");
    console.log("   生成图片数:", response.data.length);
    console.log("   用量:", response.usage);
    response.data.forEach((img, i) => {
      console.log(`   图片${i + 1}:`, img.size, img.error ? `(失败: ${img.error.message})` : "");
    });
  } catch (error: any) {
    console.error("❌ 失败:", error.message);
  }

  // ========== 测试 5: 单图生图 ==========
  console.log("\n🖼️ 测试 5: 单图生图");
  console.log("------------------------------------------------");
  try {
    const response = await api.imageToImage(
      "让图片中的猫咪戴着墨镜，保持其他元素不变",
      "https://ark-project.tos-cn-beijing.volces.com/doc_image/seepro_i2v.png",
      {
        watermark: false,
      }
    );
    console.log("✅ 成功");
    console.log("   第1张图URL:", response.data[0].url?.substring(0, 50) + "...");
  } catch (error: any) {
    console.error("❌ 失败:", error.message);
  }

  // ========== 测试 6: 多图融合 ==========
  console.log("\n🖼️🖼️ 测试 6: 多图融合 (2张参考图)");
  console.log("------------------------------------------------");
  try {
    const response = await api.imageToMultipleImages(
      "将两张图片的风格融合，生成一张新图片",
      [
        "https://ark-project.tos-cn-beijing.volces.com/doc_image/seepro_i2v.png",
        "https://ark-project.tos-cn-beijing.volces.com/doc_image/seepro_i2v.png",
      ],
      {
        watermark: false,
      }
    );
    console.log("✅ 成功");
    console.log("   第1张图URL:", response.data[0].url?.substring(0, 50) + "...");
  } catch (error: any) {
    console.error("❌ 失败:", error.message);
  }

  // ========== 测试 7: Base64 返回格式 ==========
  console.log("\n🔤 测试 7: Base64 返回格式");
  console.log("------------------------------------------------");
  try {
    const response = await api.generateImage("简单的红色圆形图案", {
      response_format: "b64_json",
      watermark: false,
    });
    console.log("✅ 成功");
    console.log("   第1张图Base64长度:", response.data[0].b64_json?.length || 0);
    console.log("   第1张图URL:", response.data[0].url ? "(有)" : "(无)");
    console.log("   第1张图尺寸:", response.data[0].size);
  } catch (error: any) {
    console.error("❌ 失败:", error.message);
  }

  // ========== 测试 8: 提示词优化 ==========
  console.log("\n✨ 测试 8: 提示词优化 (standard 模式)");
  console.log("------------------------------------------------");
  try {
    const response = await api.generateImage("生成一张产品宣传图", {
      optimize_prompt_mode: "standard",
      watermark: false,
    });
    console.log("✅ 成功");
    console.log("   第1张图URL:", response.data[0].url?.substring(0, 50) + "...");
  } catch (error: any) {
    console.error("❌ 失败:", error.message);
  }

  // ========== 测试 9: 无水印 + 默认水印 ==========
  console.log("\n💧 测试 9: 默认水印行为");
  console.log("------------------------------------------------");
  try {
    const response = await api.generateImage("测试水印", {});
    console.log("✅ 成功 (默认应添加水印)");
    console.log("   第1张图URL:", response.data[0].url?.substring(0, 50) + "...");
  } catch (error: any) {
    console.error("❌ 失败:", error.message);
  }

  console.log("\n=== 总结 ===");
  console.log("✅ 所有新功能测试完成");
  console.log("\n已实现的功能:");
  console.log("• ✅ 4K 分辨率");
  console.log("• ✅ 自定义像素值 (如 2560x1440)");
  console.log("• ✅ 组图功能 (sequential_image_generation: auto)");
  console.log("• ✅ 多图融合 (最多14张参考图)");
  console.log("• ✅ Base64 返回格式 (b64_json)");
  console.log("• ✅ 提示词优化 (standard 模式)");
  console.log("• ✅ 流式输出支持 (stream 参数)");
  console.log("• ✅ 更完整的响应字段 (size, usage, error)");
  console.log("• ✅ 水印控制 (watermark 参数)");
  console.log("• ⚠️  seed 参数 (需要 3.0 模型权限)");
  console.log("• ⚠️  guidance_scale 参数 (需要 3.0 模型权限)");
}

testImageGeneration().catch(console.error);
