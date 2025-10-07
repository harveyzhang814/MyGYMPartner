// 创建测试图片的脚本
const fs = require('fs');
const path = require('path');

// 创建一个简单的测试图片（模拟不同大小）
function createTestImage(sizeKB, filename) {
  const size = sizeKB * 1024;
  const buffer = Buffer.alloc(size);
  
  // 填充一些数据来模拟图片内容
  for (let i = 0; i < size; i++) {
    buffer[i] = Math.floor(Math.random() * 256);
  }
  
  const filepath = path.join(__dirname, 'test-images', filename);
  fs.writeFileSync(filepath, buffer);
  
  console.log(`✅ 创建测试图片: ${filename} (${sizeKB}KB)`);
  return filepath;
}

// 创建不同大小的测试图片
function createTestImages() {
  console.log('📸 创建测试图片...\n');
  
  // 确保目录存在
  const testDir = path.join(__dirname, 'test-images');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  const images = [
    { size: 200, name: 'small-avatar.jpg', desc: '小文件 (< 500KB)' },
    { size: 600, name: 'medium-avatar.jpg', desc: '中等文件 (500KB - 1MB)' },
    { size: 1500, name: 'large-avatar.jpg', desc: '大文件 (1MB - 2MB)' },
    { size: 3000, name: 'xlarge-avatar.jpg', desc: '超大文件 (> 2MB)' }
  ];
  
  images.forEach(img => {
    createTestImage(img.size, img.name);
    console.log(`   描述: ${img.desc}`);
    console.log(`   预期压缩: ${img.size > 2000 ? '大幅压缩' : img.size > 1000 ? '适度压缩' : img.size > 500 ? '轻微压缩' : '不压缩'}`);
    console.log('');
  });
  
  console.log('🎯 测试图片创建完成！');
  console.log('现在可以测试头像上传功能了。');
}

// 运行创建脚本
createTestImages();
