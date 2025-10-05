const fs = require('fs');
const path = require('path');

// Copy PWA files to dist folder
const filesToCopy = [
  { src: 'public/manifest.json', dest: 'dist/manifest.json' },
  { src: 'public/service-worker.js', dest: 'dist/service-worker.js' },
  { src: 'public/icon-192.png', dest: 'dist/icon-192.png' },
  { src: 'public/icon-512.png', dest: 'dist/icon-512.png' }
];

filesToCopy.forEach(({ src, dest }) => {
  const srcPath = path.join(__dirname, '..', src);
  const destPath = path.join(__dirname, '..', dest);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✓ Copied ${src} to ${dest}`);
  } else {
    console.warn(`⚠ File not found: ${src}`);
  }
});

console.log('✓ PWA files copied successfully!');
