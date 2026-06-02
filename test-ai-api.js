/**
 * AI接口测试脚本
 * 使用方式: node test-ai-api.js
 * 
 * 测试内容:
 * 1. 文字对话测试 (POST /api/ai/chat)
 * 2. 图片分析测试 (POST /api/ai/chat 带 imageBase64)
 */

const BASE_URL = process.env.BASE_URL || 'https://gpu.yuboshi.club:8443';

// 辅助函数：发送POST请求
function post(url, data) {
  const body = JSON.stringify(data);
  return new Promise((resolve, reject) => {
    const http = require('https');
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          resolve({ statusCode: res.statusCode, data: json });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// 测试1: 文字对话
async function testTextChat() {
  console.log('\n========== 测试1: 文字对话 ==========');
  try {
    const res = await post(`${BASE_URL}/api/ai/chat`, {
      message: '显卡黑屏无信号，可能是什么原因？',
      context: [],
      scene: 'gpu_diagnosis'
    });
    console.log('状态码:', res.statusCode);
    console.log('响应数据:', JSON.stringify(res.data, null, 2));
    if (res.data && res.data.code === 0 && res.data.data && res.data.data.reply) {
      console.log('✅ 文字对话测试通过');
    } else {
      console.log('❌ 文字对话测试失败');
    }
  } catch (err) {
    console.log('❌ 请求异常:', err.message);
  }
}

// 测试2: 图片分析（使用一个小尺寸的1x1像素PNG图片base64）
async function testImageChat() {
  console.log('\n========== 测试2: 图片分析 ==========');
  // 这是一个1x1像素的透明PNG图片base64（仅用于接口连通性测试）
  const tinyPngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  
  try {
    const res = await post(`${BASE_URL}/api/ai/chat`, {
      message: '请分析这张GPU显卡图片',
      imageBase64: tinyPngBase64,
      context: [],
      scene: 'gpu_diagnosis_image'
    });
    console.log('状态码:', res.statusCode);
    console.log('响应数据:', JSON.stringify(res.data, null, 2));
    if (res.data && res.data.code === 0 && res.data.data && res.data.data.reply) {
      console.log('✅ 图片分析测试通过');
    } else {
      console.log('❌ 图片分析测试失败');
    }
  } catch (err) {
    console.log('❌ 请求异常:', err.message);
  }
}

// 主程序
async function main() {
  console.log('AI接口测试脚本');
  console.log('目标服务器:', BASE_URL);
  console.log('当前时间:', new Date().toLocaleString());
  
  await testTextChat();
  await testImageChat();
  
  console.log('\n========== 测试完成 ==========\n');
}

main().catch(console.error);
