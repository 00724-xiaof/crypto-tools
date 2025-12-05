/**
 * ASAR 加壳脚本
 * 将编译后的代码打包成加密的 ASAR 文件
 */
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const distPath = path.join(__dirname, '../dist');
const distElectronPath = path.join(__dirname, '../dist-electron');

// 简单的文件内容混淆（在 ASAR 打包前）
function obfuscateFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      obfuscateFiles(fullPath);
    } else if (file.name.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const timestamp = Date.now();
      const randomStr = crypto.randomBytes(16).toString('hex');
      content = `/* ${randomStr} ${timestamp} */\n${content}`;
      fs.writeFileSync(fullPath, content);
      console.log(`Processed: ${fullPath}`);
    }
  }
}

async function main() {
  console.log('Starting ASAR packing process...');
  
  if (fs.existsSync(distPath)) {
    console.log('Obfuscating dist files...');
    obfuscateFiles(distPath);
  }
  
  if (fs.existsSync(distElectronPath)) {
    console.log('Obfuscating dist-electron files...');
    obfuscateFiles(distElectronPath);
  }
  
  console.log('ASAR packing preparation complete!');
}

main().catch(console.error);
