#!/usr/bin/env node
/**
 * 直接测试API调用，查看原始响应
 */

import { getConfig } from "./src/utils/config.js";

const config = getConfig();
const CAT_IMAGE_1 = "https://ark-content-generation-v2-cn-beijing.tos-cn-beijing.volces.com/doubao-seedream-4-5/0217681323917187b02e641abd64d0836d5f697bc661db6b95983_0.jpeg";

async function testDirectAPI() {
  console.log("=== 直接测试API调用 ===\n");

  // 测试首帧图生视频
  console.log("🖼️ 测试: 首帧图生视频");
  console.log("图片URL:", CAT_IMAGE_1);
  console.log("\n请求数据:");
  const requestData = {
    model: "doubao-seedance-1-5-pro-251215",
    content: [
      { type: "text", text: "让猫咪动起来" },
      { type: "image_url", image_url: { url: CAT_IMAGE_1 }, role: "first_frame" }
    ],
    duration: 5
  };
  console.log(JSON.stringify(requestData, null, 2));

  try {
    const response = await fetch(`${config.baseURL}/api/v3/contents/generations/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(requestData),
    });

    console.log("\n响应状态:", response.status, response.statusText);
    console.log("响应头:", Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log("\n响应体:", text);

    if (!response.ok) {
      console.error("\n❌ 请求失败");
    } else {
      const json = JSON.parse(text);
      console.log("\n✅ 请求成功");
      console.log("任务ID:", json.id);
      console.log("状态:", json.status);
    }
  } catch (error: any) {
    console.error("\n❌ 异常:", error.message);
    console.error("堆栈:", error.stack);
  }
}

testDirectAPI().catch(console.error);
