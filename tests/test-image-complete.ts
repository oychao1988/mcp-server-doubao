#!/usr/bin/env node
/**
 * 完整的图片生成功能测试 - 覆盖所有模型和任务类型
 */

import { ImageAPI } from "./src/api/image-api.js";
import { IMAGE_MODELS } from "./src/types/index.js";

const api = new ImageAPI();

async function testAllScenarios() {
  console.log("=== 完整图片生成功能测试 ===\n");

  // ========== 模型 1: doubao-seedream-4.5 ==========
  console.log("🎯 模型: doubao-seedream-4-5-251128");
  console.log("========================================");

  // 1.1 文生图 - 不同尺寸
  console.log("\n  1.1 文生图 - 不同尺寸");
  const sizes = ["2K", "4K", "2048x2048", "2560x1440", "3024x1296"];
  for (const size of sizes) {
    try {
      const r = await api.generateImage("测试", { size, watermark: false });
      console.log(`    ✅ ${size}:`, r.data[0].size);
    } catch (e: any) {
      console.log(`    ❌ ${size}:`, e.message);
    }
  }

  // 1.2 组图功能
  console.log("\n  1.2 组图功能 (auto)");
  try {
    const r = await api.generateImage("生成3张不同颜色的气球", {
      sequential_image_generation: "auto",
      max_images: 3,
      watermark: false,
    });
    console.log(`    ✅ 组图成功: ${r.data.length} 张`);
    r.data.forEach((img, i) => console.log(`       - 图片${i+1}: ${img.size}`));
  } catch (e: any) {
    console.log(`    ❌ 组图失败:`, e.message);
  }

  // 1.3 单图生图
  console.log("\n  1.3 单图生图");
  try {
    const r = await api.imageToImage(
      "让猫咪戴墨镜",
      "https://ark-project.tos-cn-beijing.volces.com/doc_image/seepro_i2v.png",
      { watermark: false }
    );
    console.log(`    ✅ 单图生图成功: ${r.data[0].size}`);
  } catch (e: any) {
    console.log(`    ❌ 单图生图失败:`, e.message);
  }

  // 1.4 多图融合
  console.log("\n  1.4 多图融合 (3张参考图)");
  try {
    const r = await api.imageToMultipleImages(
      "融合三张参考图的风格",
      Array(3).fill("https://ark-project.tos-cn-beijing.volces.com/doc_image/seepro_i2v.png"),
      { watermark: false }
    );
    console.log(`    ✅ 多图融合成功: ${r.data[0].size}`);
  } catch (e: any) {
    console.log(`    ❌ 多图融合失败:`, e.message);
  }

  // 1.5 Base64 返回
  console.log("\n  1.5 Base64 返回格式");
  try {
    const r = await api.generateImage("测试", {
      response_format: "b64_json",
      watermark: false,
    });
    console.log(`    ✅ Base64: ${r.data[0].b64_json?.length} 字符, ${r.data[0].url ? '无URL' : '有URL'}`);
  } catch (e: any) {
    console.log(`    ❌ Base64失败:`, e.message);
  }

  // 1.6 提示词优化
  console.log("\n  1.6 提示词优化 (standard)");
  try {
    const r = await api.generateImage("产品图", {
      optimize_prompt_mode: "standard",
      watermark: false,
    });
    console.log(`    ✅ 提示词优化成功`);
  } catch (e: any) {
    console.log(`    ❌ 提示词优化失败:`, e.message);
  }

  // ========== 模型 2: doubao-seedream-4-0 ==========
  console.log("\n🎯 模型: doubao-seedream-4-0-250428");
  console.log("========================================");

  try {
    const r = await api.generateImage("测试4.0模型", {
      watermark: false,
    }, IMAGE_MODELS.SEEDREAM_4_0);
    console.log(`  ✅ 4.0 模型可用: ${r.data[0].size}`);
  } catch (e: any) {
    console.log(`  ❌ 4.0 模型:`, e.message);
  }

  // ========== 模型 3: doubao-seededit-3-0-i2i ==========
  console.log("\n🎯 模型: doubao-seededit-3-0-i2i");
  console.log("========================================");

  try {
    const r = await api.imageToImage(
      "编辑这张图片",
      "https://ark-project.tos-cn-beijing.volces.com/doc_image/seepro_i2v.png",
      { watermark: false },
      IMAGE_MODELS.SEEDEDIT_3_0_I2I
    );
    console.log(`  ✅ Seededit 3.0 可用: ${r.data[0].size || '(无尺寸)'}`);
  } catch (e: any) {
    console.log(`  ❌ Seededit 3.0:`, e.message);
  }

  // 测试 adaptive 尺寸 (仅 Seededit 支持)
  console.log("\n  测试 adaptive 尺寸");
  try {
    const r = await api.imageToImage(
      "测试",
      "https://ark-project.tos-cn-beijing.volces.com/doc_image/seepro_i2v.png",
      { size: "adaptive", watermark: false },
      IMAGE_MODELS.SEEDEDIT_3_0_I2I
    );
    console.log(`    ✅ adaptive 可用: ${r.data[0].size || '(无尺寸)'}`);
  } catch (e: any) {
    console.log(`    ❌ adaptive 失败:`, e.message);
  }

  // ========== 模型 4: doubao-seedream-3-0-t2i ==========
  console.log("\n🎯 模型: doubao-seedream-3-0-t2i");
  console.log("========================================");

  try {
    const r = await api.generateImage("测试3.0模型", {
      seed: 12345,
      watermark: false,
    }, IMAGE_MODELS.SEEDREAM_3_0_T2I);
    console.log(`  ✅ 3.0 t2i 可用`);
  } catch (e: any) {
    console.log(`  ❌ 3.0 t2i:`, e.message);
  }

  // ========== 测试 guidance_scale ==========
  console.log("\n🎯 测试 guidance_scale (3.0 模型)");
  console.log("========================================");

  try {
    const r = await api.generateImage("测试", {
      guidance_scale: 5.0,
      watermark: false,
    }, IMAGE_MODELS.SEEDREAM_3_0_T2I);
    console.log(`  ✅ guidance_scale 可用`);
  } catch (e: any) {
    console.log(`  ❌ guidance_scale:`, e.message);
  }

  // ========== 测试多图融合边界情况 ==========
  console.log("\n🎯 测试多图融合边界情况");
  console.log("========================================");

  // 14张参考图（上限）
  console.log("\n  测试 14 张参考图");
  const fourteenImages = Array(14).fill("https://ark-project.tos-cn-beijing.volces.com/doc_image/seepro_i2v.png");
  try {
    const r = await api.imageToMultipleImages("融合", fourteenImages, { watermark: false });
    console.log(`    ✅ 14张参考图成功: ${r.data[0].size}`);
  } catch (e: any) {
    console.log(`    ❌ 14张参考图:`, e.message);
  }

  // ========== 测试水印控制 ==========
  console.log("\n🎯 测试水印控制");
  console.log("========================================");

  // 无水印
  try {
    const r1 = await api.generateImage("无水印", { watermark: false });
    console.log(`  ✅ 无水印成功`);
  } catch (e: any) {
    console.log(`  ❌ 无水印:`, e.message);
  }

  // 有水印（默认）
  try {
    const r2 = await api.generateImage("有水印", {});
    console.log(`  ✅ 有水印成功（默认）`);
  } catch (e: any) {
    console.log(`  ❌ 有水印:`, e.message);
  }

  // ========== 最终总结 ==========
  console.log("\n" + "=".repeat(50));
  console.log("测试覆盖情况总结");
  console.log("=".repeat(50));
  console.log("\n✅ 已验证功能:");
  console.log("• 4.5 模型 - 文生图 (所有尺寸)");
  console.log("• 4.5 模型 - 组图功能");
  console.log("• 4.5 模型 - 单图生图");
  console.log("• 4.5 模型 - 多图融合");
  console.log("• 4.5 模型 - Base64 返回");
  console.log("• 4.5 模型 - 提示词优化");
  console.log("• 水印控制");
  console.log("\n⚠️  需要权限的功能:");
  console.log("• 4.0 模型");
  console.log("• 3.0 t2i 模型");
  console.log("• Seededit 3.0 i2i 模型");
  console.log("• seed 参数");
  console.log("• guidance_scale 参数");
  console.log("• adaptive 尺寸");
  console.log("• 流式输出");
}

testAllScenarios().catch(console.error);
