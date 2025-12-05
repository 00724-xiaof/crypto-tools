const { rcedit } = require('rcedit');
const path = require('path');
const fs = require('fs');

async function setIcon() {
  const exePath = path.join(__dirname, '../release/win-unpacked/CryptoBox.exe');
  const icoPath = path.join(__dirname, '../public/icon.ico');

  if (fs.existsSync(exePath) && fs.existsSync(icoPath)) {
    try {
      await rcedit(exePath, {
        icon: icoPath,
        'version-string': {
          ProductName: 'CryptoBox',
          FileDescription: '开发者加解密工具箱',
          CompanyName: 'CryptoTools',
          LegalCopyright: 'Copyright © 2024'
        },
        'file-version': '1.0.0',
        'product-version': '1.0.0'
      });
      console.log('Icon set successfully!');
    } catch (err) {
      console.error('Failed to set icon:', err);
    }
  } else {
    console.log('EXE or ICO file not found, skipping icon setting');
  }
}

setIcon();
