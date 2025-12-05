const { rcedit } = require('rcedit');
const path = require('path');

exports.default = async function(context) {
  // 仅在 Windows 平台处理
  if (process.platform !== 'win32') {
    return;
  }

  const appOutDir = context.appOutDir;
  const exePath = path.join(appOutDir, 'CryptoBox.exe');
  const icoPath = path.join(__dirname, '../public/icon.ico');

  console.log('Setting icon for:', exePath);
  
  try {
    await rcedit(exePath, {
      icon: icoPath,
      'version-string': {
        ProductName: 'CryptoBox',
        FileDescription: '开发者加解密工具箱',
        CompanyName: 'CryptoTools',
        LegalCopyright: 'Copyright © 2024',
        OriginalFilename: 'CryptoBox.exe'
      },
      'file-version': '1.0.0',
      'product-version': '1.0.0'
    });
    console.log('✅ Icon set successfully!');
  } catch (err) {
    console.error('❌ Failed to set icon:', err);
  }
};
